import crypto from 'crypto';
import { db } from '../database.ts';
import { generateToken, setAuthCookie } from './middleware.ts';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn('Google OAuth credentials not found in environment variables');
}

// Store for OAuth state tokens (in production, use Redis or database)
const oauthStates = new Map();

// Clean up expired state tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

// Initiate OAuth flow
export const initiateGoogleAuth = (req, res) => {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    oauthStates.set(state, { timestamp: Date.now() });

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'select_account');

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    res.status(500).json({ error: 'Failed to initiate authentication' });
  }
};

// Handle OAuth callback
export const handleGoogleCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    // Check for OAuth errors
    if (oauthError) {
      console.error('OAuth error:', oauthError);
      return res.redirect('/login?error=oauth_failed');
    }

    // Validate state parameter (CSRF protection)
    if (!state || !oauthStates.has(state)) {
      console.error('Invalid or missing OAuth state parameter');
      return res.redirect('/login?error=invalid_state');
    }
    
    // Clean up used state
    oauthStates.delete(state);

    // Validate code parameter
    if (!code) {
      console.error('Missing OAuth code parameter');
      return res.redirect('/login?error=missing_code');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return res.redirect('/login?error=token_exchange_failed');
    }

    // Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', profileData);
      return res.redirect('/login?error=profile_fetch_failed');
    }

    // Create or update user in our database
    const user = await db.createOrUpdateUserFromGoogle({
      id: profileData.id,
      email: profileData.email,
      name: profileData.name,
      picture: profileData.picture,
    });

    // Generate JWT token
    const jwtToken = generateToken(user);

    // Set secure cookie
    setAuthCookie(res, jwtToken);

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('/login?error=internal_error');
  }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    // User info is added by authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return user data without sensitive info
    const { google_id, ...safeUserData } = req.user;
    res.json(safeUserData);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import styles from './Login.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for error parameters from OAuth callback
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_failed: 'Authentication failed. Please try again.',
        invalid_state: 'Invalid authentication state. Please try again.',
        missing_code: 'Missing authorization code. Please try again.',
        token_exchange_failed: 'Failed to exchange tokens. Please try again.',
        profile_fetch_failed: 'Failed to fetch profile information. Please try again.',
        internal_error: 'An internal error occurred. Please try again.',
      };
      setError(errorMessages[errorParam] || 'An unknown error occurred. Please try again.');
    }

    // Check if user is already authenticated
    checkAuth();
  }, [navigate, searchParams]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        // User is already authenticated, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      // User is not authenticated, stay on login page
      console.log('User not authenticated');
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    
    // Redirect to Google OAuth
    window.location.href = '/auth/google';
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <Card>
          <CardHeader className={styles.header}>
            <CardTitle className={styles.title}>Welcome to CWC Dashboard</CardTitle>
            <CardDescription className={styles.description}>
              Sign in to access your social media analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.content}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}
            
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={styles.googleButton}
              size="lg"
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <div className={styles.features}>
              <h3>What you'll get access to:</h3>
              <ul>
                <li>📊 Real-time social media analytics</li>
                <li>🤖 AI-powered content analysis</li>
                <li>📈 Performance tracking across platforms</li>
                <li>💡 Personalized content recommendations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
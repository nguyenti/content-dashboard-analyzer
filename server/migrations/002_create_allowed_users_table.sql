-- Create allowed_users table for managing who can register
CREATE TABLE allowed_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on email for fast lookups
CREATE INDEX idx_allowed_users_email ON allowed_users(email);

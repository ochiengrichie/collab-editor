CREATE TABLE collab_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  google_id TEXT,
  auth_provider TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

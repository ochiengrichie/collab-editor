CREATE TABLE document_members (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES collab_users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (document_id, user_id)
);

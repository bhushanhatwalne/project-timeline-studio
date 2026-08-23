CREATE TABLE IF NOT EXISTS mcp_oauth_clients (
  client_id  VARCHAR(255) PRIMARY KEY,
  metadata   JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

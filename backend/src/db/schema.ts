export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  email         text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- one account per address regardless of letter case
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));

-- only a sha256 of each refresh token is kept, so a leaked table cannot be replayed
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_hash text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens (user_id);

-- set when the token is exchanged; it keeps working for a short grace period (see token.service.ts)
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS replaced_at timestamptz;

-- a collage; the id is made in the browser so the editor can open it before the save lands
CREATE TABLE IF NOT EXISTS projects (
  id          text PRIMARY KEY CHECK (id ~ '^p-[A-Za-z0-9_-]{1,40}$'),
  user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  category    text NOT NULL,
  template_id text,
  doc         jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  opened_at   timestamptz,
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS favorites (
  user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  template_id text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, template_id)
);

-- the user's uploaded photos; the file itself is in the Supabase Storage bucket "photos" at \`path\`
CREATE TABLE IF NOT EXISTS photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  path       text NOT NULL UNIQUE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS photos_user_id_idx ON photos (user_id, created_at DESC);

-- a surprise page a friend opens from a QR code. The collages are JPEG snapshots in the "gifts"
-- bucket, so editing or deleting a project later never changes a gift that was already given.
CREATE TABLE IF NOT EXISTS gifts (
  id         text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9]{10}$'),
  user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipient  text NOT NULL CHECK (length(recipient) BETWEEN 1 AND 60),
  occasion   text NOT NULL,
  message    text NOT NULL CHECK (length(message) BETWEEN 1 AND 2000),
  signature  text NOT NULL DEFAULT '',
  finale     text NOT NULL CHECK (length(finale) BETWEEN 1 AND 80),
  animation  text NOT NULL CHECK (animation IN ('envelope', 'box', 'cake')),
  music      jsonb,
  collages   jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gifts_user_id_idx ON gifts (user_id, created_at DESC);

-- a mini game the friend plays before the surprise opens; older gifts open straight away
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS game text NOT NULL DEFAULT 'none'
  CHECK (game IN ('none', 'scratch', 'puzzle', 'tictactoe'));

-- Supabase exposes the public schema through its Data API: with RLS on and no policies,
-- anon/authenticated keys see nothing, while the table owner this API connects as is unaffected.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
`

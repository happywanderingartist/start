CREATE SCHEMA IF NOT EXISTS start_accounts;
CREATE TABLE IF NOT EXISTS start_accounts.users (
  id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS start_accounts.auth_identities (
  provider text NOT NULL CHECK (provider ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  subject text NOT NULL CHECK (length(subject) BETWEEN 1 AND 255),
  user_id uuid NOT NULL REFERENCES start_accounts.users(id),
  PRIMARY KEY(provider,subject)
);
CREATE TABLE IF NOT EXISTS start_accounts.profiles (
  user_id uuid PRIMARY KEY REFERENCES start_accounts.users(id),
  nickname text NOT NULL DEFAULT '旅行者' CHECK(length(nickname) BETWEEN 1 AND 24),
  artists text NOT NULL DEFAULT '' CHECK(length(artists)<=120),
  interests text NOT NULL DEFAULT '' CHECK(length(interests)<=120),
  privacy jsonb NOT NULL DEFAULT '{"artists":false,"interests":false,"book":false}'::jsonb
    CHECK(jsonb_typeof(privacy)='object' AND privacy ?& ARRAY['artists','interests','book']
      AND privacy - ARRAY['artists','interests','book']='{}'::jsonb
      AND jsonb_typeof(privacy->'artists')='boolean'
      AND jsonb_typeof(privacy->'interests')='boolean'
      AND jsonb_typeof(privacy->'book')='boolean'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON SCHEMA start_accounts FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA start_accounts FROM PUBLIC;

-- โครงสร้างฐานข้อมูล (รันซ้ำได้ ไม่ลบข้อมูลเดิม)

CREATE TABLE IF NOT EXISTS group_info (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  tagline       TEXT,
  concept       TEXT,
  highlights    TEXT[] NOT NULL DEFAULT '{}',
  contact_email TEXT,
  contact_github TEXT,
  contact_other TEXT
);

CREATE TABLE IF NOT EXISTS members (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  nickname    TEXT,
  role        TEXT NOT NULL,
  bio         TEXT,
  skills      TEXT[] NOT NULL DEFAULT '{}',
  avatar_url  TEXT,
  github_url  TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

-- member_id = NULL หมายถึงผลงานของกลุ่ม
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  member_id   INT REFERENCES members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  tech        TEXT[] NOT NULL DEFAULT '{}',
  link        TEXT
);

CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, id);

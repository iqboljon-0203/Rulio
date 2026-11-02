-- ============================================
-- RULIO — Database Schema (Cloudflare D1 / SQLite)
-- ============================================

-- Foydalanuvchilar
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'school_admin')),
  school_id TEXT,
  language TEXT DEFAULT 'uz-lat',
  subscription_plan TEXT DEFAULT 'free' CHECK(subscription_plan IN ('free', '2_week', '1_month', '3_month')),
  subscription_expires_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Avtomaktablar (B2B)
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  plan TEXT DEFAULT 'basic' CHECK(plan IN ('basic', 'pro', 'enterprise')),
  max_students INTEGER DEFAULT 50,
  active_students INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Savollar
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  ticket_number INTEGER NOT NULL,
  question_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  text_uz_lat TEXT NOT NULL,
  text_uz_cyr TEXT,
  text_ru TEXT,
  image_url TEXT,
  correct_answer INTEGER NOT NULL CHECK(correct_answer >= 0 AND correct_answer <= 3),
  explanation_uz_lat TEXT,
  explanation_uz_cyr TEXT,
  explanation_ru TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Javob variantlari
CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  answer_index INTEGER NOT NULL CHECK(answer_index >= 0 AND answer_index <= 3),
  text_uz_lat TEXT NOT NULL,
  text_uz_cyr TEXT,
  text_ru TEXT,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Test natijalari
CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK(test_type IN ('ticket', 'random', 'category')),
  ticket_number INTEGER,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  skipped INTEGER DEFAULT 0,
  time_spent INTEGER,
  passed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Foydalanuvchi javoblari
CREATE TABLE IF NOT EXISTS user_answers (
  id TEXT PRIMARY KEY,
  test_result_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer INTEGER,
  is_correct INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Saqlangan savollar
CREATE TABLE IF NOT EXISTS saved_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(user_id, question_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- To'lovlar
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('payme', 'click', 'uzum')),
  provider_transaction_id TEXT,
  amount INTEGER NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('2_week', '1_month', '3_month')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled', 'refunded')),
  created_at INTEGER DEFAULT (unixepoch()),
  completed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_questions_ticket ON questions(ticket_number);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_user_answers_test ON user_answers(test_result_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_saved_questions_user ON saved_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

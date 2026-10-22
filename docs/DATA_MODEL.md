# LifeOS — Ma'lumotlar Modeli (SQL Schema)

> Supabase PostgreSQL uchun toliq jadvallar va sxema

---

## 📋 Asosiy Jadvallar (Core Tables)

### `profiles` — Foydalanuvchi Profili
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Tashkent',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `user_progress` — XP, Daraja va Baqoyishlar
```sql
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  achievements JSONB DEFAULT '[]',
  life_score_history JSONB DEFAULT '[]',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `habits` — Odatlar
```sql
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily' 
    CHECK (frequency IN ('daily', 'weekly', 'custom')),
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT '✅',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Har odat uchun eng ajralash mavzusi: 21 kunga yetaylik, 66 kunga avtomatiklashtirib, 90 kunga yashash
```

### `habit_logs` — Odat Kiziqlishi
```sql
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (habit_id, date)
);
```

---

## 📚 1. SOC Analyst Moduli (56 kunlik reja)

### `soc_plans` — SOC Analyst Rejalari
```sql
CREATE TABLE IF NOT EXISTS soc_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "SOC Analyst 56-Day"
  description TEXT,
  total_days INTEGER DEFAULT 56,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  started_at DATE DEFAULT (current_date),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `soc_tasks` — SOC Vazifalari
```sql
CREATE TABLE IF NOT EXISTS soc_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES soc_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 56),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'cybersecurity'
    CHECK (category IN ('networking', 'threat_detection', 'incident_response', 'forensics')),
  resources JSONB DEFAULT '[]',  -- URLs, articles, videos
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `soc_progress` — Kunlik Progress
```sql
-- Har kunda jazolan progress
CREATE TABLE IF NOT EXISTS soc_daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES soc_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  notes TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_tasks JSONB DEFAULT '[]',
  streak INTEGER DEFAULT 0,
  date DATE DEFAULT (current_date),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (plan_id, day_number)
);
```

---

## 📚 2. IELTS Moduli

### `ielts_plans` — IELTS Rejalari
```sql
CREATE TABLE IF NOT EXISTS ielts_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "IELTS 7.5+ Prep"
  description TEXT,
  exam_date DATE,
  current_band NUMERIC(3, 1) DEFAULT 6.0,
  target_band NUMERIC(3, 1) DEFAULT 7.5,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `ielts_tasks` — IELTS Vazifalari
```sql
CREATE TABLE IF NOT EXISTS ielts_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES ielts_plans(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL
    CHECK (task_type IN ('writing_task1', 'writing_task2', 'speaking_part1', 
                         'speaking_part2', 'speaking_part3', 'vocabulary', 'grammar')),
  title TEXT NOT NULL,
  description TEXT,
  target_minutes INTEGER,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  submitted_at TIMESTAMPTZ,
  ai_feedback JSONB DEFAULT '{}',  -- Claude feedback
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `ielts_vocab` — Vocabulary Flashcards (SM-2)
```sql
CREATE TABLE IF NOT EXISTS ielts_vocab (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  example_sentence TEXT,
  easiness_factor NUMERIC(3, 2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review DATE NOT NULL,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('writing', 'speaking', 'reading', 'listening')),
  learned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indeks: oxirgi ko'rish t datetime
CREATE INDEX IF NOT EXISTS idx_ielts_vocab_next_review 
  ON ielts_vocab (next_review) WHERE learned = false;
```

---

## ⏱️ 3. Vaqt (Time) Moduli

### `time_blocks` — Vaqt Bloklari
```sql
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  block_type TEXT DEFAULT 'work'
    CHECK (block_type IN ('work', 'study', 'break', 'personal', 'exercise')),
  task_id UUID REFERENCES tasks(id),
  priority INTEGER DEFAULT 3
    CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `time_logs` — Vaqt Kiziqlishi
```sql
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id),
  time_block_id UUID REFERENCES time_blocks(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `pomodoros` — Pomodoro Sessiyalari
```sql
CREATE TABLE IF NOT EXISTS pomodoros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id),
  work_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  completed_pomodoros INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 💰 4. Moliyaga (Finance) Moduli

### `budget_categories` — Budget Kategoriyalarari
```sql
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Transport", "Oziq-ovqat", etc.
  allocated_amount NUMERIC(12, 2) DEFAULT 0,
  month DATE DEFAULT (date_trunc('month', current_date)),
  actual_amount NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `transactions` — Xarajat/Havo Kirishi
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT DEFAULT 'expense'
    CHECK (type IN ('income', 'expense')),
  description TEXT,
  date DATE DEFAULT (current_date),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `savings_goals` — Jamg'arma Maqsadlari
```sql
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Laptop", "Emergency Fund"
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  target_date DATE,
  saved_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
    (current_amount / target_amount) * 100
  ) STORED,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `debts` — Qarzlar
```sql
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Car loan", "Credit card"
  total_amount NUMERIC(12, 2) NOT NULL,
  remaining_amount NUMERIC(12, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) DEFAULT 0,
  monthly_payment NUMERIC(12, 2) DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'paid_off')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `subscriptions` — Obunalar
```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Netflix", "Spotify"
  amount NUMERIC(12, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly'
    CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_billing_date DATE NOT NULL,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🎯 5. Maqsadlar (Goals + OKR) Moduli

### `goals` — Asosiy Maqsadlar
```sql
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal'
    CHECK (category IN ('career', 'finance', 'health', 'learning', 'personal')),
  target_date DATE,
  progress INTEGER DEFAULT 0
    CHECK (progress BETWEEN 0 AND 100),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `key_results` — Amaal (Key Results)
```sql
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,  -- "hours", "tasks", "so'm"
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📖 6. O'qish (Study) Moduli

### `study_sessions` — O'qish Sessiyalari
```sql
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL,  -- "Cybersecurity", "IELTS Writing"
  subject_category TEXT
    CHECK (subject_category IN ('cybersecurity', 'ielts', 'personal_dev')),
  duration_minutes INTEGER NOT NULL,
  focus_areas TEXT[] DEFAULT '[]',  -- Resource types used
  notes TEXT,
  date DATE DEFAULT (current_date),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `flashcards` — Flashcards (SM-2 Algorithm)
```sql
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  front TEXT NOT NULL,  -- Savol/So'rov
  back TEXT NOT NULL,   -- Javob/Awtori
  deck_name TEXT DEFAULT 'General',
  easiness_factor NUMERIC(3, 2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review DATE NOT NULL,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'ielts_vocab', 'soc_terms', 'programming')),
  learned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indeks: oxirgi ko'rish vaqtini tekshirish
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review
  ON flashcards (next_review) WHERE learned = false;
```

### `study_plans` — O'qish Rejalari
```sql
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "SOC Analyst 56-Day", "IELTS 7.5+"
  subject TEXT NOT NULL,
  total_units INTEGER DEFAULT 56,
  current_unit INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  started_at DATE DEFAULT (current_date),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `study_units` — Rejalarning Unitlari (Kunlar/Lessonlar)
```sql
CREATE TABLE IF NOT EXISTS study_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  unit_number INTEGER NOT NULL CHECK (unit_number BETWEEN 1 AND 56),
  title TEXT NOT NULL,
  description TEXT,
  resources JSONB DEFAULT '[]',  -- URLs, articles, videos
  estimated_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `certifications` — Sertifikatlar
```sql
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "CompTIA Security+", "IELTS 7.5"
  category TEXT DEFAULT 'professional'
    CHECK (category IN ('cybersecurity', 'english', 'programming', 'management')),
  target_date DATE,
  score TEXT,
  passed_date DATE,
  status TEXT DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'passed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🏃 7. Sog'liq (Health) Moduli

### `health_logs` — Sog'lik Kiziqlishi
```sql
CREATE TABLE IF NOT EXISTS health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours NUMERIC(3, 1),  -- 0-24 or null
  energy_level INTEGER 
    CHECK (energy_level BETWEEN 1 AND 10),
  weight_kg NUMERIC(5, 2),
  exercise_minutes INTEGER DEFAULT 0,
  water_glasses INTEGER DEFAULT 0,  -- Goal: 8
  mood TEXT DEFAULT 'ok'
    CHECK (mood IN ('great', 'ok', 'bad')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);
```

### `health_goals` — Sog'lik Maqsadlari
```sql
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Lose 5kg", "Sleep 8 hours"
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,  -- "kg", "hours", "days"
  target_date DATE,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🏆 8. Progress (Gamification) Moduli

### `achievements` — Sertifikatlar (Achievement Definition)
```sql
CREATE TABLE IF NOT EXISTS achievements_definition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,  -- "first_task", "week_streak_7"
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('tasks', 'habits', 'study', 'finance', 'health')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `user_achievements` — Foydalanuvchi Sertifikatlari
```sql
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements_definition(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
```

### `xp_events` — XP Davolari
```sql
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  action_type TEXT NOT NULL,  -- "task_complete", "habit_done", etc.
  xp_earned INTEGER NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📁 9. Fayl Saralash (File Storage)

### `file_categories` — Fayl Kategoriyalari
```sql
CREATE TABLE IF NOT EXISTS file_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,  -- "Document", "Screenshot", "Recording"
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `user_files` — Foydalanuvchi Fayllari
```sql
CREATE TABLE IF NOT EXISTS user_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  category_id UUID REFERENCES file_categories(id),
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  related_type TEXT,  -- "habit_log", "flashcard", etc.
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 10. Ai Chat Log (AI Interaksiyalar)

### `ai_chat_log` — AI suhbatlari
```sql
CREATE TABLE IF NOT EXISTS ai_chat_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL  -- "user", "assistant"
  content TEXT NOT NULL,
  provider TEXT DEFAULT 'anthropic',  -- "anthropic", "openai"
  model TEXT DEFAULT 'claude-3-5-sonnet-20240620',
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📊 11. Statistika / Analytics

### `daily_logs` — Kunlik Progress (Timing, Finans, Odatlar)
```sql
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  tech_minutes INTEGER DEFAULT 0,
  ielts_minutes INTEGER DEFAULT 0,
  study_minutes INTEGER DEFAULT 0,
  habit_count INTEGER DEFAULT 0,  -- Completed habits
  streak INTEGER DEFAULT 0,
  life_score INTEGER DEFAULT 0,  -- 0-100 hisoblangan
  mood TEXT DEFAULT 'ok'
    CHECK (mood IN ('great', 'ok', 'bad')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);
```

---

## 🔄 Jadvallar Aralashuvi (Relationship Summary)

```
users ── profiles (1:1)
users ── habits (1:N)
users ── habit_logs (1:N)
users ── ielts_plans (1:N)
users ── ielts_tasks (1:N)
users ── ielts_vocab (1:N)
users ── time_blocks (1:N)
users ── time_logs (1:N)
users ── pomodoros (1:N)
users ── budget_categories (1:N)
users ── transactions (1:N)
users ── savings_goals (1:N)
users ── debts (1:N)
users ── subscriptions (1:N)
users ── goals (1:N)
users ── key_results (1:N)
users ── study_sessions (1:N)
users ── flashcards (1:N)
users ── study_plans (1:N)
users ── study_units (1:N)
users ── certifications (1:N)
users ── health_logs (1:N)
users ── health_goals (1:N)
users ── user_progress (1:1)
users ── achievements_definition (N:M via user_achievements)
users ── user_achievements (1:N)
users ── xp_events (1:N)
users ─┤ daily_logs (1:1)
users ─┤ file_categories (1:N)
users ─┤ user_files (1:N)
```

Bu DATA_MODEL.md — barcha jadvallarni, ularning ustunlarini va bog'lanishlarini ifodasi. Migrations (0001.sql -> 0009.sql) quyidagilarga ajratilgan bo'lishi kerak.
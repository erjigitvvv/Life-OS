# LifeOS — Texnik Spetsifikatsiya

> Barcha modullar, ekranlar, funksiyalar va qoidalarning to'liq tavsifi

---

## 📱 Ekranlar va Navigatsiya

### Sidebar Navigation
```
┌─────────────────────┐
│ 🏠 Today            │ ← Default landing
│ 📋 Board            │
│ ⏱️  Time             │
│ 💰 Finance          │
│ ✅ Habits           │
│ 📚 Study            │
│ 📈 Kaizen           │
│ 🎯 Goals            │
│ 🏆 Progress         │
│ 📊 Review           │
│ ⚙️  Settings         │
└─────────────────────┘
```

---

## 1️⃣ Today (Dashboard)

### Layout
```
┌────────────────────────────────────────────────────┐
│  Life Score: 78/100  🔥 Streak: 12  ⚡ XP: 1,240  │
├────────────────────────────────────────────────────┤
│  📅 2026-10-22 Chorshanba                         │
├────────────────────────────────────────────────────┤
│  🎯 Top-3 Tasks                                    │
│  ☑ [x] SOC: SIEM log analysis (2h)                │
│  ☐ [ ] IELTS Writing Task 2 (1h)                  │
│  ☐ [ ] Review fraud detection algo                │
├────────────────────────────────────────────────────┤
│  ✅ Habits (3/5)                                   │
│  [x] Morning routine  [x] Deep work  [ ] Exercise │
├────────────────────────────────────────────────────┤
│  ⏱️ Time Today                                     │
│  Tech: 2h 30m / 4h    IELTS: 0h / 1h              │
├────────────────────────────────────────────────────┤
│  💰 Finance Status                                 │
│  Budget: 65% (1,950,000 / 3,000,000 so'm)         │
│  Jamg'arma: 12,000,000 so'm (Goal: 50M)           │
├────────────────────────────────────────────────────┤
│  🤖 AI Insight                                     │
│  "Sizning IELTS vaqtingiz past. Bugun 1 soat     │
│   qo'shing — haftaning o'rtasi eng samarali!"     │
└────────────────────────────────────────────────────┘
```

### Features
- **Quick Add**: Cmd+K → task/habit/time
- **AI Daily Briefing**: Har ertalab AI maslahat
- **Progress Rings**: Vizual progress (CSS conic-gradient)

---

## 2️⃣ Board (Tasks / Kanban)

### Data Model
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'done', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  track_id UUID REFERENCES tracks(id),  -- Project/Track
  tags TEXT[],
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Views
1. **Backlog** — barcha todo'lar (priority tartibda)
2. **Kanban** — To Do | In Progress | Done
3. **Calendar** — due_date bo'yicha
4. **Track** — project bo'yicha guruhlangan

### Drag & Drop
- React DnD yoki dnd-kit
- Status o'zgarganda → XP olish
- Animation: Framer Motion

### Quick Capture
- Telegram bot: `/task Title of task #tag @track`
- AI parse qiladi va to'g'ri maydonlarni to'ldiradi

---

## 3️⃣ Time Management

### Data Model
```sql
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  block_type TEXT DEFAULT 'work' CHECK (block_type IN ('work', 'study', 'break', 'personal')),
  task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES tasks(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES tasks(id),
  work_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  completed_pomodoros INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed'))
);
```

### Features
1. **Pomodoro Timer**
   - 25/5 default, custom qilib sozlash
   - Tovush + browser notification
   - Task bilan bog'lash

2. **Time Blocking**
   - Kunlik kalendar view
   - Drag to create block
   - AI suggests optimal blocks

3. **Time Log**
   - Manual log: task + start/end time
   - Auto log: running timer
   - Reports: daily, weekly, monthly

### Reports
- **Daily**: qaysi tasklarga qancha vaqt
- **Weekly**: Tech vs IELTS vs Personal
- **Monthly**: trend chart (Recharts)

---

## 4️⃣ Finance

### Data Model
```sql
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  allocated_amount NUMERIC(12, 2) NOT NULL,
  month DATE NOT NULL,  -- 2026-10-01 format
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES budget_categories(id),
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  remaining_amount NUMERIC(12, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) DEFAULT 0,
  monthly_payment NUMERIC(12, 2),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_billing_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Features
1. **Budget**
   - Oylik kategoriyalar: Oziq-ovqat, Transport, Ko'ngilochar, etc.
   - Har kategoriya progress bar
   - AI: "Transport budget tugadi, 500k qo'shing yoki kamaytirib turing"

2. **Transactions**
   - Quick add: amount, category, description
   - CSV import (bank statements)
   - Chart: income vs expense (monthly)

3. **Savings Goals**
   - Multiple goals: "Laptop", "Emergency Fund", "Vacation"
   - Progress ring
   - Projected date: "If you save 500k/month, you'll reach goal by 2027-03"

4. **Debts**
   - Track multiple debts
   - Payoff calculator: "If you pay 1M/month, debt-free in 8 months"
   - Interest calculation

5. **Subscriptions**
   - Reminder: "Netflix billing in 3 days"
   - Yearly cost: "You spend 1,200,000 so'm/year on subscriptions"

6. **Net Worth**
   - Assets (savings, investments) - Liabilities (debts)
   - Chart: trend over time

---

## 5️⃣ Habits

### Data Model
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days TEXT[],  -- ['monday', 'wednesday', 'friday']
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT '✅',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);
```

### Features
1. **Habit Creation**
   - Name, frequency, target days
   - Color + icon picker

2. **Daily Check**
   - Today view: habit checkbox list
   - One-tap complete
   - Streak calculation

3. **Streak**
   - Current streak: ketma-ket qilingan kunlar
   - Longest streak: eng uzun davomiy
   - Visual calendar: GitHub-style heatmap

4. **Habit Formation Science**
   - 21 days: yangi odat shakllanadi
   - 66 days: avtomatiklashtirish
   - 90 days: lifestyle bo'ladi
   - Progress indicator: "38/66 days — halfway there!"

5. **AI Coaching**
   - "Siz har kuni 7 AM da exercise qilasiz. Kechqurun ko'proq muvaffaqiyatli bo'lasiz?"

---

## 6️⃣ Study Module

### Sub-modules
1. **SOC Analyst (56-day plan)**
2. **IELTS (Writing, Speaking, Vocab, Grammar)**
3. **Flashcards (SM-2 spaced repetition)**
4. **Study Log**
5. **Certifications**

### Data Model
```sql
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,  -- "SOC Analyst 56-Day"
  description TEXT,
  total_days INTEGER,
  current_day INTEGER DEFAULT 1,
  started_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES study_plans(id) NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resources TEXT[],  -- URLs
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  front TEXT NOT NULL,  -- Question
  back TEXT NOT NULL,   -- Answer
  deck TEXT DEFAULT 'General',
  easiness_factor REAL DEFAULT 2.5,  -- SM-2 algorithm
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  subject TEXT NOT NULL,  -- "Cybersecurity", "IELTS Writing"
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,  -- "CompTIA Security+"
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'passed', 'failed')),
  target_date DATE,
  passed_date DATE,
  score TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### SOC Analyst Plan
56 kunlik reja roadmap.sh dan import qilinadi:
- Day 1-14: Networking & System Fundamentals
- Day 15-28: Threat Detection & SIEM
- Day 29-42: Incident Response & Forensics
- Day 43-56: Hands-on Labs & Portfolio Projects

Har kun:
- Title
- Description
- Resources (TryHackMe, YouTube, articles)
- Checkbox: ✅ Completed

### IELTS Module
1. **Writing**
   - Task 1 (letters, graphs)
   - Task 2 (essays)
   - Submit essay → AI feedback (Claude)
   - Common errors log

2. **Speaking**
   - Part 1, 2, 3 prompts
   - Record audio (Web Audio API)
   - AI transcription (Whisper API)
   - Fluency + grammar analysis

3. **Vocabulary**
   - Flashcards (Band 7-8 words)
   - Spaced repetition (SM-2)
   - Usage examples

4. **Grammar**
   - Exercises
   - Error log: "Always forget articles (a/an/the)"

### Flashcards (SM-2 Algorithm)
```ts
// packages/rules/sm2.ts
export function calculateNextReview(
  quality: number, // 0-5 (5 = perfect recall)
  easinessFactor: number,
  interval: number,
  repetitions: number
): { easinessFactor: number; interval: number; repetitions: number; nextReview: Date } {
  let ef = easinessFactor
  let rep = repetitions
  let int = interval

  if (quality >= 3) {
    if (rep === 0) {
      int = 1
    } else if (rep === 1) {
      int = 6
    } else {
      int = Math.round(interval * easinessFactor)
    }
    rep += 1
  } else {
    rep = 0
    int = 1
  }

  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + int)

  return { easinessFactor: ef, interval: int, repetitions: rep, nextReview }
}
```

---

## 7️⃣ Kaizen + Weekly AI Review

### Data Model
```sql
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  week_start DATE NOT NULL,  -- Monday
  week_end DATE NOT NULL,    -- Sunday
  wins TEXT[],
  challenges TEXT[],
  lessons_learned TEXT[],
  next_week_focus TEXT[],
  ai_insights TEXT,
  life_score_avg NUMERIC(4, 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Workflow
Har yakshanba kechqurun (cron):
1. **Haftalik data to'plash**
   - Tasks completed: 23/30
   - Time logged: Tech 18h, IELTS 5h
   - Habits: 85% completion
   - Finance: Budget 92% spent
   - Life Score avg: 76

2. **AI Review (Claude Agent)**
   Prompt:
   ```
   User's week data:
   - Tasks: 23/30 completed
   - Tech: 18h, IELTS: 5h
   - Habits: 85%
   - Budget: 92% spent
   
   Generate:
   1. Wins (3 ta)
   2. Challenges (2-3 ta)
   3. Lessons learned
   4. Next week focus (actionable items)
   ```

3. **User Review**
   Foydalanuvchi o'z fikrlarini qo'shadi

4. **Next Week Plan**
   AI: "Based on this week, here's your optimized plan..."

### Kaizen Philosophy
- 1% better every day
- Small, incremental improvements
- Reflect → Adjust → Improve loop

---

## 8️⃣ Goals + OKR

### Data Model
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal' CHECK (category IN ('career', 'finance', 'health', 'learning', 'personal')),
  target_date DATE,
  progress INTEGER DEFAULT 0,  -- 0-100
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) NOT NULL,
  title TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,  -- "hours", "tasks", "so'm"
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### OKR Example
**Objective**: "Land a job at Bank as SOC Analyst"
- **KR1**: Complete SOC 56-day plan (56/56 days) ✅
- **KR2**: Pass IELTS with 7.0+ band (current: 6.0) 🔄
- **KR3**: Build 3 portfolio projects (2/3) 🔄
- **KR4**: Apply to 10 companies (5/10) 🔄

### Features
- Deadline countdown
- Progress visualization
- Link to tasks: "Which tasks contribute to this goal?"
- AI suggestions: "To hit KR2, focus on Writing Task 2"

---

## 9️⃣ Health Module

### Data Model
```sql
CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  sleep_hours NUMERIC(3, 1),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  weight_kg NUMERIC(5, 2),
  exercise_minutes INTEGER,
  water_glasses INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### Features
1. **Sleep Tracking**
   - Hours slept
   - Sleep quality (1-10)
   - Correlation: "When you sleep 7+ hours, Life Score is 15% higher"

2. **Energy Level**
   - Morning, afternoon, evening check-ins
   - Chart: energy vs time of day

3. **Exercise**
   - Minutes logged
   - Type: cardio, strength, yoga
   - Streak

4. **Weight Tracking**
   - BMI calculator
   - Trend chart

5. **Water Intake**
   - Goal: 8 glasses/day
   - Reminder notifications

---

## 🔟 Progress (Gamification)

### Data Model
```sql
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  achievements TEXT[],  -- ['first_task', 'week_streak_7', ...]
  life_score_history JSONB,  -- Daily scores
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  action_type TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### XP System
```ts
// packages/rules/xp.ts
export const XP_REWARDS = {
  task_complete_low: 5,
  task_complete_medium: 10,
  task_complete_high: 20,
  task_complete_urgent: 30,
  habit_done: 5,
  habit_streak_7: 50,
  habit_streak_30: 200,
  study_session_30min: 10,
  pomodoro_complete: 5,
  weekly_review_done: 100,
  goal_complete: 500,
}
```

### Level System
```ts
// packages/rules/level.ts
export function calculateLevel(xp: number): number {
  // Level 1: 0-99 XP
  // Level 2: 100-299 XP
  // Level 3: 300-599 XP
  // Formula: XP = 100 * level * (level - 1)
  return Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2)
}

export function xpForNextLevel(currentLevel: number): number {
  return 100 * currentLevel * (currentLevel + 1) - xpForLevel(currentLevel)
}
```

### Achievements
```ts
export const ACHIEVEMENTS = [
  { id: 'first_task', name: 'Getting Started', description: 'Complete your first task', icon: '🎉', xp: 10 },
  { id: 'week_streak_7', name: '7-Day Warrior', description: '7-day streak', icon: '🔥', xp: 50 },
  { id: 'century', name: 'Century', description: 'Complete 100 tasks', icon: '💯', xp: 200 },
  { id: 'early_bird', name: 'Early Bird', description: 'Log time before 8 AM for 7 days', icon: '🌅', xp: 75 },
  { id: 'budget_master', name: 'Budget Master', description: 'Stay under budget for 3 months', icon: '💰', xp: 150 },
  // ... 50+ achievements
]
```

### Life Score Calculation
```ts
// packages/rules/life-score.ts
export function calculateLifeScore(data: DailyData): number {
  let score = 0
  
  // Tasks (max 25)
  const tasksPct = Math.min(1, data.tasksCompleted / 5)
  score += tasksPct * 25
  
  // Time (max 20)
  const timePct = Math.min(1, data.minutesLogged / 240) // 4 hours
  score += timePct * 20
  
  // Habits (max 20)
  const habitsPct = data.habitsCompleted / data.habitsTotal
  score += habitsPct * 20
  
  // Study (max 15)
  const studyPct = Math.min(1, data.studyMinutes / 60)
  score += studyPct * 15
  
  // Health (max 10)
  if (data.sleepHours >= 7) score += 5
  if (data.exerciseMinutes >= 30) score += 5
  
  // Finance (max 10)
  if (data.budgetSpent <= data.budgetAllocated) score += 10
  
  return Math.round(score)
}
```

---

## 1️⃣1️⃣ Quick Capture (Telegram Bot)

### Bot Commands
```
/start — Bot boshlash
/task Title of task #tag @track — Task qo'shish
/time 2h on Project X — Vaqt log qilish
/habit morning_routine — Habit belgilash
/budget 50000 Transport — Xarajat log qilish
/goal Check IELTS progress — Maqsad holati
/stats — Bugungi statistika
```

### Workflow
1. User sends message
2. Webhook → Supabase Edge Function
3. AI (Claude) parses message
   ```
   Input: "/task Finish SOC Day 12 #cybersecurity @soc-learning"
   Output: {
     type: 'task',
     title: 'Finish SOC Day 12',
     tags: ['cybersecurity'],
     track: 'soc-learning'
   }
   ```
4. Insert into database
5. Reply: "✅ Task added: Finish SOC Day 12"

### Voice Messages
- Telegram voice → Base64
- Send to Whisper API (OpenAI)
- Transcribe → AI parse → Insert

---

## 📊 Analytics & Reports

### Dashboard Charts (Recharts)
1. **Life Score Trend** (Line chart, 30 days)
2. **XP Progress** (Bar chart, weekly)
3. **Time Distribution** (Pie chart, categories)
4. **Budget vs Actual** (Bar chart, categories)
5. **Habit Heatmap** (Calendar view, GitHub-style)

### Export
- PDF report (React-PDF)
- CSV export (transactions, time logs)
- Markdown export (weekly review → Obsidian)

---

## 🔐 Security & Privacy

### RLS Policies
```sql
-- Users can only see their own data
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Repeat for all tables
```

### Data Encryption
- At rest: Supabase built-in (AES-256)
- In transit: HTTPS (TLS 1.3)
- Sensitive fields: `pgcrypto` extension (optional)

### API Rate Limiting
- Supabase Edge Functions: 1000 req/hour per user
- Anthropic API: 10 req/min per user
- Telegram webhook: signed secret

---

## 🌐 i18n (Future)

### Supported Languages
- Uzbek (uz) — default
- English (en)
- Russian (ru)

### Implementation
- `next-intl` library
- `messages/uz.json`, `messages/en.json`
- User preference in settings

---

## 📱 PWA Features

### Manifest
```json
{
  "name": "LifeOS",
  "short_name": "LifeOS",
  "description": "AI-powered Life Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#7c3aed",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker
- Offline mode (cache static assets)
- Background sync (time logs, habit checks)
- Push notifications (reminders, streaks)

---

## 🎨 Design System

### Colors
```css
--primary: #7c3aed;     /* Purple */
--secondary: #06b6d4;   /* Cyan */
--success: #10b981;     /* Green */
--warning: #f59e0b;     /* Amber */
--danger: #ef4444;      /* Red */
--background: #0a0a0f;  /* Dark */
--surface: #1a1a2e;
--text: #e2e8f0;
--muted: #94a3b8;
```

### Typography
- Font: Inter (Google Fonts)
- Headings: 700 weight
- Body: 400 weight
- Code: JetBrains Mono

### Spacing
- Base: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

---

## 🚀 Performance Targets

- **FCP** (First Contentful Paint): <1.5s
- **LCP** (Largest Contentful Paint): <2.5s
- **TTI** (Time to Interactive): <3.5s
- **CLS** (Cumulative Layout Shift): <0.1
- **API Response**: <200ms (p95)

---

Bu SPEC.md — barcha funksiyalarning to'liq tavsifi. Keyingi qadamda ARCHITECTURE.md va DATA_MODEL.md yoziladi.

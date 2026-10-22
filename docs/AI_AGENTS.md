# LifeOS — AI Agentlar

> Agentlar, tool'lar, promptlar va AI biznes-logikasi

---

## 🤖 Agentlar (AI Agents)

### 1. **Capture Agent** (`/api/capture`)
**Vazifa**: Foydalanuvchi kiritingan xabarlarni, telegram, ovoz xabarlarini parse va databasega saqlash.

**Input**: Telegram message / text / voice
**Output**: Structured data (task, time log, habit, budget, etc.)

#### Prompt (v1):
```
Siz LifeOS systemasdagi Capture Agent sifatib ishlayman.
Foydalanuvchi xabarini oling va quyidagi formatda JSON qaytaring:

Input: "/task Finish SOC Day 12 #cybersecurity @soc-learning"
Output: {
  "type": "task",
  "title": "Finish SOC Day 12",
  "tags": ["cybersecurity"],
  "track": "soc-learning",
  "priority": "medium",
  "due_date": null
}

Input: "time 2h on Project X @project-alpha #work"
Output: {
  "type": "time_log",
  "duration": "2h",
  "task": "Project X",
  "tags": ["work"],
  "track": "project-alpha"
}

Input: "budget 50000 Transport uchun benzin"
Output: {
  "type": "transaction",
  "amount": 50000,
  "category": "Transport",
  "description": "uchun benzin",
  "type": "expense"
}

Input: "habits morning_routine completed today"
Output: {
  "type": "habit_log",
  "habit_name": "morning_routine",
  "date": "today"
}

Hech qachon JSON formatting emas — faqat JSON object return qiling.
Hech qanday izoh, izoh yoki qo'shimal text bermang.
```

### 2. **Planner Agent** (`/api/plan`)
**Vazifa**: Haftalik reja, kunlik reja, vaqt bloklarini AI bilan rejalashtirish.

**Input**: User progress (habits, tasks, study, finance, health)
**Output**: Optimized weekly/monthly plan

#### Prompt (v1):
```
Siz LifeOS sistema AI Planner agentisiz.
Foydalanuvchining hafta ohi qayta olingan ma'lumotlarini tahl qiling va optimal reja taklif bering.

Foydalanuvchi ma'lumotlari:
- {user_data: tasks pending, habits streak, study progress, budget status, health metrics}
- Maqsadlar: {goals}
- Joriy haftalik reja: {current_plan}

Quyidagi formatda javob bering:
{
  "weekly_plan": {
    "focus_areas": ["string"],
    "priority_tasks": [{"title": "string", "track": "string"}],
    "time_recommendations": [{"day": "string", "morning_block": "string", "afternoon_block": "string"}],
    "ai_advice": "string"
  }
}
```

### 3. **Finance Agent** (`/api/finance-insights`)
**Vazifa**: Budget tracking, savings recommendations, debt payoff plan.

**Input**: User transactions, budget categories, savings goals, debts.
**Output**: Financial insights and recommendations.

#### Prompt:
```
As an AI Financial Advisor, analyze user's financial data and provide insights.

User data:
- Budget category usage (X%)
- Savings goal progress
- Debt payoff timeline

Recommendations:
1. Budget adjustment (if overspending)
2. Savings optimization
3. Debt payoff strategy (snowball vs avalanche)
4. Investment suggestions (future)

Output format: {
  "recommendations": ["string"],
  "alerts": [{"category": "string", "message": "string", "severity": "warning|info|success"}],
  "projected_net_worth": {"current": "number", "next_month": "number", "trend": "stable|up|down"}
}
```

### 4. **Reviewer Agent** (`/api/weekly-review`)
**Vazifa**: Haftalik AI review: wins, challenges, lessons learned.

**Trigger**: Cron (Sunday evening)
**Output**: Weekly review data

#### Prompt:
```
Siz LifeOS haftalik review agentisiz.
Foydalanuvchining haftalik ma'lumotlarini tahl qiling va quyidagilarni aniqlang:

1. Wins (3 ta eng yaxshi narsa)
2. Challenges (2-3ta qiyinchilik)
3. Lessons Learned (1-2ta tajriba)
4. Next Week Focus (3ta aksiyon item)

Format: Markdown (structured JSON + readable text)
```

### 5. **Coach Agent** (`/api/ai-coach`)
**Vazifa**: Habit formation, motivation, accountability.

**Input**: Habit logs, streak, patterns, mood data.
**Output**: Personalized coaching messages.

#### Prompt:
```
As an AI Life Coach, provide motivational support based on user's habit data.

Pattern detection:
- Missed habits correlation (e.g., "you usually skip exercise when energy < 5")
- Streak risk assessment
- Best times for habit completion
- Motivation triggers

Tone: Supportive, encouraging, non-judgmental
```

### 6. **Study Coach Agent** (`/api/study-coach`)
**Vazifa**: IELTS writing/speaking feedback, SOC learning optimization.

#### IELTS Feedback Prompt:
```
As an IELTS examiner, provide band-score feedback on user's writing/speaking.

Analysis areas:
- Task Achievement (6-9 band)
- Coherence & Cohesion
- Lexical Resource
- Grammatical Range & Accuracy

Output: {
  "band_score": {"overall": "number", "writing_task_1": "number", "writing_task_2": "number"},
  "feedback": {"strengths": ["string"], "improvements": ["string"]},
  "suggestions": ["string"]
}
```

### 7. **Obsidian Agent** (`/api/obsidian-sync`)
**Vazifa**: Generate markdown notes and sync with Obsidian vault.

#### Prompt:
```
Siz LifeOS Obsidian sincronizatsiya agentisiz.
Foydalanuvchining kundalik progress ma'lumotlarini Obsidian formatidagi markdown notaga aylantiring.

Template:
---
date: {{date}}
day: {{dayOfWeek}}
life_score: {{lifeScore}}
xp_gained: {{xpGained}}
---

# {{date}} — {{dayOfWeek}}

## 🎯 Top-3 Tasks
1. {{task1}} {{status}}
2. {{task2}} {{status}}
3. {{task3}} {{status}}

## ✅ Habits
| Habit | Status | Streak |
|-------|--------|--------|

## 📚 Study Summary
- Tech: {{techMinutes}} min
- IELTS: {{ieltsMinutes}} min

## 💰 Finance
Budget: {{budgetPercentage}}%

## 📊 Weekly Review Summary
{{weeklySummary}}
```

---

## 🔧 Tool'lar (AI Tools)

### Tool: `create_task`
```ts
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  track_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.coerce.date().optional(),
});
```

### Tool: `log_time`
```ts
export const logTimeSchema = z.object({
  task_id: z.string().uuid().optional(),
  duration_minutes: z.number().int().min(1).max(1440),
  description: z.string().max(500).optional(),
  date: z.coerce.date().default(() => new Date()),
});
```

### Tool: `log_habit`
```ts
export const logHabitSchema = z.object({
  habit_id: z.string().uuid(),
  date: z.coerce.date().default(() => new Date()),
  completed: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});
```

### Tool: `log_transaction`
```ts
export const logTransactionSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().multipleOf(0.01),
  type: z.enum(["income", "expense"]),
  description: z.string().max(500).optional(),
  date: z.coerce.date().default(() => new Date()),
});
```

### Tool: `review_week`
```ts
export const reviewWeekSchema = z.object({
  week_start: z.coerce.date(),
  wins: z.array(z.string()).max(5),
  challenges: z.array(z.string()).max(5),
  lessons: z.array(z.string()).max(3),
  next_week_focus: z.array(z.string()).max(5),
  ai_insights: z.string().max(2000),
});
```

---

## 📝 Prompt Management

### Versions
```
prompts/
├── capture-v1.txt
├── capture-v2.txt (current)
├── planner-v1.txt
├── planner-v2.txt (current)
├── finance-insights-v1.txt
├── coach-v1.txt
├── study-coach-v1.txt
├── obsidian-sync-v1.txt
└── weekly-review-v1.txt
```

### A/B Testing
- Each agent has version (e.g., `planner-v1`, `planner-v2`)
- Track: user engagement, completion rate
- Auto-switch to better performing version

---

## 📊 AI Usage Tracking

### Metrics
- Token usage (per user, per agent)
- Response time (latency)
- Accuracy (user feedback: thumbs up/down)
- Cost tracking (per agent)

### Storage
```sql
CREATE TABLE ai_usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  agent_type TEXT NOT NULL,  -- "planner", "coach", etc.
  model TEXT NOT NULL,      -- "claude-3-5-sonnet-20240620"
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  response_time_ms INTEGER,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🎯 Agent Performance (Evals)

### Evaluation Framework
```
packages/ai/evals/
├── capture.test.ts      # Test parsing accuracy
├── planner.test.ts      # Test plan relevance
├── coach.test.ts        # Test motivation quality
├── reviewer.test.ts     # Test review quality
└── study-coach.test.ts  # Test feedback accuracy
```

### Metrics
- **Accuracy**: Parsed data matches expected (95%+)
- **Relevance**: AI recommendations are helpful (4.5+/5 user rating)
- **Coverage**: All supported languages understood (UZ, EN, RU)
- **Latency**: Response < 2s (p95)
- **Cost**: <$0.01 per request

---

## 🛡️ AI Safety & Ethics

### Content Moderation
- Prompt injection prevention
- User content sanitisation
- Sensitive data redaction

### Prompt Security
- No user data in system prompt
- Separate prompts for different domains
- Regular review of prompt security

### Privacy
- All AI conversations end-to-end encrypted
- Optional: Local AI model support (for privacy-focused users)
- Clear data retention policy
# LifeOS — Shaxsiy Hayot Optimization Tizimi

> **AI-powered Life Management System** — vaqtingizni, moliyangizni, o'qishingizni, sog'ligingizni va maqsadlaringizni bir joyda boshqaring.

## 🎯 Maqsad

LifeOS — bu sizning hayotingizning barcha muhim tomonlarini kuzatish, tahlil qilish va yaxshilash uchun yaratilgan to'liq ekotizim. AI yordamida avtomatik maslahatlar olasiz, gamifikatsiya orqali motivatsiya saqlanadi.

## 🧩 Modullar (9 ta)

### 1. **Tasks / Backlog / Kanban**
- Barcha vazifalaringiz bir joyda
- Kanban board (To Do → In Progress → Done)
- Track'lar (Projects) va tag'lar
- Quick capture (Telegram bot orqali)

### 2. **Time Management**
- Pomodoro timer (25/5 yoki custom)
- Time blocking (kunlik reja)
- Time log (real vaqt kuzatish)
- Hisobotlar: kunlik, haftalik, oylik

### 3. **Finance**
- Budget (oylik mablag' rejalash)
- Jamg'arma (Savings goals)
- Qarzlar (Debts tracking)
- Net worth calculator
- Obuna (Subscriptions) kuzatish

### 4. **Habits**
- Kunlik odatlar
- Streak tracker (ketma-ket kunlar)
- Habit formation science (21, 66, 90 kun)
- Vizual progress chart

### 5. **Study / O'qish**
- **SOC Analyst** (56 kunlik reja)
- **IELTS** (Writing, Speaking, Vocab, Grammar)
- **Flashcards** (spaced repetition — SM-2 algoritmi)
- **Study Log** (o'qish sessiyalari)
- **Certifications** tracker

### 6. **Kaizen + Weekly AI Review**
- Har hafta AI bilan review
- "Nima yaxshi bo'ldi?" / "Nimani yaxshilash kerak?"
- Haftalik insightlar va adaptiv rejalashtirish

### 7. **Health / Sog'liq**
- Uyqu (Sleep tracking)
- Energiya darajasi (1-10)
- Sport/Mashqlar
- Og'irlik / BMI
- Sog'liq metrikalar

### 8. **Goals / Maqsadlar + OKR**
- SMART maqsadlar
- OKR (Objectives & Key Results)
- Progress tracking
- Deadline reminder

### 9. **Quick Capture** (Telegram Bot)
- Telegram orqali tezkor qo'shish
- Voice messages → text (Whisper API)
- AI avtomatik categorize qiladi

---

## 🏗️ Arxitektura

- **Frontend**: Next.js 15 (App Router), React Server Components, PWA
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime, Storage)
- **AI**: Claude 3.5 Sonnet (Anthropic API) + pgvector
- **Gamification**: XP, Daraja, Achievements
- **Telegram Bot**: Quick capture + notifikatsiyalar
- **MCP Server**: Claude Desktop integratsiyasi

## 📊 Gamification System

### Life Score (0-100)
Har kuni sizning faolligingiz asosida hisoblangan ball:

```
Life Score = 
  Tasks completed (max 25) +
  Time logged (max 20) +
  Habits done (max 20) +
  Study time (max 15) +
  Health metrics (max 10) +
  Finance discipline (max 10)
```

### XP va Daraja
- Har faollik uchun XP olasiz
- Daraja oshishi → yangi yutuqlar (Achievements)

---

## 🚀 Boshlash

### 1. O'rnatish

```bash
cd D:\Tasks
pnpm install
```

### 2. Supabase sozlash

```bash
# Supabase CLI o'rnatish
pnpm add -g supabase

# Loyihani boshlash
supabase init
supabase start

# Migratsiyalarni qo'llash
supabase db reset
```

### 3. `.env.local` yaratish

```bash
cp .env.example .env.local
```

`.env.local` da quyidagilarni to'ldiring:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `TELEGRAM_BOT_TOKEN`

### 4. Ishga tushirish

```bash
pnpm dev
```

Web app: http://localhost:3000

---

## 📖 Hujjatlar

- [SPEC.md](./docs/SPEC.md) — Barcha modullar, ekranlar, qoidalar
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Qatlamlar, oqimlar
- [DATA_MODEL.md](./docs/DATA_MODEL.md) — Ma'lumotlar modeli (SQL)
- [AI_AGENTS.md](./docs/AI_AGENTS.md) — AI agentlar, tool'lar, promptlar
- [GAMIFICATION.md](./docs/GAMIFICATION.md) — XP, daraja, Life Score formulalari
- [ROADMAP.md](./docs/ROADMAP.md) — Rivojlanish bosqichlari

---

## 🛠️ Stack

| Texnologiya | Vazifasi |
|-------------|----------|
| Next.js 15 | Frontend framework |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Shadcn/ui | UI components |
| Supabase | Backend (PostgreSQL, Auth, Functions) |
| Drizzle ORM | Type-safe database queries |
| Anthropic Claude | AI (capture, planner, reviewer, coach, tutor) |
| Zod | Schema validation |
| React Query | Data fetching |
| Zustand | Client state |
| Vitest | Unit testing |
| Playwright | E2E testing |
| Turborepo | Monorepo build system |
| pnpm | Package manager |

---

## 📦 Packages

### `packages/shared`
Barcha umumiy sxemalar, tiplar, konstantalar

### `packages/db-types`
Supabase'dan generatsiya qilingan tiplar

### `packages/rules`
Sof funksiyalar (XP, daraja, Life Score, SM-2, achievements)

### `packages/ai`
AI agentlar, tool'lar, promptlar, baholash testlari

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Lint
pnpm lint
```

---

## 📅 Roadmap

- [x] **Phase 1**: Core (tasks, time, auth)
- [x] **Phase 2**: Finance, Habits, Study
- [x] **Phase 3**: Kaizen, Goals, Health
- [x] **Phase 4**: Gamification (XP, daraja, achievements)
- [x] **Phase 5**: AI Agents (capture, planner, reviewer, coach)
- [ ] **Phase 6**: Telegram Bot (quick capture)
- [ ] **Phase 7**: Mobile App (React Native)
- [ ] **Phase 8**: Voice Interface (Whisper + TTS)
- [ ] **Phase 9**: Community (dostlar bilan musobaqalar)
- [ ] **Phase 10**: Obsidian + Notion sync

---

## 🤝 Hissa qo'shish

Bu shaxsiy loyiha, lekin agar yoqsa — fork qiling va o'z versiyangizni yarating! 🚀

---

## 📜 Litsenziya

MIT License — erkin foydalaning, o'zgartiring, tarqating.

---

**Made with ❤️ by [Your Name]**

*"Eng yaxshi investitsiya — o'zingizga qilgan investitsiya"*

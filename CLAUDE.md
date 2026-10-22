# LifeOS — AI Kodlash Qoidalari

> Claude uchun yo'riqnoma: uslub, taqiqlar, buyruqlar

---

## 📐 Arxitektura Qoidalari

### 1. **Monorepo Tuzilmasi**
- Turborepo + pnpm workspace
- `apps/` → ilovalar (web, mcp-server)
- `packages/` → qayta ishlatiladigan kodlar
- Har package mustaqil, import faqat yuqoridan pastga

### 2. **Feature-first struktura**
```
apps/web/features/tasks/
  ├── components/      # UI komponentlar
  ├── hooks/           # Custom hooks
  ├── queries/         # React Query
  ├── actions/         # Server actions
  ├── types.ts
  └── index.ts         # Public API
```

### 3. **Qatlamlar (Layers)**
```
UI Layer         → React Server Components, Client Components
Data Layer       → React Query, Zustand
Business Logic   → packages/rules (sof funksiyalar)
Database         → Supabase (PostgreSQL + pgvector)
AI Layer         → packages/ai (agents, tools, prompts)
```

---

## 🎨 Kod Uslubi

### TypeScript
- **Hamisha** tiplar belgilang (no `any` except justified)
- Zod sxemalardan tiplarni chiqaring: `z.infer<typeof schema>`
- `type` vs `interface`: 
  - `type` → union, primitive, function
  - `interface` → object shape, extends

### React
- **Server Components** — default
- **Client Components** — faqat kerak bo'lganda (`'use client'`)
  - interaktivlik (onClick, useState)
  - browser API (localStorage, window)
  - hooks (useEffect, useQuery)
- Prop drilling → 3 darajadan ko'p bo'lsa Context/Zustand
- Key prop → stable ID (UUID), index emas

### Naming
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database tables: `snake_case`

### Comments
- Kod o'zi-o'zidan tushunarli bo'lishi kerak
- Comment faqat "nima uchun?" uchun, "nima?" emas
- JSDoc → public API funksiyalar uchun

---

## 🚫 Taqiqlar

### ❌ Qilmang
- ❌ `any` yoki `as` (type assertion) — faqat zarurat bo'lsa
- ❌ Inline styles — faqat Tailwind
- ❌ `console.log` — production'da qoldirmang
- ❌ Magic numbers — constant yarating
- ❌ Mutating state — immutable operations
- ❌ Nested ternaries — if-else yoki switch
- ❌ Prop spreading — explicit props

### ❌ Xavfli pattern'lar
- ❌ `useEffect` cleanup'siz subscription
- ❌ `fetch` without error handling
- ❌ SQL injection (always use prepared statements)
- ❌ XSS (always sanitize user input)
- ❌ Hardcoded secrets (use .env)
- ❌ Infinite loops / recursion

---

## ✅ Best Practices

### Data Fetching
```tsx
// ✅ Server Component
async function TaskList() {
  const tasks = await getTasks() // direct DB call
  return <div>{tasks.map(...)}</div>
}

// ✅ Client Component
function TaskList() {
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks
  })
  return <div>{tasks?.map(...)}</div>
}
```

### Error Handling
```ts
// ✅ Result pattern
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function createTask(input: TaskInput): Promise<Result<Task>> {
  try {
    const task = await db.insert(...)
    return { ok: true, data: task }
  } catch (error) {
    return { ok: false, error: parseError(error) }
  }
}
```

### Business Logic → Pure Functions
```ts
// ✅ packages/rules/xp.ts
export function calculateXP(action: Action): number {
  switch (action.type) {
    case 'task_complete': return action.difficulty * 10
    case 'habit_done': return 5
    default: return 0
  }
}

// ✅ Testable
import { calculateXP } from '@lifeos/rules'
```

---

## 🧪 Testing

### Unit Tests (Vitest)
- `packages/rules/` → 100% coverage
- Sof funksiyalar oson test qilinadi
- Mock'larsiz test yozing

### E2E Tests (Playwright)
- Critical user flows: login, task create, habit complete
- Real browser, real database (local Supabase)

---

## 🤖 AI Agent Qoidalari

### Tool Definition
```ts
// packages/ai/tools/create-task.ts
export const createTaskTool = {
  name: 'create_task',
  description: 'Create a new task in the backlog',
  input_schema: z.object({
    title: z.string().min(1).max(200),
    track_id: z.string().uuid().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium')
  })
}
```

### Prompt Engineering
- System prompt → `packages/ai/prompts/system.ts`
- User prompt → context + instruction
- Few-shot examples → improve accuracy
- Versiyalangan promptlar (v1, v2, ...)

### Safety
- Input validation (Zod schema)
- Output validation (schema + manual check)
- Rate limiting (10 req/min per user)
- Cost tracking (tokens logged)

---

## 🔐 Security

### Authentication
- Supabase Auth (email/password + OAuth)
- Row Level Security (RLS) enabled
- JWT validation on Edge Functions

### Data Access
- RLS policies → user can only see own data
- Service role key → faqat backend
- API keys → `.env` da, never commit

### Input Validation
- Client: Zod schema
- Server: Zod schema again (double check)
- SQL: Prepared statements (Supabase client)

---

## 📊 Performance

### Images
- Next.js Image component
- WebP format
- Lazy loading

### Code Splitting
- Dynamic imports → heavy components
- Route-based splitting (automatic in App Router)

### Caching
- React Query → 5 min staleTime
- Server Components → automatic caching
- Supabase Realtime → live updates

---

## 🌍 i18n (Optional, future)

- Uzbek (uz) + English (en) + Russian (ru)
- `next-intl` library
- Translations → `messages/uz.json`

---

## 📝 Commit Messages

Format: `type(scope): message`

Types:
- `feat`: yangi feature
- `fix`: bug fix
- `docs`: hujjatlar
- `style`: format (prettier)
- `refactor`: kod o'zgartirish (behavior o'zgarmaydi)
- `test`: test qo'shish
- `chore`: build, dependencies

Example:
```
feat(tasks): add drag-and-drop for kanban board
fix(finance): correct budget calculation for subscriptions
docs(readme): add installation instructions
```

---

## 🚀 Deployment

### Vercel (Web App)
- Auto deploy from `main` branch
- Preview deploys from PR
- Environment variables from Vercel dashboard

### Supabase (Database + Edge Functions)
- `supabase link` → connect to cloud project
- `supabase db push` → apply migrations
- `supabase functions deploy` → deploy edge functions

---

## 🛠️ Development Workflow

1. **Branch** → `git checkout -b feat/task-drag-drop`
2. **Code** → implement + test
3. **Typecheck** → `pnpm typecheck`
4. **Test** → `pnpm test`
5. **Lint** → `pnpm lint`
6. **Commit** → `git commit -m "feat(tasks): add drag-and-drop"`
7. **Push** → `git push origin feat/task-drag-drop`
8. **PR** → create pull request
9. **Review** → code review
10. **Merge** → squash and merge

---

## 💬 Claude Commands

Siz (Claude) quyidagi buyruqlarni tushunasiz:

- `/spec` → SPEC.md'ni o'qi va tushuntir
- `/arch` → ARCHITECTURE.md'ni ko'rsat
- `/data` → DATA_MODEL.md'ni ko'rsat
- `/test [file]` → test yoz
- `/refactor [file]` → refactor qil (behavior o'zgarmaydi)
- `/explain [code]` → kodni tushuntir
- `/review [pr]` → PR review qil
- `/migrate` → yangi migration yarat
- `/agent [name]` → yangi AI agent yarat

---

## 🎯 Goals

1. **Minimal dependencies** — faqat kerakli narsalar
2. **Type-safe** — runtime error minimal
3. **Testable** — sof funksiyalar, mock'siz test
4. **Scalable** — 1000+ user uchun tayyor
5. **Fast** — <1s page load, <100ms API response
6. **Maintainable** — 6 oy o'tib ham tushunish oson

---

**Qoidalarni buzma. Agar zarurat bo'lsa — avval so'ra!**

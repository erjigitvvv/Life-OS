# LifeOS — Boshqa Kompyuterda Ishga Tushirish Qo'llanmasi

Ushbu qo'llanma orqali loyihani istalgan kompyuterda klonlab, aynan to'xtagan joyidan davom ettirishingiz mumkin.

---

## 1. Talab qilinadigan dasturlar (Prerequisites)

- **Node.js** >= 20.0.0 ([Yuklab olish](https://nodejs.org/))
- **pnpm** >= 9.0.0:
  ```bash
  npm install -g pnpm
  ```
- **Git** ([Yuklab olish](https://git-scm.com/))
- **Supabase CLI** (Database bilan ishlash uchun):
  ```bash
  npm install -g supabase
  ```

---

## 2. Loyihani Klonlash

```bash
git clone https://github.com/erjigitvvv/Life-OS.git
cd Life-OS
```

---

## 3. Bog'liqliklarni (Dependencies) O'rnatish

Monorepo'dagi barcha packages va apps bir vaqtda o'rnatiladi:

```bash
pnpm install
```

---

## 4. Muhit O'zgaruvchilari (.env)

`.env.example` dan nusxa oling:

```bash
cp .env.example .env.local
```

`.env.local` ichiga o'zingizning kalitlaringizni kiriting:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase loyihangiz URL'i
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Anon API key
- `SUPABASE_SERVICE_ROLE_KEY` — Backend/Edge functions uchun
- `ANTHROPIC_API_KEY` — Claude AI agentlari uchun

---

## 5. Ma'lumotlar Bazasini Ko'tarish (Supabase)

### Variant A: Mahalliy (Local) Docker orqali
```bash
# Docker Desktop yoniq bo'lishi kerak
supabase start
supabase db reset   # Barcha 9 ta migratsiya avtomatik qo'llanadi
```

### Variant B: Cloud (Supabase.com) orqali
```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push    # Migratsiyalarni cloud bazaga yuborish
```

---

## 6. Loyihani Ishga Tushirish

Barcha apps va packages bir vaqtda ishga tushadi:

```bash
pnpm dev
```

- **Web App (PWA)**: [http://localhost:3000](http://localhost:3000)

---

## 7. Git Workflow (Branchlar bilan ishlash)

Har doim yangi feature boshlashdan oldin yangi branch oching:

```bash
# 1. Asosiy branchni yangilang
git checkout main
git pull origin main

# 2. Yangi feature branch yarating
git checkout -b feat/feature-nomi

# 3. O'zgarishlarni commit qiling
git add .
git commit -m "feat(module): tavsif"

# 4. GitHub'ga yuboring
git push origin feat/feature-nomi
```

---

## 8. Loyiha Tuzilmasi (Eslatma)

```
Life-OS/
├── apps/
│   ├── web/               # Next.js 15 PWA Dashboard
│   └── mcp-server/        # Claude Desktop MCP Server
├── packages/
│   ├── shared/            # Types, Zod sxemalar, Konstantalar
│   ├── rules/             # XP, Level, Life Score, SM-2 algoritmlari
│   └── ai/                # Claude AI Agentlari
└── supabase/
    └── migrations/        # 9 ta to'liq SQL migratsiya fayllari
```

# Loyiha Holati (Status & Progress)

> **So'nggi yangilanish**: 2026-10-24  
> **Joriy Branch**: `main` va `chore/architecture-governance`

---

## 🚦 Umumiy Holat

| Qism | Holat | Izoh |
|---|---|---|
| **Yagona Haqiqat Manbai (SSOT)** | 🟢 Tayyor | `AGENTS.md`, `docs/DECISIONS.md`, `docs/STATUS.md` joriy qilindi |
| **Frontend Routing** | 🟢 Tozalandi | Dublikat `app/(dashboard)` va ziddiyatli `apps/web/app/` o'chirildi |
| **Paketlar (`packages/rules`)** | 🟢 Tekshirildi | XP, Level (matematik xato tuzatildi), Life Score, SM-2 va 29 ta unit-test 100% o'tdi |
| **Baza Migratsiyalari** | 🟡 Yozilgan | Supabase uchun 10 ta SQL migratsiya mavjud, local/cloud Supabase ga bog'lash kerak |
| **CI / CD Pipeline** | 🟢 Tayyor | `.github/workflows/ci.yml` ishga tushirildi |
| **Vertikal Kesim (Tasks)** | ⏳ Navbatda | Auth ➔ DB ➔ UI ➔ Test zanjirini to'liq bog'lash |
| **AI Servislari** | 🟡 Tuzatildi | `ai_coach.py` dagi `userMessage` sintaktik xatosi tuzatildi; keyingi qadamda Claude SDK ga o'tiladi |

---

## ✅ Qilingan Ishlar

1. **SSOT (Single Source of Truth) boshqaruvi o'rnatildi**:
   - `AGENTS.md` (Barcha agentlar uchun qat'iy yo'riqnoma va tartib).
   - `docs/DECISIONS.md` (ADR: D-001 dan D-005 gacha qarorlar).
   - `docs/STATUS.md` (Doimiy yangilanuvchi holat monitoringi).
   - `CLAUDE.md` va `.opencode` yangilandi hamda `AGENTS.md` ga bog'landi.
2. **Frontend arxitekturasi tozalandi va ishga tushirildi**:
   - `apps/web/src/app/(dashboard)` papkasi (2046 qator dublikat kod) olib tashlandi.
   - `apps/web/app/page.test.ts` (Next.js router ziddiyati) olib tashlandi.
   - Barcha sahifalar `apps/web/src/app/[locale]/(dashboard)` orqali ko'p tilli rejimda (`200 OK`) ishlamoqda.
3. **Matematik va Sintaktik Buglar Tuzatildi**:
   - `packages/rules/level.ts` dagi `xpForLevel` formulasi `(100 * level * (level - 1)) / 2` ga keltirildi va manfiy progress muammosi hal etildi.
   - `packages/rules` dagi barcha 29 ta Vitest testlari muvaffaqiyatli o'tdi.
   - `apps/backend/services/ai_coach.py` dagi `NameError: userMessage` xatosi `user_message` ga to'g'rilandi.
4. **GitHub Actions CI qo'shildi**:
   - `.github/workflows/ci.yml` orqali `typecheck`, `lint`, `vitest` va `pytest` avtomatlashtirildi.

---

## ⏳ Keyingi Qadamlar (Next Sprints)

1. **AI Provider Refaktoringi (D-001 ijrosi)**:
   - `apps/backend` va `packages/ai` dagi OpenAI chaqiruvlarini Anthropic Claude SDK ga almashtirish.
2. **Vertikal Kesim — Tasks moduli**:
   - Supabase Auth integratsiyasi va `middleware.ts` himoyasi.
   - Tasks jadvalini Supabase Client orqali real rejimda ishlatish.
   - E2E testlar yozish.

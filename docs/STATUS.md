# Loyiha Holati (Status & Progress)

> **So'nggi yangilanish**: 2026-10-26  
> **Joriy Branch**: `main`

---

## 🚦 Umumiy Holat

| Qism | Holat | Izoh |
|---|---|---|
| **Yagona Haqiqat Manbai (SSOT)** | 🟢 Tayyor | `AGENTS.md`, `docs/DECISIONS.md`, `docs/STATUS.md` joriy qilindi |
| **Frontend Routing & UI** | 🟢 200 OK | Bugun (yaxlit Kunlik Markaz & Statistika), Tracker (Apple Segmented Control), Raqamli Egizak integratsiyasi to'liq ishga tushdi |
| **Paketlar (`packages/rules`, `shared`)** | 🟢 100% O'tdi | Barcha 29 ta unit-testlar muvaffaqiyatli o'tdi, build & subpath exportlar to'g'rilandi |
| **Baza Migratsiyalari** | 🟡 Yozilgan | Supabase uchun 10 ta SQL migratsiya mavjud, local/cloud Supabase ga bog'lash kerak |
| **CI / CD Pipeline** | 🟢 Tayyor | `.github/workflows/ci.yml` va testlar avtomatlashtirilgan |
| **Raqamli Egizak (Digital Twin)** | 🟢 Tayyor | AI shaxsiy ko'chirma, interaktiv tahliliy chat va kognitiv metrikalar sahifasi yaratildi |
| **Vertikal Kesim (Tasks)** | ⏳ Navbatda | Auth ➔ DB ➔ UI ➔ Test zanjirini to'liq bog'lash |

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

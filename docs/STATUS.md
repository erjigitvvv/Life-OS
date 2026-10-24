# Loyiha Holati (Status & Progress)

> **So'nggi yangilanish**: 2026-10-24  
> **Joriy Branch**: `chore/architecture-governance`

---

## 🚦 Umumiy Holat

| Qism | Holat | Izoh |
|---|---|---|
| **Yagona Haqiqat Manbai (SSOT)** | 🟢 Tayyor | `AGENTS.md`, `docs/DECISIONS.md`, `docs/STATUS.md` joriy qilindi |
| **Frontend Routing** | 🟢 Tozalandi | Dublikat `app/(dashboard)` o'chirildi, barcha sahifalar `app/[locale]/` ostida |
| **Paketlar (`packages/rules`)** | 🟢 Ishlayapti | XP, Level, Life Score, SM-2 sof funksiyalari va testlari mavjud |
| **Baza Migratsiyalari** | 🟡 Yozilgan | Supabase uchun 10 ta SQL migratsiya mavjud, local/cloud Supabase ga bog'lash kerak |
| **CI / CD Pipeline** | 🟡 Jarayonda | GitHub Actions ishga tushirilmoqda |
| **Vertikal Kesim (Tasks)** | ⏳ Navbatda | Auth ➔ DB ➔ UI ➔ Test zanjirini to'liq bog'lash |
| **AI Servislari** | 🔴 Refaktoring talab | OpenAI qoldiqlari mavjud, D-001 ga asosan faqat Anthropic Claude ga o'tishi kerak |

---

## ✅ Qilingan Ishlar

1. **SSOT (Single Source of Truth) boshqaruvi o'rnatildi**:
   - `AGENTS.md` (Barcha agentlar uchun qat'iy yo'riqnoma va tartib).
   - `docs/DECISIONS.md` (ADR: D-001 dan D-005 gacha qarorlar).
   - `docs/STATUS.md` (Doimiy yangilanuvchi holat monitoringi).
   - `CLAUDE.md` yangilandi va `AGENTS.md` ga havola qilindi.
2. **Frontend arxitekturasi tozalandi**:
   - `apps/web/src/app/(dashboard)` papkasi to'liq olib tashlandi.
   - Barcha sahifalar `apps/web/src/app/[locale]/(dashboard)` orqali ko'p tilli rejimda ishlamoqda.

---

## ⏳ Keyingi Qadamlar (Next Sprints)

1. **GitHub Actions CI qo'shish**:
   - Monorepo bo'yicha `pnpm typecheck`, `pnpm lint`, `pnpm test` avtomatik tekshiruvini yo'lga qo'yish.
2. **AI Provider Refaktoringi (D-001 ijrosi)**:
   - `apps/backend/services/ai_coach.py` va `packages/ai` dagi OpenAI importlarini Anthropic Claude SDK ga almashtirish.
3. **Vertikal Kesim — Tasks moduli**:
   - Supabase Auth integratsiyasi.
   - Tasks jadvalini Supabase Client orqali real rejimda ishlatish (hozirgi localStorage mock'dan bosqichma-bosqich o'tish).
   - Integration va E2E testlar yozish.

---

## ⚠️ Mavjud Xavflar va E'tibor Qaratiladigan Joylar

- **OpenAI qoldig'i**: `apps/backend/services/ai_coach.py` da xato chaqiruv (`userMessage`) va OpenAI kutubxonasi mavjud. D-001 qaroriga asosan Anthropic Claude ga o'tkazilishi lozim.
- **Relativ importlar**: `packages/ai/insights/insight-generator.ts` da `@lifeos/rules` o'rniga `../../packages/rules` ishlatilgan. Monorepo importlariga keltirish zarur.

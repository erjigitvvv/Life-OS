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
| **Digital Twin Engine** | 🟢 Tayyor | 4-bosqichli Continuous Learning closed loop (Telemetry ➔ Vector Store ➔ Patterns ➔ AI Chat) |
| **AI Servislari** | 🟢 Yangilandi | Anthropic Claude API & Dataset-grounded RAG kognitiv egizak integratsiyasi |

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
5. **Finance 3D Apple-Style Card Stack & Milliy/Xalqaro Kartalar**:
   - 3D stack tuzilmasi: kartalar ustma-ust 3D perspektivada joylashgan, orqa kartalarning qirralari ko'rinib turadi.
   - Milliy va xalqaro kartalar: Uzcard (Kapitalbank, milliy zumrad-ko'k), Humo (TBC Bank, yorqin to'q sariq), Visa Platinum (midnight obsidian & gold), Mastercard World Elite (kosmik binafsha & qizil/sariq doiralar), Naqd Hamyon (qog'oz pul ikonkasi va maxsus zaxira).
   - Jonli umumiy balans: barcha kartalar va naqd pul yig'indisi stack tepasida real vaqtda aks etadi.
   - Apple spring physics: `framer-motion` orqali silliq sakrash (bounce), yoyish (fan-out) va har bir bosishda fizik animatsiyalar.
6. **Digital Twin (Raqamli Egizak) 4-Bosqichli Yopiq Sikl (Closed-Loop Continuous Learning)**:
   - **Stage 1 (Capture Telemetriya)**: `ActivityLogger` xizmati orqali barcha vazifalar, tranzaksiyalar, odatlar, vaqt va o'quv faoliyatlari real-vaqtda log qilinadi.
   - **Stage 2 (Vector Memory)**: 64 o'lchamli semantik vektor fazosi va kosinus o'xshashligi (`cosineSimilarity`) orqali sub-millisekundli semantik qidiruv.
   - **Stage 3 (Pattern Recognition)**: Kognitiv xronotip (08:30-11:30 Deep Work peak), moliyaviy sarflar oqishi (weekend spikes) va zanjirli odatlar (habit stacking) yashirin qonuniyatlarini aniqlovchi va tizimni foydalanuvchiga avtomatik moslovchi tahlil dvigateli.
   - **Stage 4 (Digital Twin AI)**: Qoliplardan xoli, to'liq foydalanuvchining o'tmish datasetiga va vektorli xotirasiga tayangan holda gapiruvchi Anthropic Claude 3.5 Sonnet & lokal kognitiv RAG suhbat tizimi.
   - **Interactive UI**: `DigitalTwinHub.tsx` va `/[locale]/twin` dashboard sahifasi jonli telemetriya oqimi, vektor xotirasi inspektori, aniqlangan qonuniyatlar va interaktiv egizak suhbati bilan to'liq ishga tushirildi.

---

## ⏳ Keyingi Qadamlar (Next Sprints)

1. **AI Provider Refaktoringi (D-001 ijrosi)**:
   - `apps/backend` va `packages/ai` dagi OpenAI chaqiruvlarini Anthropic Claude SDK ga almashtirish.
2. **Vertikal Kesim — Tasks moduli**:
   - Supabase Auth integratsiyasi va `middleware.ts` himoyasi.
   - Tasks jadvalini Supabase Client orqali real rejimda ishlatish.
   - E2E testlar yozish.

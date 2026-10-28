# Loyiha Holati (Status & Progress)

> **So'nggi yangilanish**: 2026-10-25  
> **Joriy Branch**: `main`

---

## 🚦 Umumiy Holat

| Qism | Holat | Izoh |
|---|---|---|
| **Yagona Haqiqat Manbai (SSOT)** | 🟢 Tayyor | `AGENTS.md`, `docs/DECISIONS.md`, `docs/STATUS.md` to'liq muvofiqlashtirildi |
| **Frontend Routing** | 🟢 Tozalandi | Barcha sahifalar (jumladan `/growth`, `/study`, `/twin`) ko'p tilli rejimda faol |
| **Paketlar (`packages/rules`)** | 🟢 Tekshirildi | XP, Level, Life Score, SM-2, Odatlar va 39 ta unit-test 100% o'tdi |
| **Storage & Backup Adapter** | 🟢 Yangilandi | `StorageAdapter`: snapshotlar, to'liq JSON eksport/import va cloud sync tayyor |
| **Baza Migratsiyalari** | 🟡 Yozilgan | Supabase uchun 10 ta SQL migratsiya mavjud, local/cloud Supabase ga bog'lash kerak |
| **CI / CD Pipeline** | 🟢 Tayyor | `.github/workflows/ci.yml` ishga tushirildi |
| **Digital Twin Engine** | 🟢 Tayyor | 4-bosqichli Continuous Learning closed loop (Telemetry ➔ Vector Store ➔ Patterns ➔ Dual AI Chat) |
| **AI Servislari** | 🟢 Yangilandi | Anthropic Claude 3.5 Sonnet + Google Gemini 1.5 Pro Dual-Provider AI Gateway |

---

## ✅ Qilingan Ishlar

1. **SSOT (Single Source of Truth) boshqaruvi o'rnatildi**:
   - `AGENTS.md` (Barcha agentlar uchun qat'iy yo'riqnoma va tartib).
   - `docs/DECISIONS.md` (ADR: D-001 dan D-005 gacha qarorlar, D-001 Multi-Provider AI Gateway).
   - `docs/STATUS.md` (Doimiy yangilanuvchi holat monitoringi).
2. **7 ta Kritik Muammo (C-1 dan C-7 gacha) To'liq Hal Qilindi**:
   - **C-1 (Strict Types, 0 ta any)**: `route.ts`, `activity-logger.ts`, `vector-memory.ts` dagi barcha `any` turlari qat'iy interfeyslarga almashtirildi.
   - **C-2 (Storage Resilience)**: `StorageAdapter` yaratildi; brauzer xotirasi tozalansa ham avtomatik snapshotlar va JSON eksport/import orqali ma'lumotlar saqlanadi.
   - **C-3 (Store Modularizatsiyasi)**: Store arxitekturasi domen modullariga ajratildi (`types.ts`, `habit-streak.ts`, `finance-sync.ts`), orqaga 100% moslik ta'minlandi.
   - **C-4 (AI Provayder Dual Gateway)**: Claude 3.5 Sonnet (`ANTHROPIC_API_KEY`) va Google Gemini 1.5 Pro (`GEMINI_API_KEY`) qo'llab-quvvatlovchi ko'p modelli shlyuz joriy etildi.
   - **C-5 (`study/page.tsx` Holati)**: `study/page.tsx` (783 qator) o'chirilmagan, u Cybersecurity SOC Analyst va IELTS 7.5+ yo'l xaritalari, SM-2 takrorlash tizimini o'z ichiga olgan asosiy modul hisoblanadi.
   - **C-6 & C-7 (Paketlar Tozaligi)**: Foydalanilmayotgan `phosphor-react` va `@tanstack/react-query` paketlari olib tashlandi.
3. **5 ta Mantiqiy Ziddiyat Bartaraf Etildi**:
   - **1. Haqiqiy AI chaqiruvlari**: Gemini va Claude API orqali jonli muloqot, API kalitlar bo'lmaganda esa boyitilgan shaxsiy telemetriya konteksti.
   - **2. Dinamik Pattern Engine**: Qotib qolgan sonlar o'rniga harakatlar telemetriyasidan real xronotip, hafta oxiri sarflar nisbati va odatlar o'zaro bog'liqligi hisoblanadi.
   - **3. Budget.spent Avtomatik Sinxronizatsiyasi**: Tranzaksiya kiritilganda yoki o'chirilganda byudjet xarajatlari avtomatik ravishda ikki tomonlama buxgalteriya tamoyili asosida qayta hisoblanadi.
   - **4. Aniq Matematik Streak**: `calculateHabitStreak` orqali taqvim kunlari zanjiri va eng uzun tarixiy streak hisoblanadi.
   - **5. Growth Hub Navigatsiyasi**: `Sidebar.tsx` da `growth` bo'limiga to'g'ridan-to'g'ri `Growth Hub` (`/growth`) havolasi joylashtirildi.
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

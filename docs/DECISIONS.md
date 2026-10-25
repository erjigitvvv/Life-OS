# Arxitektura Qarorlari (Architecture Decision Records - ADR)

> **Qoida**: Qaror ushbu faylda qayd etilmagan bo'lsa, u qabul qilinmagan hisoblanadi. Barcha AI agentlar va dasturchilar ushbu qarorlarga qat'iy rioya qilishi shart.

---

## D-001 (2026-10-24, Yangilandi: 2026-10-25) — AI Provayder va Multi-Provider Gateway
- **Qaror**: Yagona Multi-Provider AI Gateway:
  1. **Anthropic Claude** (Claude 3.5 Sonnet) — birlamchi kognitiv intellekt (`ANTHROPIC_API_KEY`).
  2. **Google Gemini** (Gemini 1.5 Pro) — ikkilamchi/muqobil kognitiv intellekt (`GEMINI_API_KEY`).
  3. **Lokal Kognitiv Dvigatel** — API kalitlar mavjud bo'lmaganda foydalanuvchining o'tgan telemetriya datasitiga tayangan holda deterministik javob sintezatori.
- **Sabab**: Yuqori sifatli kontekst, tezkor tahlil, provayderga qattiq bog'lanib qolmaslik (fault-tolerance) va xavfsiz to'g'ridan-to'g'ri HTTP chaqiruvlari.
- **Ta'sir**: `apps/web/src/app/api/twin/chat/route.ts`, `packages/ai`, `apps/backend`. Barcha so'rovlar yagona xavfsiz shlyuz orqali o'tadi.

---

## D-002 (2026-10-24) — Backend va Ma'lumotlar Bazasi
- **Qaror**: **Supabase (PostgreSQL 15+, Supabase Client, Edge Functions, pgvector)** asosiy backend va yagona haqiqat manbai (Single Source of Truth) hisoblanadi.
- **Sabab**: PostgreSQL RLS (Row Level Security) orqali ma'lumotlar xavfsizligi, Realtime obunalar, o'rnatilgan Auth va oson hosting.
- **Ta'sir**: Barcha jadvallar va RLS siyosatlari `supabase/migrations/` da saqlanadi. `apps/backend` (FastAPI) faqat oraliq asinxron og'ir hisob-kitoblar uchun yordamchi bo'lib xizmat qiladi yoki to'liq Edge Functions/Server Actions ga o'tkaziladi.

---

## D-003 (2026-10-24) — Autentifikatsiya (Auth)
- **Qaror**: Faqat **Supabase Auth** (Email/Password, Magic Link, OAuth). Maxsus o'zboshimchalik bilan qilingan session/auth serverlari yaratilmaydi.
- **Sabab**: Baza darajasidagi RLS `auth.uid()` bilan avtomatik integratsiyalashgan, JWT standartlariga to'liq mos keladi.
- **Ta'sir**: Barcha so'rovlar Supabase JWT orqali tekshiriladi, Next.js middleware sessiyani yangilab turadi.

---

## D-004 (2026-10-24) — Frontend Marshrutlash va Ko'p Tillilik
- **Qaror**: Frontend faqat `apps/web/src/app/[locale]/...` xalqaro marshrutlar strukturasida ishlaydi. Mahalliylashtirilmagan `app/(dashboard)` to'liq olib tashlandi va qayta tiklanishi taqiqlanadi.
- **Sabab**: Foydalanuvchi tilini (o'zbek, ingliz, rus) bitta nuqtadan to'g'ri boshqarish va sahifalar dublikatsiyasini oldini olish.
- **Ta'sir**: Har bir yangi dashboard sahifasi faqat `apps/web/src/app/[locale]/(dashboard)/` ostida yaratiladi.

---

## D-005 (2026-10-24) — Kod Sifati va Testlash (Quality Gateways)
- **Qaror**: Har bir qabul qilinadigan o'zgarish avtomatlashtirilgan CI (Typecheck, Lint, Test) dan o'tishi shart. Mock qilingan yoki bo'sh testlar (`expect(true).toBe(true)`) qabul qilinmaydi.
- **Sabab**: AI agentlar tomonidan ishlab chiqarilgan kodning buzilishi yoki regressiyani oldini olish.
- **Ta'sir**: GitHub Actions CI ishga tushiriladi; `packages/rules` 100% test qamroviga ega bo'lishi talab etiladi.

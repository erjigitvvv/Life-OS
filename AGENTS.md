# LifeOS — Agentlar uchun Asosiy Qoidalar (Single Source of Truth)

> **DIQQAT BARCHA AI AGENTLAR UCHUN (Claude, Antigravity, OpenCode, va boshqalar)**:
> Ushbu fayl loyihaning bosh arxitektura va xulq-atvor konstitutsiyasidir. Ish boshlashdan avval ushbu qoidalar bilan to'liq tanishib chiqing va ularga og'ishmay amal qiling.

---

## 🚨 Majburiy Qoidalar (Non-negotiable Rules)

1. **Kontekst bilan tanishish**: Har qanday vazifani boshlashdan oldin `docs/STATUS.md` va `docs/DECISIONS.md` fayllarini o'qing.
2. **Duplikatsiyani taqiqlash**: Yangi papka, paket yoki modul yaratishdan oldin mavjudlarini tekshiring. Bir xil funksiyaga ega ikkita servis (masalan, TS va Python da bir xil narsa) yaratish qat'iyan man etiladi.
3. **Frontend Marshrutlash**: Barcha frontend marshrutlar faqat `apps/web/src/app/[locale]/` ostida bo'lishi shart. Mahalliylashtirilmagan `app/(dashboard)` ishlatilmaydi va qayta yaratilmaydi.
4. **Arxitektura barqarorligi**: AI provayder, DB va Auth bo'yicha qarorlarni o'zingizcha o'zgartirmang. `docs/DECISIONS.md` dagi ADR qarorlariga amal qiling.
5. **Sifat nazorati (Quality Gates)**: Ish tugagach har doim: `typecheck + lint + test` o'tsin hamda `docs/STATUS.md` yangilansin. Mashina tasdiqlamaguncha ish "tayyor" hisoblanmaydi.
6. **Rejalashtirish**: Hajmi katta o'zgarish yoki refaktoring qilishdan oldin aniq bosqichma-bosqich reja tuzing va foydalanuvchidan tasdiq oling.
7. **Aniqlik printsipi**: Biror talab yoki kontekst noaniq bo'lsa, o'zboshimchalik bilan taxmin qilmang — foydalanuvchiga savol bering.

---

## 🌿 Git va Ish Tartibi (Git Discipline)

- **Git yagona sinxronizatsiya vositasi**: Loyiha fayllarini fleshka, bulutli disklar (Drive) yoki uchinchi tomon vositalari orqali ko'chirmang.
- **Har bir vazifa uchun alohida branch**:
  ```bash
  git checkout -b feat/vazifa-nomi    # yoki chore/..., fix/...
  ```
- **Kichik va semantik commitlar**:
  ```bash
  git commit -m "feat(tasks): implement drag-and-drop kanban cards"
  ```
- **Kompyuterni almashtirganda birinchi buyruq**:
  ```bash
  git fetch --all && git pull --rebase
  ```
- **Parallel ishlash**: Bir vaqtda bir nechta agent/muhit bitta branchda ishlamasin. Zarur bo'lsa `git worktree` dan foydalaning.

---

## 🎯 Vertikal Kesim (Vertical Slicing) Qoidasi

Hammasini birdaniga "yuzaki" qoplashga urinmang. Har doim bitta modulni to'liq oxiriga yetkazing:
`Supabase Auth` ➔ `DB Migration & RLS` ➔ `Shared Zod Types` ➔ `Pure Logic & Unit Tests` ➔ `UI/UX Implementation` ➔ `Integration & End-to-End Test`.

---

## 🤖 Modellar Bilan Ishlash Strategiyasi

- **Arxitektura va Rejalashtirish**: Yuqori intellektual modellar (Claude 3.5 Sonnet / O1 / Pro). Natijalar `docs/DECISIONS.md` ga kiritiladi.
- **Mexanik kodlash (CRUD, tarjima, boilerplate)**: Tezkor modellar.
- **Kod tahlili (Code Review)**: Kodni yozgan model emas, boshqa mustaqil agent ko'rib chiqishi tavsiya etiladi.
- **Sessiya yakunlash**: Har bir sessiya so'ngida agent `docs/STATUS.md` faylini yangilab, nima qilingani, nima qolgani va qanday potensial xavflar mavjudligini qayd etadi.

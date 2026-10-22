# LifeOS — Gamification System

> XP, daraja, Life Score formulalari va yutuqlar (Achievements)

---

## 🎯 Life Score (0-100)

Kunlik umumiy hayot balli — sizning faolligingiz asosida hisoblanadi.

### Life Score formulasi:
```
Life Score = 
  (Tasks completed / 5) * 25 +
  (Study time / 4h) * 20 +
  (Habits done / 3) * 20 +
  (Time logged / 4h) * 20 +
  (Health metrics) * 10 +
  (Finance discipline) * 10
```

### Life Score rang bo'yi:
- 90-100 🟢 Emerald — Excellent
- 75-89 🟡 Amber — Good
- 50-74 🟠 Orange — Needs Improvement
- 0-49 🔴 Red — Critical

---

## ⚡ XP (Experience Points)

Har bir faollik uchun XP olinadi. Daraja oshishi bilan yangi yutuqlar (Achievements) saqlanadi.

### XP Rewards:

| Action | XP | Condition |
|--------|-----|-----------|
| ✅ Task completed (Low) | 5 | 1-5 difficulty |
| ✅ Task completed (Medium) | 10 | 6-15 difficulty |
| ✅ Task completed (High) | 20 | 16+ difficulty |
| ✅ Task completed (Urgent) | 30 | critical task |
| ✅ Habit done (daily) | 5 | daily habit |
| ✅ Habit streak 7 days | 50 | 7 ketma-ket kun |
| ✅ Habit streak 30 days | 200 | 30+ days |
| ✅ Study session 30 min | 10 | study session |
| ✅ Pomodoro complete | 5 | 25 min work session |
| ✅ Weekly review done | 100 | weekly AI review |
| ✅ Goal complete | 500 | goal completion |

### Daraja (Levels) System:
```ts
export function calculateLevel(xp: number): number {
  // XP = 100 * level * (level - 1)
  return Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2);
}

export function xpForNextLevel(currentLevel: number): number {
  return 100 * currentLevel * (currentLevel + 1) - xpForLevel(currentLevel);
}

function xpForLevel(level: number): number {
  return 100 * level * (level - 1);
}
```

### Achievements (Yutuqlar):
| Achievement Name | Description | XP | Icon |
|------------------|-------------|----|------|
| first_task | First task completed | 10 | 🎉 |
| week_streak_7 | 7-day streak | 50 | 🔥 |
| century | 100 tasks completed | 200 | 💯 |
| early_bird | Morning habit for 7 days | 75 | 🌅 |
| budget_master | 3 months under budget | 150 | 💰 |
| ielts_7_5 | IELTS 7.5+ band | 300 | 📚 |
| soc_56_days | 56-day SOC plan | 400 | 🛡️ |
| perfect_streak | 30 days continuous | 500 | 🏆 |
| perfect_growth | 90-day habit streak | 600 | 🌱 |
| perfect_health | 90-day health tracking | 700 | 🏃 |
| perfect_balance | 100% Life Score | 1000 | 🏆 |
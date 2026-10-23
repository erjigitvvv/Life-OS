'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { Settings, User, Bell, Download, Database, Shield, Check } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SettingsPage() {
  const [fullName, setFullName] = useState('Erjigit');
  const [username, setUsername] = useState('erjigitvvv');
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportMarkdown = () => {
    const markdownContent = `# LifeOS Shaxsiy Hisobot
Sana: ${new Date().toISOString().split('T')[0]}

## ⚡ Status
- Life Score: 78/100
- Streak: 12 kun
- Level: 5 (1,240 XP)

## 🎯 Vazifalar
- [x] SOC: SIEM log analysis (2h)
- [ ] IELTS Writing Task 2 (1h)
- [ ] Review fraud detection algo (1.5h)

## ✅ Odatlar
- [x] Morning routine
- [x] Deep work
- [ ] Exercise
`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-daily-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <span>⚙️</span> Sozlamalar (Settings)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profil ma'lumotlari, bildirishnomalar, tizim holati va ma'lumotlarni eksport qilish
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Foydalanuvchi Profili</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                To'liq ism
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ismingiz"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Foydalanuvchi nomi (@username)
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Vaqt mintaqasi (Timezone)
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Asia/Tashkent">Asia/Tashkent (UTC+5:00)</option>
              <option value="Asia/Almaty">Asia/Almaty (UTC+5:00)</option>
              <option value="Europe/Istanbul">Europe/Istanbul (UTC+3:00)</option>
              <option value="UTC">UTC (UTC+0:00)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profil muvaffaqiyatli saqlandi!
              </span>
            ) : <span />}

            <Button type="submit" size="sm">
              O'zgarishlarni saqlash
            </Button>
          </div>
        </form>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Bildirishnomalar va Tovush</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Pomodoro taymer signali</p>
              <p className="text-xs text-muted-foreground">
                25 daqiqalik fokus sessiyasi tugaganda tovushli signal berish
              </p>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Kunlik odat va streak eslatmasi</p>
              <p className="text-xs text-muted-foreground">
                Har kuni soat 21:00 da bajarilmagan odatlar haqida eslatish
              </p>
            </div>
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Integrations & Database Status */}
      <Card>
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Tizim va Ma'lumotlar Bazasi Holati</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗄️</span>
              <div>
                <p className="text-sm font-medium">Supabase PostgreSQL</p>
                <p className="text-xs text-muted-foreground">
                  RLS siyosatlari, 9 ta migratsiya jadvali, pgvector
                </p>
              </div>
            </div>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'}>
              {isSupabaseConfigured ? 'Ulangan' : 'Local Mock Rejim'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-sm font-medium">Claude AI API Integratsiyasi</p>
                <p className="text-xs text-muted-foreground">
                  Claude 3.5 Sonnet / Claude 5 agentlari, Quick Capture, Kaizen
                </p>
              </div>
            </div>
            <Badge variant="primary">Faol / Standby</Badge>
          </div>
        </div>
      </Card>

      {/* Export to Obsidian / Notion */}
      <Card>
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <Download className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Ma'lumotlarni Eksport qilish (Backup & Sync)</h2>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Barcha qaydlaringiz, vazifalaringiz va o'qish statistikangizni Obsidian yoki Notion uchun
          Markdown formatida yuklab oling:
        </p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportMarkdown} size="sm" variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Obsidian Daily Note (.md) yuklab olish
          </Button>

          <Button
            onClick={() => alert('JSON eksport shakllantirildi!')}
            size="sm"
            variant="ghost"
            className="flex items-center gap-2"
          >
            To'liq JSON arxiv
          </Button>
        </div>
      </Card>
    </main>
  );
}

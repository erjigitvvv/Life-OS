'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, Calendar, Brain } from 'lucide-react';

export default function KaizenPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'history' | 'improvements'>('weekly');
  const [generatingReview, setGeneratingReview] = useState(false);

  const wins = [
    { title: 'SOC 56-day rejasining 2-haftasi to\'liq yakunlandi', category: 'Study', xp: '+50 XP' },
    { title: 'Morning Routine odati 15 kunlik uzluksiz streakka yetdi', category: 'Habits', xp: '+100 XP' },
    { title: 'Haftalik byudjet chegarasidan chiqilmadi (85% sarf)', category: 'Finance', xp: '+30 XP' },
  ];

  const challenges = [
    { title: 'IELTS Writing Task 2 uchun rejadagi 3 ta inshodan faqat 1 tasi yozildi', category: 'Study', suggestion: 'Ertalabki soat 08:00 ga 45 daqiqalik qat\'iy vaqt bloki qo\'yish' },
    { title: 'Payshanba kuni kechki uyqu 5.5 soatga tushib ketdi', category: 'Health', suggestion: 'Kechki soat 23:00 dan keyin telefon va kompyuterni o\'chirish' },
  ];

  const kaizenImprovements = [
    { area: 'Deep Work', action: 'Pomodoro sessiyasini 25 daqiqadan 40 daqiqaga ko\'tarish', status: 'In Progress', impact: 'Yuqori' },
    { area: 'IELTS Vocab', action: 'Har kuni ertalab 15 ta flashcardni SM-2 bo\'yicha takrorlash', status: 'Done', impact: 'O\'rtacha' },
    { area: 'Moliya', action: 'Foydalanilmayotgan 1 ta keraksiz obunani bekor qilish', status: 'To Do', impact: 'Tejamkor' },
  ];

  const handleGenerateReview = () => {
    setGeneratingReview(true);
    setTimeout(() => {
      setGeneratingReview(false);
      alert('AI haftalik retrospektivani muvaffaqiyatli tahlil qildi va yangilandi!');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <span>📈</span> Kaizen & Weekly AI Review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Doimiy 1% rivojlanish falsafasi va haftalik AI retrospektivasi
          </p>
        </div>

        <Button
          onClick={handleGenerateReview}
          loading={generatingReview}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Yangi AI Review Boshlash
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'weekly'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Haftalik Xulosa (Retrospective)
        </button>
        <button
          onClick={() => setActiveTab('improvements')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'improvements'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          1% Kaizen Yaxshilanishlar
        </button>
      </div>

      {activeTab === 'weekly' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Wins & Challenges */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wins Card */}
            <Card className="border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Bu haftadagi yutuqlar (What went well)</h2>
              </div>
              <div className="space-y-3">
                {wins.map((win, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div>
                      <p className="font-medium text-sm">{win.title}</p>
                      <Badge variant="primary" className="text-[10px] mt-1">
                        {win.category}
                      </Badge>
                    </div>
                    <Badge variant="success" className="font-mono text-xs">
                      {win.xp}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Challenges Card */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold">Nimani yaxshilash kerak? (Lessons Learned)</h2>
              </div>
              <div className="space-y-3">
                {challenges.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-card border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{item.title}</p>
                      <Badge variant="warning" className="text-[10px]">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <b>AI Tavsiyasi:</b> {item.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: AI Coach Insight */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">AI Haftalik Bahosi</h3>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                "Ushbu haftada o'rganish va odatlar intizomi yuqori bo'ldi (Life Score o'rtacha 78 ball).
                Biroq, IELTS topshiriqlarini keyinga surish odati kuzatildi. Kelgusi hafta eng muhim
                fokus — har kuni ertalab 1 soat IELTS Writing bilan shug'ullanish bo'lishi lozim."
              </p>

              <div className="mt-4 pt-4 border-t border-border/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">O'rtacha Life Score:</span>
                  <span className="font-bold text-emerald-500">78 / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jami bajarilgan vazifalar:</span>
                  <span className="font-bold">24 ta</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To'plangan XP:</span>
                  <span className="font-bold text-primary">+450 XP</span>
                </div>
              </div>

              <Button size="sm" variant="secondary" className="w-full mt-5">
                Kelgusi hafta rejasini tasdiqlash
              </Button>
            </Card>

            <Card>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Oldingi sharhlar
              </h3>
              <div className="space-y-2 text-xs">
                {['Hafta 42 (15-21 Oktabr)', 'Hafta 41 (08-14 Oktabr)', 'Hafta 40 (01-07 Oktabr)'].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer flex justify-between items-center transition"
                    >
                      <span>{h}</span>
                      <span className="text-primary">Ko'rish →</span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'improvements' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">1% Kichik Qadamlar (Kaizen Action Items)</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Katta natijalar har kuni qilinadigan kichik va oddiy takomillashuvlardan boshlanadi.
              </p>
            </div>
            <Button size="sm">+ Yangi Kaizen qo'shish</Button>
          </div>

          <div className="space-y-3">
            {kaizenImprovements.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs">
                      {item.area}
                    </Badge>
                    <span className="font-medium text-sm">{item.action}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={item.status === 'Done' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Ta'siri: {item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </main>
  );
}

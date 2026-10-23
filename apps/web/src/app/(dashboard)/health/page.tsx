'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';
import { Moon, Activity, Flame, Droplets, Scale, Heart } from 'lucide-react';

export default function HealthPage() {
  const [sleepHours, setSleepHours] = useState(7.5);
  const [exerciseMinutes, setExerciseMinutes] = useState(35);
  const [energyLevel, setEnergyLevel] = useState(8);
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [weight, setWeight] = useState(72.5);

  // Health Score calculation (0-10) matching @lifeos/rules/life-score.ts
  const calculateCurrentHealthScore = () => {
    let score = 0;
    if (sleepHours >= 8) score += 4;
    else if (sleepHours >= 7) score += 3;
    else if (sleepHours >= 6) score += 2;
    else if (sleepHours >= 5) score += 1;

    if (exerciseMinutes >= 30) score += 3;
    else if (exerciseMinutes >= 15) score += 2;
    else if (exerciseMinutes >= 5) score += 1;

    if (energyLevel >= 8) score += 3;
    else if (energyLevel >= 6) score += 2;
    else if (energyLevel >= 4) score += 1;

    return Math.min(10, score);
  };

  const currentHealthScore = calculateCurrentHealthScore();

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <span>🩺</span> Health & Wellness
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Uyqu, energiya, sport, suv va hayotiy biologik ko'rsatkichlar
        </p>
      </div>

      {/* Health Overview Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Health Score</p>
            <p className="text-2xl font-bold">{currentHealthScore} / 10</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">Life Score qismi: 10%</p>
          </div>
          <ProgressRing
            value={currentHealthScore * 10}
            size={65}
            thickness={5}
            color="#10b981"
          />
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Moon className="w-4 h-4 text-indigo-400" /> Uyqu (Bugun)
            </p>
            <p className="text-2xl font-bold">{sleepHours} soat</p>
            <Badge variant="success" className="text-[10px] mt-1">Optimal (7-8h)</Badge>
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" /> Mashg'ulot
            </p>
            <p className="text-2xl font-bold">{exerciseMinutes} daq</p>
            <Badge variant="primary" className="text-[10px] mt-1">Maqsad: 30 daq</Badge>
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-400" /> Suv ichish
            </p>
            <p className="text-2xl font-bold">{waterGlasses} / 8 stakan</p>
            <p className="text-xs text-muted-foreground mt-1">{(waterGlasses * 0.25).toFixed(1)} Litr</p>
          </div>
        </Card>
      </div>

      {/* Main Health Tracking Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Health Log Form */}
        <Card className="space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Bugungi ko'rsatkichlarni yangilash
          </h2>

          {/* Sleep hours slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" /> Uyqu davomiyligi
              </span>
              <span className="font-bold">{sleepHours} soat</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>3 soat</span>
              <span>7-8h (Ideal)</span>
              <span>12 soat</span>
            </div>
          </div>

          {/* Energy level (1-10) */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" /> Energiya va tetiklik
              </span>
              <span className="font-bold">{energyLevel} / 10</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setEnergyLevel(lvl)}
                  className={`flex-1 py-1.5 text-xs rounded font-semibold transition ${
                    energyLevel === lvl
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise minutes */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" /> Jismoniy faollik (daqiqada)
              </span>
              <span className="font-bold">{exerciseMinutes} min</span>
            </div>
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90].map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={exerciseMinutes === m ? 'primary' : 'ghost'}
                  onClick={() => setExerciseMinutes(m)}
                  className="flex-1 text-xs"
                >
                  {m}m
                </Button>
              ))}
            </div>
          </div>

          {/* Water glasses */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" /> Suv stakanlari (250ml)
              </span>
              <span className="font-bold">{waterGlasses} / 8</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
              >
                - 1 stakan
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setWaterGlasses(waterGlasses + 1)}
                className="flex-1"
              >
                + Suv ichdim (1 stakan)
              </Button>
            </div>
          </div>

          <Button className="w-full mt-4" onClick={() => alert('Sog\'liq ko\'rsatkichlari saqlandi!')}>
            Ko'rsatkichlarni saqlash va XP olish (+10 XP)
          </Button>
        </Card>

        {/* Weight & Body Stats */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Tana Vazni va BMI
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Joriy vazn</p>
                <p className="text-3xl font-bold">{weight} kg</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">BMI Ko'rsatkichi</p>
                <p className="text-2xl font-bold text-emerald-500">22.4</p>
                <Badge variant="success" className="text-[10px]">Normal vazn</Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bo'y:</span>
                <span className="font-medium">180 cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maqsad vazn:</span>
                <span className="font-medium">70.0 kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oxirgi o'lchov:</span>
                <span className="font-medium">Bugun</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <span>💡</span> AI Salomatlik Maslahati
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "Kechagi 7.5 soatlik uyqu va 35 daqiqalik mashq sizning diqqat darajangizni 8/10 darajaga
              yetkazdi. Bugun tushdan keyin yana 2 stakan suv ichish va soat 23:00 dan kechikmay uxlash
              Life Score ballini 10/10 darajaga yetkazadi."
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}

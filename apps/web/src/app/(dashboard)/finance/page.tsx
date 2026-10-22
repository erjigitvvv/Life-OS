'use client';

import React from 'react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function FinancePage() {
  const budget = [
    { name: 'Oziq-ovqat', allocated: 800000, spent: 650000, color: '#10b981' },
    { name: 'Transport', allocated: 400000, spent: 320000, color: '#3b82f6' },
    { name: 'Ko\'ngilochar', allocated: 500000, spent: 480000, color: '#f59e0b' },
    { name: 'Uy-joy', allocated: 1000000, spent: 1000000, color: '#7c3aed' },
    { name: 'Kommunal', allocated: 300000, spent: 280000, color: '#06b6d4' },
  ];

  const subscriptions = [
    { name: 'Netflix', amount: 120000, billing: 'monthly' },
    { name: 'Spotify', amount: 65000, monthly: true },
    { name: 'YouTube Premium', amount: 80000, billing: 'monthly' },
  ];

  const totalBudget = budget.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budget.reduce((sum, b) => sum + b.spent, 0);
  const budgetUsed = (totalSpent / totalBudget) * 100;

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">💰 Finance</h1>
        <p className="mt-2 text-muted-foreground">Budget • Savings • Debts • Subscriptions</p>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Monthly Budget</p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalBudget)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Budget Used</p>
          <p className="text-2xl font-bold mt-2">{budgetUsed.toFixed(0)}%</p>
          <ProgressRing value={budgetUsed} size={60} thickness={4} color={budgetUsed > 90 ? '#ef4444' : budgetUsed > 75 ? '#f59e0b' : '#10b981'} />
        </Card>
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Savings</p>
          <p className="text-2xl font-bold mt-2 text-green-500">{formatCurrency(12500000)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget Categories */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">📊 Budget Categories</h2>
            <Button size="sm" variant="secondary">+ Add</Button>
          </div>
          <div className="space-y-4">
            {budget.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{cat.name}</span>
                  <span>{formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min((cat.spent / cat.allocated) * 100, 100)}%`,
                      backgroundColor: cat.spent > cat.allocated ? '#ef4444' : cat.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subscriptions */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">📱 Subscriptions</h2>
            <Button size="sm" variant="secondary">+ Add</Button>
          </div>
          <div className="space-y-3">
            {subscriptions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-sm text-muted-foreground">{sub.billing}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                  <Badge variant="warning">{sub.billing}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Total</span>
              <span className="font-bold text-lg">265,000</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">3,180,000 so'm/year</p>
          </div>
        </Card>
      </div>

      {/* Savings Goals */}
      <div className="mt-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">🎯 Savings Goals</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Laptop', current: 8000000, target: 12000000 },
              { name: 'Emergency Fund', current: 3000000, target: 10000000 },
              { name: 'Vacation', current: 1500000, target: 5000000 },
            ].map((goal, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {((goal.current / goal.target) * 100).toFixed(0)}%
                  </span>
                </div>
                <ProgressRing value={(goal.current / goal.target) * 100} size={80} thickness={5} color="#10b981" />
                <p className="text-sm text-muted-foreground mt-3">
                  {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
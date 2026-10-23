'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldCheck, X, Wrench, RefreshCw } from 'lucide-react';
import { useLifeOS } from '@/lib/store';
import { useTranslations } from 'next-intl';

export function IssuesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { issues, resolveIssue } = useLifeOS();
  const t = useTranslations('issues');

  const unresolvedCount = issues.filter((i) => !i.resolved).length;

  return (
    <>
      {/* Clickable Status Badge in bottom-left */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 p-2.5 rounded-xl border border-border bg-white dark:bg-card shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between text-left group"
        title="Tizim holati va diagnostika"
      >
        <div className="flex items-center gap-2">
          {unresolvedCount > 0 ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          )}
          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
            {unresolvedCount > 0 ? `${unresolvedCount} Muammo` : 'Tizim Barqaror'}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
          Diagnostika
        </span>
      </button>

      {/* Issues Diagnostic Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white dark:bg-card p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{t('modalTitle')}</h3>
                  <p className="text-xs text-muted-foreground">{t('modalSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
              {issues.length === 0 || unresolvedCount === 0 ? (
                <div className="p-6 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {t('allHealthy')}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Barcha modullar, LocalStorage DB va xotira ideal ishlamoqda.
                  </p>
                </div>
              ) : (
                issues.map((iss) => (
                  <div
                    key={iss.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      iss.resolved
                        ? 'border-border/60 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                        : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            iss.resolved ? 'text-muted-foreground' : 'text-amber-500'
                          }`}
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">{iss.title}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {iss.description}
                          </p>
                        </div>
                      </div>

                      {!iss.resolved ? (
                        <button
                          onClick={() => resolveIssue(iss.id)}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-card border border-border rounded-lg shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>{t('resolve')}</span>
                        </button>
                      ) : (
                        <span className="shrink-0 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 rounded-md">
                          Hal qilindi
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Avto-monitoring faol
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-all active:scale-95"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

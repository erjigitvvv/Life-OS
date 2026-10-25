'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Kanban,
  Table,
  CheckSquare,
  Wallet,
  TrendingUp,
  Target,
  HeartPulse,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Flame,
  Zap,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Activity,
  Layers,
  Folder,
  FolderOpen,
  GraduationCap,
  Brain,
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { IssuesModal } from '../IssuesModal';
import { AddTrackModal } from '../AddTrackModal';
import { useLifeOS } from '@/lib/store';

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isTrackersOpen, setIsTrackersOpen] = useState(true);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);

  const { user, habits, tasks, trackers, toggleTrackBoolean, roadmaps } = useLifeOS();

  const todayIso = new Date().toISOString().split('T')[0];

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Group trackers by category
  const trackerCategories = React.useMemo(() => {
    const cats: Record<string, typeof trackers> = {};
    trackers.forEach((tr) => {
      const c = tr.category || 'General';
      if (!cats[c]) cats[c] = [];
      cats[c].push(tr);
    });
    return cats;
  }, [trackers]);

  const [openTrackerCategories, setOpenTrackerCategories] = useState<Record<string, boolean>>({
    Productivity: true,
    'Health & Sport': true,
    General: true,
  });

  const toggleTrackerCategory = (cat: string) => {
    setOpenTrackerCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const navGroups = [
    {
      key: 'core',
      label: t('core'),
      items: [
        {
          name: t('today'),
          href: `/${locale}/today`,
          icon: LayoutDashboard,
          badge: tasks.filter((t) => t.status !== 'done').length.toString(),
          submenus: [
            { name: t('dailyCenter'), href: `/${locale}/today?view=daily` },
            { name: t('dailyStats'), href: `/${locale}/today?view=stats` },
          ],
        },
        {
          name: t('twin'),
          href: `/${locale}/twin`,
          icon: Brain,
          badge: 'AI Twin',
          submenus: [
            { name: 'Continuous Learning Loop', href: `/${locale}/twin` },
            { name: 'Dataset-Aware AI Chat', href: `/${locale}/twin` },
          ],
        },
        {
          name: t('board'),
          href: `/${locale}/board`,
          icon: Kanban,
          submenus: [
            { name: 'Backlog & To Do', href: `/${locale}/board#todo` },
            { name: 'In Progress & Done', href: `/${locale}/board#done` },
          ],
        },
      ],
    },
    {
      key: 'productivity',
      label: t('productivity'),
      items: [
        {
          name: t('trackerTable'),
          href: `/${locale}/time`,
          icon: Table,
          submenus: [
            { name: t('excelTracker'), href: `/${locale}/time#grid` },
            { name: 'Trend Dinamikasi', href: `/${locale}/time#trend` },
          ],
        },
        {
          name: t('habits'),
          href: `/${locale}/habits`,
          icon: CheckSquare,
          badge: habits.length.toString(),
          submenus: [
            { name: '30-kunlik Matritsa', href: `/${locale}/habits#matrix` },
            { name: 'Eslatmalar Rejimi', href: `/${locale}/habits#reminders` },
          ],
        },
        {
          name: t('study'),
          href: `/${locale}/study`,
          icon: GraduationCap,
          badge: roadmaps?.length ? roadmaps.length.toString() : undefined,
          submenus: [
            { name: 'Learning Roadmap', href: `/${locale}/study?tab=roadmap` },
            { name: t('activeRecall'), href: `/${locale}/study?tab=flashcards` },
            { name: t('resourceLibrary'), href: `/${locale}/study?tab=resources` },
          ],
        },
      ],
    },
    {
      key: 'finance',
      label: t('finance'),
      items: [
        {
          name: t('financeMenu'),
          href: `/${locale}/finance`,
          icon: Wallet,
          submenus: [
            { name: t('transactions'), href: `/${locale}/finance?tab=transactions` },
            { name: t('budgets'), href: `/${locale}/finance?tab=budgets` },
            { name: t('savings'), href: `/${locale}/finance?tab=savings` },
            { name: '50/30/20 Qoidasi', href: `/${locale}/finance?tab=rule503020` },
          ],
        },
      ],
    },
    {
      key: 'growth',
      label: t('growth'),
      items: [
        {
          name: t('kaizen'),
          href: `/${locale}/kaizen`,
          icon: TrendingUp,
          submenus: [
            { name: t('kaizenJournal'), href: `/${locale}/kaizen#journal` },
            { name: 'Haftalik Tahlil', href: `/${locale}/kaizen#analysis` },
          ],
        },
        {
          name: t('goals'),
          href: `/${locale}/goals`,
          icon: Target,
          submenus: [
            { name: t('okrGoals'), href: `/${locale}/goals#okr` },
            { name: 'Choraklik Rejalar', href: `/${locale}/goals#quarter` },
          ],
        },
        {
          name: t('health'),
          href: `/${locale}/health`,
          icon: HeartPulse,
          submenus: [
            { name: t('waterTracker'), href: `/${locale}/health#water` },
            { name: t('sleepTracker'), href: `/${locale}/health#sleep` },
            { name: t('workoutLog'), href: `/${locale}/health#workout` },
          ],
        },
      ],
    },
    {
      key: 'system',
      label: t('system'),
      items: [
        {
          name: t('settings'),
          href: `/${locale}/settings`,
          icon: Settings,
          submenus: [
            { name: 'Mavzu & Ko\'rinish', href: `/${locale}/settings#appearance` },
            { name: 'Til Sozlamasi', href: `/${locale}/settings#language` },
            { name: 'Baza & Zaxira', href: `/${locale}/settings#storage` },
          ],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white dark:bg-card border-b border-border z-40 sticky top-0 shadow-sm">
        <Link href={`/${locale}/today`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">LifeOS</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-2 rounded-lg border border-border bg-white dark:bg-card text-foreground"
          >
            {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-card border-r border-border p-3.5 flex flex-col transition-all duration-300 ease-in-out md:static ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsedDesktop ? 'md:w-20' : 'md:w-72'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-border/70">
          <Link
            href={`/${locale}/today`}
            className={`flex items-center gap-3 group overflow-hidden ${
              isCollapsedDesktop ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {!isCollapsedDesktop && (
              <div className="transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-foreground tracking-tight leading-none">LifeOS</h1>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground font-semibold px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">Pure Minimalist</span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
            className={`hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isCollapsedDesktop ? 'mx-auto mt-2' : ''
            }`}
            title={isCollapsedDesktop ? 'Sidebarni kengaytirish' : 'Sidebarni yashirish'}
          >
            {isCollapsedDesktop ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* User Mini Stat Card (Expanded mode only) */}
        {!isCollapsedDesktop && (
          <div className="mb-3 p-3 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-900/40 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Life Score
              </span>
              <span className="font-bold text-primary">{user.lifeScore} / 100</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${user.lifeScore}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] pt-0.5 text-muted-foreground font-medium">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5" />
                {user.streak}d Streak
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Zap className="w-3 h-3" />
                Lvl {user.level} ({user.xp} XP)
              </span>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
          {navGroups.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.key];
            return (
              <div key={group.key} className="space-y-1">
                {!isCollapsedDesktop && (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 hover:text-foreground transition-colors"
                  >
                    <span>{group.label}</span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {(!isGroupCollapsed || isCollapsedDesktop) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isMainActive = pathname.startsWith(item.href);
                      const isSubOpen = openSubmenu === item.name || isMainActive;

                      return (
                        <div key={item.name} className="space-y-0.5">
                          <div className="flex items-center group relative">
                            <Link
                              href={item.href}
                              onClick={() => setIsOpenMobile(false)}
                              title={isCollapsedDesktop ? item.name : undefined}
                              className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                isMainActive
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-foreground/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm'
                              } ${isCollapsedDesktop ? 'justify-center px-0 h-10 w-10 mx-auto' : ''}`}
                            >
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                  isMainActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
                                }`}
                              />
                              {!isCollapsedDesktop && (
                                <>
                                  <span className="flex-1 truncate">{item.name}</span>
                                  {item.badge && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        isMainActive
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </>
                              )}
                            </Link>

                            {!isCollapsedDesktop && item.submenus && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenSubmenu(isSubOpen ? null : item.name);
                                }}
                                className={`p-1.5 rounded-lg ml-0.5 transition-colors ${
                                  isMainActive
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {isSubOpen ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Deep Submenus dropdown */}
                          {!isCollapsedDesktop && isSubOpen && item.submenus && (
                            <div className="pl-6 pr-1 py-1 space-y-0.5 animate-slide-up">
                              {item.submenus.map((sub) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={() => setIsOpenMobile(false)}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                                      isSubActive
                                        ? 'text-primary font-bold bg-primary/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                    }`}
                                  >
                                    <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                                    <span className="truncate">{sub.name}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* DYNAMIC TRACKERS & SUBTRACKS SECTION */}
          {!isCollapsedDesktop && (
            <div className="pt-2 border-t border-border/70 space-y-1">
              {/* Header with Open/Close and Add Track Button */}
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  onClick={() => setIsTrackersOpen(!isTrackersOpen)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Trekerlar & Subtracks</span>
                  {isTrackersOpen ? (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => setIsAddTrackOpen(true)}
                  className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                  title="Yangi Track qo‘shish"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Collapsible Tracker Tree */}
              {isTrackersOpen && (
                <div className="space-y-1.5 pl-1 animate-slide-up">
                  {Object.entries(trackerCategories).map(([catName, trackList]) => {
                    const isCatOpen = openTrackerCategories[catName] ?? true;
                    return (
                      <div key={catName} className="space-y-1">
                        {/* Category Folder Row */}
                        <button
                          onClick={() => toggleTrackerCategory(catName)}
                          className="w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-semibold text-foreground/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isCatOpen ? (
                              <FolderOpen className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className="truncate text-[11px]">{catName}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {trackList.length}
                          </span>
                        </button>

                        {/* Subtracks inside this category */}
                        {isCatOpen && (
                          <div className="pl-4 space-y-0.5 border-l border-border/60 ml-2.5">
                            {trackList.map((track) => {
                              const isBooleanDone = track.completedDates?.includes(todayIso);
                              const todayVal = track.values?.[todayIso] ?? 0;
                              const isValDone = todayVal >= track.goal;

                              return (
                                <div
                                  key={track.id}
                                  className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors text-xs"
                                >
                                  <div className="flex items-center gap-2 truncate flex-1 pr-1">
                                    {/* Boolean Clickable Checkbox */}
                                    <button
                                      onClick={() => toggleTrackBoolean(track.id, todayIso)}
                                      className="text-muted-foreground hover:text-emerald-500 transition-colors shrink-0"
                                      title={
                                        isBooleanDone || isValDone
                                          ? 'Bajarildi (bosing bekor qilish uchun)'
                                          : 'Bajarilmadi (bosing bajarish uchun)'
                                      }
                                    >
                                      {isBooleanDone || (track.isBoolean ? isBooleanDone : isValDone) ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-emerald-500" />
                                      )}
                                    </button>
                                    <span
                                      className={`truncate text-[11px] font-medium ${
                                        isBooleanDone || isValDone
                                          ? 'line-through text-muted-foreground/70'
                                          : 'text-foreground'
                                      }`}
                                    >
                                      {track.name}
                                    </span>
                                  </div>

                                  {/* Metric / Unit Indicator */}
                                  <span className="text-[10px] font-mono font-semibold text-muted-foreground/80 shrink-0">
                                    {track.isBoolean
                                      ? (isBooleanDone ? '1/1' : '0/1')
                                      : `${todayVal}/${track.goal} ${track.unit}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Track Action Pill */}
                  <button
                    onClick={() => setIsAddTrackOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 border border-dashed border-border/80 hover:border-primary/60 rounded-xl text-xs text-primary font-semibold hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yangi Track qo‘shish</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Interactive Diagnostics & Issues Modal */}
        {!isCollapsedDesktop && (
          <div className="pt-2 border-t border-border/70 mt-auto">
            <IssuesModal />
          </div>
        )}
      </aside>

      {/* Add Track Modal Dialog */}
      <AddTrackModal
        isOpen={isAddTrackOpen}
        onClose={() => setIsAddTrackOpen(false)}
      />
    </>
  );
}

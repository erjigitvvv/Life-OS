'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'uz', label: 'Oʻzbek', short: 'Oʻz' },
  { code: 'en', label: 'English', short: 'En' },
  { code: 'ru', label: 'Русский', short: 'Ру' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (newLocale: string) => {
    setIsOpen(false);
    if (newLocale === locale) return;
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-card shadow-sm hover:border-primary/40 active:scale-95 transition-all text-xs font-medium flex items-center gap-1.5 text-foreground"
        aria-label="Switch language"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span>{currentLang.short}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-card border border-border rounded-xl shadow-lg py-1 z-50 animate-scale-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                locale === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-foreground'
              }`}
            >
              <span>{lang.label}</span>
              {locale === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

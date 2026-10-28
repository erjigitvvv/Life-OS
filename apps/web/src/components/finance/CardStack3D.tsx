'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletCard, CardType } from '@/lib/store';
import {
  Banknote,
  Plus,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CardStack3DProps {
  cards: WalletCard[];
  onAddCard: (card: Omit<WalletCard, 'id'>) => void;
  onUpdateCardBalance: (cardId: string, newBalance: number) => void;
  onUpdateCard?: (cardId: string, updates: Partial<WalletCard>) => void;
  onDeleteCard: (cardId: string) => void;
}

// Authentic SVG Chip Component
function EMVChip() {
  return (
    <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-500 p-[1.5px] shadow-sm relative overflow-hidden shrink-0 border border-amber-300/60">
      <div className="w-full h-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-[4px] relative flex flex-col justify-between p-1 opacity-90">
        <div className="w-full h-[1px] bg-amber-700/50" />
        <div className="flex justify-between w-full h-[6px]">
          <div className="w-[1px] h-full bg-amber-700/50" />
          <div className="w-2.5 h-full rounded-sm border border-amber-700/60 bg-amber-400/40" />
          <div className="w-[1px] h-full bg-amber-700/50" />
        </div>
        <div className="w-full h-[1px] bg-amber-700/50" />
      </div>
    </div>
  );
}

// Contactless NFC Waves SVG
function ContactlessIcon({ className = 'w-5 h-5 text-white/80' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M8.5 16.5a5 5 0 0 1 0-7" />
      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
    </svg>
  );
}

// Authentic Uzcard Logo Badge
function UzcardLogo() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0052cc] to-[#2684ff] flex items-center justify-center shadow-inner">
        <span className="text-[11px] font-black text-white italic tracking-tighter leading-none">U</span>
      </div>
      <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-sm">
        UZCARD
      </span>
    </div>
  );
}

// Authentic Humo Logo Badge
function HumoLogo() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ff6d00] to-[#ff9100] flex items-center justify-center shadow-inner">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
          <path d="M12 2L4 9l8 13 8-13-8-7zm0 3.5l5 4.5-5 8-5-8 5-4.5z" />
        </svg>
      </div>
      <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-sm">
        HUMO
      </span>
    </div>
  );
}

// Authentic Visa Logo
function VisaLogo() {
  return (
    <div className="flex items-center justify-center px-2 py-0.5">
      <span className="text-lg font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-sans">
        VISA
      </span>
    </div>
  );
}

// Authentic Mastercard Logo
function MastercardLogo() {
  return (
    <div className="flex items-center -space-x-2">
      <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-95 shadow-sm" />
      <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-95 mix-blend-screen shadow-sm" />
    </div>
  );
}

// Cash Wallet Badge
function CashBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300">
      <Banknote className="w-4 h-4 text-emerald-400" />
      <span className="text-xs font-extrabold tracking-wider uppercase">
        NAQD HAMYON
      </span>
    </div>
  );
}

export function CardStack3D({
  cards,
  onAddCard,
  onUpdateCardBalance,
  onUpdateCard,
  onDeleteCard,
}: CardStack3DProps) {
  // Ordered stack: index 0 is active / front card
  const [activeCardId, setActiveCardId] = useState<string>(cards[0]?.id || '');
  const [isFannedOut, setIsFannedOut] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositCardId, setDepositCardId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [depositType, setDepositType] = useState<'add' | 'deduct'>('add');

  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [newCardType, setNewCardType] = useState<CardType>('uzcard');
  const [newCardName, setNewCardName] = useState('');
  const [newCardBank, setNewCardBank] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('MIRHAMID ERJIGITOV');
  const [newCardBalance, setNewCardBalance] = useState<number>(1000000);
  // Edit card state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCardId, setEditCardId] = useState('');
  const [editName, setEditName] = useState('');
  const [editBank, setEditBank] = useState('');
  const [editHolder, setEditHolder] = useState('MIRHAMID ERJIGITOV');
  const [editNumber, setEditNumber] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editType, setEditType] = useState<CardType>('uzcard');
  const [editExpiry, setEditExpiry] = useState('11/28');

  const handleOpenEditCard = (card: WalletCard) => {
    setEditCardId(card.id);
    setEditName(card.name);
    setEditBank(card.bankName || '');
    setEditHolder(card.holderName || 'MIRHAMID ERJIGITOV');
    setEditNumber(card.cardNumber || '');
    setEditBalance(card.balance);
    setEditType(card.type);
    setEditExpiry(card.expiryDate || '11/28');
    setIsEditModalOpen(true);
  };

  const handleSaveEditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCardId || !onUpdateCard) return;

    let gradient = 'from-[#004d40] via-[#00695c] to-[#00897b]';
    let colorTheme = 'emerald-cyan';
    if (editType === 'humo') {
      gradient = 'from-[#b73e00] via-[#bf360c] to-[#1e1b4b]';
      colorTheme = 'orange-terracotta';
    } else if (editType === 'visa') {
      gradient = 'from-[#090d16] via-[#111827] to-[#1e293b]';
      colorTheme = 'midnight-gold';
    } else if (editType === 'mastercard') {
      gradient = 'from-[#1a0b2e] via-[#2d123d] to-[#4c0519]';
      colorTheme = 'space-crimson';
    } else if (editType === 'cash') {
      gradient = 'from-[#052417] via-[#064e3b] to-[#022c22]';
      colorTheme = 'obsidian-forest';
    }

    onUpdateCard(editCardId, {
      name: editName.trim(),
      bankName: editBank.trim(),
      holderName: editHolder.trim().toUpperCase(),
      cardNumber: editNumber.trim(),
      balance: Number(editBalance),
      type: editType,
      expiryDate: editExpiry.trim(),
      gradient,
      colorTheme,
    });

    setIsEditModalOpen(false);
  };


  // Total combined balance of all cards + cash
  const totalBalanceAllWallets = cards.reduce((sum, c) => sum + c.balance, 0);
  const totalCardsCount = cards.filter((c) => c.type !== 'cash').length;
  const totalCashCount = cards.filter((c) => c.type === 'cash').length;
  const totalBankBalance = cards.filter((c) => c.type !== 'cash').reduce((sum, c) => sum + c.balance, 0);
  const totalCashBalance = cards.filter((c) => c.type === 'cash').reduce((sum, c) => sum + c.balance, 0);

  // Active card object
  const activeCard = cards.find((c) => c.id === activeCardId) || cards[0];

  // Reorder list so active card is at index 0 for stacked view
  const orderedCards = React.useMemo(() => {
    if (!activeCardId) return cards;
    const active = cards.find((c) => c.id === activeCardId);
    if (!active) return cards;
    const others = cards.filter((c) => c.id !== activeCardId);
    return [active, ...others];
  }, [cards, activeCardId]);

    const handleCardClick = (cardId: string) => {
    if (cardId === activeCardId) {
      // Bitta bosish orqali animatsiya bilan keyingi cardga o'tish
      const currentIndex = cards.findIndex((c) => c.id === activeCardId);
      const nextIndex = (currentIndex + 1) % cards.length;
      if (cards[nextIndex]) {
        setActiveCardId(cards[nextIndex].id);
      }
    } else {
      setActiveCardId(cardId);
    }
  };

  const handleOpenDeposit = (cardId: string) => {
    setDepositCardId(cardId);
    setDepositAmount(500000);
    setDepositType('add');
    setIsDepositModalOpen(true);
  };

  const handleSaveDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositCardId || depositAmount <= 0) return;
    const card = cards.find((c) => c.id === depositCardId);
    if (!card) return;
    const nextBal =
      depositType === 'add'
        ? card.balance + Number(depositAmount)
        : Math.max(0, card.balance - Number(depositAmount));
    onUpdateCardBalance(depositCardId, nextBal);
    setIsDepositModalOpen(false);
  };

  const handleSaveNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    let gradient = 'from-[#004d40] via-[#00695c] to-[#00897b]';
    let colorTheme = 'emerald-cyan';
    let numberPrefix = '8600';

    if (newCardType === 'humo') {
      gradient = 'from-[#b73e00] via-[#bf360c] to-[#1e1b4b]';
      colorTheme = 'orange-terracotta';
      numberPrefix = '9860';
    } else if (newCardType === 'visa') {
      gradient = 'from-[#090d16] via-[#111827] to-[#1e293b]';
      colorTheme = 'midnight-gold';
      numberPrefix = '4000';
    } else if (newCardType === 'mastercard') {
      gradient = 'from-[#1a0b2e] via-[#2d123d] to-[#4c0519]';
      colorTheme = 'space-crimson';
      numberPrefix = '5412';
    } else if (newCardType === 'cash') {
      gradient = 'from-[#052417] via-[#064e3b] to-[#022c22]';
      colorTheme = 'obsidian-forest';
      numberPrefix = 'CASH';
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cardNumber =
      newCardType === 'cash' ? 'CASH-WALLET' : `${numberPrefix} •••• •••• ${randomSuffix}`;

    onAddCard({
      name: newCardName.trim(),
      type: newCardType,
      balance: Number(newCardBalance) || 0,
      currency: 'UZS',
      cardNumber,
      holderName: newCardHolder.trim().toUpperCase() || 'MIRHAMID ERJIGITOV',
      expiryDate: newCardType === 'cash' ? 'DOIMIY' : '10/29',
      bankName: newCardBank.trim() || (newCardType === 'cash' ? 'Naqd Hamyon' : 'Milliy Bank'),
      colorTheme,
      gradient,
    });

    setNewCardName('');
    setNewCardBank('');
    setIsNewCardModalOpen(false);
  };

  return (
    <div className="w-full mb-8 bg-gradient-to-b from-slate-50/80 to-white dark:from-[#0d1627] dark:to-[#111c33] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/30 dark:shadow-none relative overflow-hidden backdrop-blur-xl">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: Total Combined Live Net Worth & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7 relative z-10 border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Jamlangan Jonli Hamyonlar Balansi
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300/40 dark:border-emerald-700/40">
              Real-vaqt 3D Stack
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {totalBalanceAllWallets.toLocaleString('uz-UZ')}{' '}
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                so'm
              </span>
            </h2>
          </div>

          {/* Quick Balance Breakdown Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>{totalCardsCount} ta Karta:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {totalBankBalance.toLocaleString()} so'm
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
              <span>{totalCashCount} ta Naqd Hamyon:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-200">
                {totalCashBalance.toLocaleString()} so'm
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Fan-Out Toggle, Add Card, Eye Hide */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setShowNumbers(!showNumbers)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a263f] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors"
            title={showNumbers ? 'Raqamlarni berkitish' : 'Raqamlarni ko\'rsatish'}
          >
            {showNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsFannedOut(!isFannedOut)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isFannedOut
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                : 'bg-white dark:bg-[#1a263f] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isFannedOut ? '3D Stack qilish' : 'Barcha Kartalarni Yoyish'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsNewCardModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Karta Qo'shish</span>
          </motion.button>
        </div>
      </div>

      {/* 3D CARD STACK VIEWPORT */}
      {!isFannedOut ? (
        // COLLAPSED 3D PHYSICAL STACK MODE
        <div className="relative w-full flex flex-col items-center justify-center pt-2 pb-16 perspective-[1200px]">
          <div className="relative w-full max-w-[420px] h-[250px] sm:h-[260px] flex items-center justify-center">
            {orderedCards.map((card, index) => {
              const isFront = index === 0;
              // Calculate peeking depth and scaling for Apple Wallet 3D stack
              const yOffset = index * 26; // Each card peeks 26px below/above
              const scale = 1 - index * 0.04; // 1, 0.96, 0.92, 0.88...
              const zIndex = orderedCards.length - index;
              const brightness = 1 - index * 0.08;

              return (
                <motion.div
                  key={card.id}
                  layoutId={`card-${card.id}`}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    zIndex,
                    filter: `brightness(${brightness})`,
                    transformStyle: 'preserve-3d',
                  }}
                  animate={{
                    y: yOffset,
                    scale,
                    rotateX: 4,
                  }}
                  whileHover={{
                    y: yOffset - 12,
                    scale: scale + 0.02,
                    filter: 'brightness(1.05)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 28,
                    mass: 0.8,
                  }}
                  className={`absolute w-full h-[230px] sm:h-[245px] rounded-3xl p-5 sm:p-6 cursor-pointer select-none shadow-2xl transition-shadow ${
                    card.type === 'cash'
                      ? 'bg-gradient-to-tr from-[#052417] via-[#064e3b] to-[#022c22] border border-emerald-500/30 text-white shadow-emerald-950/40'
                      : card.type === 'uzcard'
                      ? 'bg-gradient-to-tr from-[#003b46] via-[#07575b] to-[#00695c] border border-cyan-400/30 text-white shadow-cyan-950/40'
                      : card.type === 'humo'
                      ? 'bg-gradient-to-tr from-[#b73e00] via-[#bf360c] to-[#1e1b4b] border border-orange-400/30 text-white shadow-orange-950/40'
                      : card.type === 'visa'
                      ? 'bg-gradient-to-tr from-[#090d16] via-[#111827] to-[#1e293b] border border-amber-400/25 text-white shadow-slate-950/60'
                      : 'bg-gradient-to-tr from-[#1a0b2e] via-[#2d123d] to-[#4c0519] border border-rose-400/30 text-white shadow-rose-950/40'
                  }`}
                >
                  {/* Card Subtle Shimmer Overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                  {/* Card Header: Bank & Card Logo */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="text-xs sm:text-sm font-extrabold tracking-tight text-white/95 uppercase drop-shadow-sm">
                        {card.bankName || card.name}
                      </div>
                      {card.isDefault && (
                        <span className="text-[9px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded-full">
                          Asosiy
                        </span>
                      )}
                    </div>

                    <div>
                      {card.type === 'uzcard' && <UzcardLogo />}
                      {card.type === 'humo' && <HumoLogo />}
                      {card.type === 'visa' && <VisaLogo />}
                      {card.type === 'mastercard' && <MastercardLogo />}
                      {card.type === 'cash' && <CashBadge />}
                    </div>
                  </div>

                  {/* Card Middle: EMV Chip & Contactless */}
                  <div className="flex items-center justify-between mt-5 sm:mt-6 relative z-10">
                    {card.type !== 'cash' ? (
                      <div className="flex items-center gap-3">
                        <EMVChip />
                        <ContactlessIcon />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                        <Banknote className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold">Naqd Pul Zaxirasi</span>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold block">
                        Qoldiq
                      </span>
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {card.balance.toLocaleString()} {card.currency}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Number & Holder */}
                  <div className="mt-6 sm:mt-7 flex items-end justify-between relative z-10 pt-1">
                    <div>
                      <span className="text-sm sm:text-base font-mono tracking-widest text-white/90 drop-shadow-sm font-bold block">
                        {showNumbers
                          ? card.cardNumber
                          : card.type === 'cash'
                          ? '•••• CASH ••••'
                          : `•••• •••• •••• ${card.cardNumber?.slice(-4) || '8888'}`}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-white/75 uppercase block mt-0.5">
                        {card.holderName || 'MIRHAMID ERJIGITOV'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-white/60 uppercase block">Amal qilish</span>
                      <span className="text-xs font-mono font-bold text-white/90">
                        {card.expiryDate || '10/29'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Active Card Actions Bar */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-3 relative z-20">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => handleOpenDeposit(activeCard.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1a263f] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm hover:border-emerald-500/50 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>{activeCard.name} ga Mablag' Qo'shish / O'zgartirish</span>
            </motion.button>

            <span className="text-xs text-slate-400 font-medium">
              💡 Boshqa kartani faollashtirish uchun uning ustiga bosing
            </span>
          </div>
        </div>
      ) : (
        // FANNED OUT / EXPANDED GRID VIEW
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2"
        >
          {cards.map((card) => {
            const isSelected = card.id === activeCardId;

            return (
              <motion.div
                key={card.id}
                layoutId={`card-${card.id}`}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                className={`relative rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between h-[230px] border transition-all ${
                  isSelected ? 'ring-4 ring-emerald-500/50' : ''
                } ${
                  card.type === 'cash'
                    ? 'bg-gradient-to-tr from-[#052417] via-[#064e3b] to-[#022c22] border-emerald-500/40 text-white'
                    : card.type === 'uzcard'
                    ? 'bg-gradient-to-tr from-[#003b46] via-[#07575b] to-[#00695c] border-cyan-400/40 text-white'
                    : card.type === 'humo'
                    ? 'bg-gradient-to-tr from-[#b73e00] via-[#bf360c] to-[#1e1b4b] border-orange-400/40 text-white'
                    : card.type === 'visa'
                    ? 'bg-gradient-to-tr from-[#090d16] via-[#111827] to-[#1e293b] border-amber-400/30 text-white'
                    : 'bg-gradient-to-tr from-[#1a0b2e] via-[#2d123d] to-[#4c0519] border-rose-400/40 text-white'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-white tracking-wide">
                      {card.bankName || card.name}
                    </span>
                    {card.isDefault && (
                      <span className="text-[9px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded-full">
                        Asosiy
                      </span>
                    )}
                  </div>
                  <div>
                    {card.type === 'uzcard' && <UzcardLogo />}
                    {card.type === 'humo' && <HumoLogo />}
                    {card.type === 'visa' && <VisaLogo />}
                    {card.type === 'mastercard' && <MastercardLogo />}
                    {card.type === 'cash' && <CashBadge />}
                  </div>
                </div>

                {/* Middle */}
                <div className="flex items-center justify-between my-2">
                  {card.type !== 'cash' ? (
                    <div className="flex items-center gap-2.5">
                      <EMVChip />
                      <ContactlessIcon />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold">Naqd Pul</span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-[10px] text-white/70 uppercase tracking-widest block font-medium">
                      Qoldiq
                    </span>
                    <span className="text-xl font-black font-mono text-white">
                      {card.balance.toLocaleString()} {card.currency}
                    </span>
                  </div>
                </div>

                {/* Footer & Actions */}
                <div className="flex items-end justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="text-xs font-mono font-bold text-white/90 block">
                      {showNumbers
                        ? card.cardNumber
                        : card.type === 'cash'
                        ? '•••• CASH ••••'
                        : `•••• •••• •••• ${card.cardNumber?.slice(-4) || '8888'}`}
                    </span>
                    <span className="text-[10px] font-bold text-white/70 uppercase block">
                      {card.holderName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditCard(card);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-colors"
                      title="Kartani tahrirlash"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeposit(card.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-colors"
                      title="Mablag' kiritish"
                    >
                      + To'ldirish
                    </button>
                    {cards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`${card.name} kartasini o'chirmoqchimisiz?`)) {
                            onDeleteCard(card.id);
                          }
                        }}
                        className="p-1 rounded-lg bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors"
                        title="O'chirish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* MODAL 1: DEPOSIT / ADJUST BALANCE */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                      Karta Balansini Yangilash
                    </h3>
                    <p className="text-xs text-slate-500">
                      {cards.find((c) => c.id === depositCardId)?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDeposit} className="space-y-4 mt-5">
                {/* Action Type Toggle: Add vs Deduct */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setDepositType('add')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      depositType === 'add'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Mablag' Qo'shish (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositType('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      depositType === 'deduct'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Yechib Olish (-)</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    O'zgarish Miqdori (so'm)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-base font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[200000, 500000, 1000000, 3000000, 5000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +{(preset / 1000).toLocaleString()} ming
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    Saqlash & Yangilash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD NEW CARD */}
      <AnimatePresence>
        {isNewCardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                      Yangi Karta / Hamyon Qo'shish
                    </h3>
                    <p className="text-xs text-slate-500">
                      Uzcard, Humo, Visa, Mastercard yoki Naqd Hamyon
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewCardModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewCard} className="space-y-4 mt-5">
                {/* Card Type Selector Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Karta Turi va Tizimi
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['uzcard', 'humo', 'visa', 'mastercard', 'cash'] as CardType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewCardType(type)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-extrabold capitalize transition-all ${
                          newCardType === type
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {type === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Karta Nomi
                  </label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="Masalan: TBC Bank Black, Kapitalbank Uzcard"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bank Nomi
                    </label>
                    <input
                      type="text"
                      value={newCardBank}
                      onChange={(e) => setNewCardBank(e.target.value)}
                      placeholder="TBC Bank, Kapitalbank..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Initial Balance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Boshlang'ich Balans (so'm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      value={newCardBalance}
                      onChange={(e) => setNewCardBalance(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Karta Egasi (F.I.O)
                  </label>
                  <input
                    type="text"
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value)}
                    placeholder="MIRHAMID ERJIGITOV"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewCardModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    Kartani Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: EDIT CARD */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c33] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Kartani Tahrirlash
                    </h3>
                    <p className="text-xs text-slate-400">
                      Karta nomi, banki, raqami va balansini o'zgartirish
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCard} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Karta Turi *
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['uzcard', 'humo', 'visa', 'mastercard', 'cash'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditType(t)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                          editType === t
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Karta Nomi *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Nomi
                    </label>
                    <input
                      type="text"
                      value={editBank}
                      onChange={(e) => setEditBank(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Karta Raqami
                    </label>
                    <input
                      type="text"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Muddati (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={editExpiry}
                      onChange={(e) => setEditExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Karta Egasi (F.I.O)
                  </label>
                  <input
                    type="text"
                    value={editHolder}
                    onChange={(e) => setEditHolder(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Joriy Balans (so'm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

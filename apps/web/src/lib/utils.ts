/**
 * Utility functions for formatting and calculations
 */

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getDayOfWeek(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isFuture(date: Date | string): boolean {
  return new Date(date) > new Date();
}

export function isPast(date: Date | string): boolean {
  return new Date(date) < new Date();
}

export function getDaysSince(date: Date | string): number {
  const d = new Date(date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - d.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number, currency: string = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length: number = 50): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Core UI Components Library
 */

'use client';

import React from 'react';
import { clsx } from '@/lib/utils';
import { Pin, CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 disabled:bg-secondary/50',
      ghost: 'text-foreground hover:bg-muted disabled:text-muted-foreground',
      danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50',
    };

    const sizes = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {props.children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-card border border-border',
      bordered: 'bg-transparent border border-border',
      elevated: 'bg-card border border-border shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={clsx('rounded-lg p-6 transition-all', variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-muted text-muted-foreground',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-green-500/10 text-green-600',
      warning: 'bg-yellow-500/10 text-yellow-600',
      danger: 'bg-red-500/10 text-red-600',
    };

    return (
      <span
        ref={ref}
        className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', variants[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

// Progress Ring Component
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  className?: string;
}

export const ProgressRing = ({
  value,
  max = 100,
  size = 100,
  thickness = 4,
  color = '#7c3aed',
  className,
}: ProgressRingProps) => {
  const normalizedValue = Math.min(value, max);
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / max) * circumference;

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        className="text-muted opacity-20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
};
ProgressRing.displayName = 'ProgressRing';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={clsx(
          'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// Toast Component
interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  onClose?: () => void;
}

export const Toast = ({ title, description, variant = 'default', onClose }: ToastProps) => {
  const variants = {
    default: 'bg-card border-border',
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
  };

  const icons = {
    default: <Pin className="w-5 h-5 text-primary" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  };

  return (
    <div className={clsx('rounded-lg border p-4 shadow-lg', variants[variant])}>
      <div className="flex items-start gap-3">
        <span className="shrink-0">{icons[variant]}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
Toast.displayName = 'Toast';

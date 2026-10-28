'use client';

import React, { useEffect, useState, useRef } from 'react';

type CursorType = 'default' | 'pointer' | 'grab' | 'add' | 'delete' | 'text';

export function MacOSCursor() {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const posRef = useRef({ x: -100, y: -100 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setMounted(true);
    document.documentElement.classList.add('custom-cursor');

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) {
        setCursorType('default');
        return;
      }

      // Check text inputs
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        setCursorType('text');
        return;
      }

      // Check delete buttons
      const isDelete = target.closest(
        'button.delete, [data-action="delete"], [title*="o\'chirish" i], [title*="delete" i], .text-red-500, .bg-red-500'
      );
      if (isDelete) {
        setCursorType('delete');
        return;
      }

      // Check add buttons
      const isAdd = target.closest(
        'button.add, [data-action="add"], [title*="qo\'shish" i], [title*="add" i], [title*="kiritish" i]'
      );
      if (isAdd) {
        setCursorType('add');
        return;
      }

      // Check clickable / interactive items
      const isInteractive = target.closest(
        'button, a, [role="button"], .cursor-pointer, .card, [data-clickable="true"], select, summary'
      );
      if (isInteractive) {
        setCursorType('pointer');
        return;
      }

      setCursorType('default');
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    // Direct render loop for maximum 144Hz/240Hz responsiveness
    const render = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      animFrameId.current = requestAnimationFrame(render);
    };
    animFrameId.current = requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  if (!mounted) return null;

  // Decide current active graphic
  const effectiveType = isClicking && (cursorType === 'pointer' || cursorType === 'add') ? 'grab' : cursorType;

  return (
    <div
      ref={cursorRef}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
      className={`hidden md:block pointer-events-none fixed top-0 left-0 z-[999999] select-none transition-opacity duration-150 ${
        isClicking ? 'scale-90' : 'scale-100'
      }`}
    >
      {/* 1. DEFAULT: CLASSIC macOS BLACK ARROW WITH WHITE OUTLINE */}
      {effectiveType === 'default' && (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          style={{ transform: 'translate(-2px, -2px)' }}
        >
          <path
            d="M3 2 L3 22 L8.8 16.5 L13.5 24.5 L17.2 22.5 L12.5 14.5 L19.5 14.5 Z"
            fill="#0a0a0a"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* 2. POINTER: THE ICONIC WHITE CARTOON GLOVE HAND WITH 3 BLACK STRIPES */}
      {effectiveType === 'pointer' && (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] transition-transform duration-75"
          style={{ transform: 'translate(-9px, -2px)' }}
        >
          {/* Glove outline and fill */}
          <path
            d="M13.5 3 C12 3 10.8 4.2 10.8 5.8 L10.8 17.5 C9.2 17.8 7.8 19.2 7.8 21 C7.8 22.6 8.8 23.8 10 24.5 C10 29.5 14 33 19 33 C25 33 29.5 28.5 29.5 22.5 L29.5 17.5 C29.5 15.8 28.2 14.5 26.5 14.5 C26 14.5 25.6 14.6 25.2 14.8 C24.8 13.2 23.3 12.2 21.7 12.2 C21.2 12.2 20.8 12.3 20.4 12.5 C19.9 11.2 18.5 10.2 17 10.2 C16.5 10.2 16 10.3 15.6 10.6 L15.6 5.8 C15.6 4.2 14.6 3 13.5 3 Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* The 3 iconic black stripes on the back of the hand */}
          <path d="M17 21 L17 27.5" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20.5 21 L20.5 27.5" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24 21 L24 27.5" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}

      {/* 3. GRAB: CLOSED FIST WHITE GLOVE (MOUSEDOWN / CLICK) */}
      {effectiveType === 'grab' && (
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] scale-95"
          style={{ transform: 'translate(-12px, -8px)' }}
        >
          <path
            d="M9.5 10.5 C8 10.5 7 11.8 7 13.5 C7 15 7.8 16.2 9 17 C9 22 13 26.5 18.5 26.5 C23.5 26.5 27.5 22.5 27.5 17.5 L27.5 14.5 C27.5 13 26.2 12 24.8 12 C24.4 12 24 12.1 23.6 12.3 C23.2 10.8 22 10 20.5 10 C20 10 19.5 10.1 19 10.3 C18.5 9 17.2 8.5 16 8.5 C14.8 8.5 13.8 9.2 13.2 10.3 L13.2 13.5 C13.2 11.8 12 10.5 9.5 10.5 Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M15 17.5 L15 23" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18.5 17.5 L18.5 23" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 17.5 L22 23" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}

      {/* 4. ADD: ARROW WITH GREEN (+) BADGE (MATCHING ROW 1, ICON 4) */}
      {effectiveType === 'add' && (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]"
          style={{ transform: 'translate(-2px, -2px)' }}
        >
          <path
            d="M3 2 L3 20 L8 15 L12 22 L15.5 20 L11.5 13 L17.5 13 Z"
            fill="#0a0a0a"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Green plus circle badge */}
          <circle cx="21" cy="21" r="8" fill="#16a34a" stroke="#ffffff" strokeWidth="1.8" />
          <path d="M21 16 L21 26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 21 L26 21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      {/* 5. DELETE: ARROW WITH GREY (X) BADGE (MATCHING ROW 1, ICON 6) */}
      {effectiveType === 'delete' && (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]"
          style={{ transform: 'translate(-2px, -2px)' }}
        >
          <path
            d="M3 2 L3 20 L8 15 L12 22 L15.5 20 L11.5 13 L17.5 13 Z"
            fill="#0a0a0a"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Cancel (X) circle badge */}
          <circle cx="21" cy="21" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1.8" />
          <path d="M18 18 L24 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 18 L18 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      {/* 6. TEXT: CLASSIC macOS I-BEAM CURSOR */}
      {effectiveType === 'text' && (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]"
          style={{ transform: 'translate(-12px, -12px)' }}
        >
          <path
            d="M8 4 L16 4 M12 4 L12 20 M8 20 L16 20 M9 12 L15 12"
            stroke="#0a0a0a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M8 4 L16 4 M12 4 L12 20 M8 20 L16 20"
            stroke="#ffffff"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

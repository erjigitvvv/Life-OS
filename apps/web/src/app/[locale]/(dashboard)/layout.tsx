import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopHeader } from '@/components/navigation/TopHeader';
import { MacOSCursor } from '@/components/ui/MacOSCursor';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col md:flex-row select-none md:select-auto">
      <Sidebar locale={locale} />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-8 relative">
          {children}
        </main>
      </div>
      <MacOSCursor />
    </div>
  );
}

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopHeader } from '@/components/navigation/TopHeader';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar locale={locale} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

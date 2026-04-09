import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { FloatingFeedback } from '@/components/FloatingFeedback';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <FloatingFeedback />
    </div>
  );
}

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { FloatingFeedback } from '@/components/FloatingFeedback';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <FloatingFeedback />
    </div>
  );
}

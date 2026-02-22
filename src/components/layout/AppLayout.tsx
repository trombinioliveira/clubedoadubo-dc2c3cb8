import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Outlet />
      <MobileBottomNav />
    </div>
  );
}

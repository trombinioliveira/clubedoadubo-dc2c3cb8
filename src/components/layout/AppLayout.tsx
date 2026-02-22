import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Outlet />
    </div>
  );
}

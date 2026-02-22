import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export function MobileBottomNav() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || isAdmin) return null;

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { to: '/ciclo', label: 'Passo a passo', num: '1' },
    { to: '/dreams', label: 'Sonhos', num: '2' },
    { to: '/indicacoes', label: 'Indicações', num: '3' },
    { to: '/fifo', label: 'Fila FIFO', num: '4' },
    { to: '/dashboard', label: 'Meus PROs', icon: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 flex-1",
              isActive(link.to)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {link.icon ? (
              <Sparkles className="w-5 h-5 shrink-0" />
            ) : (
              <span className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0",
                isActive(link.to) ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
              )}>
                {link.num}
              </span>
            )}
            <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { Leaf, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView: 'landing' | 'dashboard';
  onNavigate: (view: 'landing' | 'dashboard') => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export const Header = ({ currentView, onNavigate, menuOpen, setMenuOpen }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl earth-gradient flex items-center justify-center shadow-soft">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">Clube do Adubo</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate('landing')}
            className={cn(
              "text-sm font-medium transition-colors",
              currentView === 'landing' ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Como funciona
          </button>
          <Button 
            onClick={() => onNavigate('dashboard')}
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
          >
            Meus PROs
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <button 
              onClick={() => { onNavigate('landing'); setMenuOpen(false); }}
              className="block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
            >
              Como funciona
            </button>
            <button 
              onClick={() => { onNavigate('dashboard'); setMenuOpen(false); }}
              className="block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors font-medium text-primary"
            >
              Meus PROs
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

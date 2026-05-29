import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logoImage from '@/assets/logo.webp';
import { useAuth } from '@/lib/auth';

export const PublicHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Início', path: '/inicio' },
    { label: 'Planos', path: '/planos' },
    { label: 'Transparência', path: '/transparencia' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contato', path: '/contato' },
  ];

  const logoTo = user ? '/jornada' : '/inicio';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to={logoTo} className="flex items-center gap-2 sm:gap-3">
            <img src={logoImage} alt="Clube do Adubo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm sm:text-base leading-tight">Clube do Adubo</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Economia Circular Urbana</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 lg:px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link to="/jornada" className="hidden sm:inline-flex">
                  <Button variant="default" size="sm" className="text-sm">
                    Minha jornada
                  </Button>
                </Link>
                <Link to="/jornada" className="sm:hidden">
                  <Button variant="default" size="sm" className="text-sm">
                    Jornada
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Criar conta
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default" size="sm" className="text-sm">
                    Entrar
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Micro-seal */}
      <div className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center py-1.5 text-[10px] sm:text-xs text-muted-foreground">
            ♻️ Ciclo transparente • Dados reais • Sem atalhos
          </p>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border/50 mt-2 pt-2">
                {user ? (
                  <Link to="/jornada" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="default" size="sm" className="w-full justify-start text-sm">
                      Minha jornada
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                      Criar conta
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

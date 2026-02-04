import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo.webp';

export const PublicFooter = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1 - Identity */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img 
                src={logoImage} 
                alt="Clube do Adubo" 
                className="w-8 h-8 object-contain" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm leading-tight">
                  Clube do Adubo
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Economia Circular Urbana
                </span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Um sistema urbano para transformar resíduo orgânico em impacto real.
            </p>
          </div>

          {/* Column 2 - Participation */}
          <div>
            <Link 
              to="/planos" 
              className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
            >
              Planos
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Veja como participar do ciclo
            </p>
          </div>

          {/* Column 3 - Trust */}
          <div>
            <Link 
              to="/transparencia" 
              className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
            >
              Transparência
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhe o resíduo, o ciclo e os dados
            </p>
          </div>

          {/* Column 4 - Education */}
          <div>
            <Link 
              to="/faq" 
              className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Tire dúvidas sobre PRO, fila e impacto
            </p>
          </div>

          {/* Column 5 - Human */}
          <div>
            <Link 
              to="/contato" 
              className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
            >
              Contato
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Fale com a gente. Pessoas reais.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Clube do Adubo — Economia Circular Urbana
            </p>
            <p className="text-sm text-muted-foreground/80 italic max-w-md">
              Transparência não é um detalhe. Ela sustenta o ciclo.<br />
              Sem resíduo real, não existe valor.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

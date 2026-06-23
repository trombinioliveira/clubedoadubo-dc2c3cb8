import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo.webp';

export const PublicFooter = () => {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link to="/loja" className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="Clube do Adubo"
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col items-start">
              <span className="font-bold text-foreground text-sm leading-tight">
                Clube do Adubo
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Loja de Adubos Orgânicos
              </span>
            </div>
          </Link>
          <Link
            to="/loja"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ir para a loja
          </Link>
        </div>
      </div>

      {/* Legal Links */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <span>•</span>
            <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/clubedoadubo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                📸 @clubedoadubo
              </a>
            </div>
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

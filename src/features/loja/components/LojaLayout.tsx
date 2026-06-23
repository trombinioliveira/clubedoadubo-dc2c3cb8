import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import logoImage from "@/assets/logo.webp";
import { CartProvider, useCart } from "../CartContext";
import { captureUtm } from "../utm";

const NAV_LINKS = [
  { to: "/loja#produtos", label: "Adubos Orgânicos", end: false },
  { to: "/loja/servicos-de-adubacao", label: "Adubação", end: false },
  { to: "/loja/produto/assinatura-mensal", label: "Assinatura", end: false },
  { to: "/loja#sobre", label: "Sobre", end: false },
];

const SECTION_IDS = ["produtos", "sobre"];

function LojaHeader() {
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scroll spy — destaca o link da seção visível enquanto rola a página
  useEffect(() => {
    if (location.pathname !== "/loja") {
      setActiveSection(null);
      return;
    }
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [location.pathname]);

  const isLinkActive = (to: string) => {
    const [path, hash] = to.split("#");
    if (location.pathname !== path) return false;
    if (hash) return activeSection === hash;
    return !activeSection;
  };

  const handleNav = (to: string) => (e: React.MouseEvent) => {
    const [path, hash] = to.split("#");
    if (!hash) return;
    e.preventDefault();
    if (location.pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", to);
    } else {
      navigate(to);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      {/* Desktop */}
      <div className="container mx-auto hidden h-16 items-center justify-between gap-2 px-4 md:flex">
        <Link to="/loja" className="flex items-center gap-3">
          <img src={logoImage} alt="Clube do Adubo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-base leading-tight">Clube do Adubo</span>
            <span className="text-xs text-muted-foreground leading-tight">Adubos orgânicos artesanais</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={handleNav(l.to)} className={isLinkActive(l.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
              {l.label}
            </Link>
          ))}
        </nav>

        <Link to="/loja/carrinho" aria-label="Carrinho" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-secondary-foreground">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile — logo centralizado, nav abaixo, tudo fixo */}
      <div className="flex flex-col items-center gap-2 px-4 py-3 md:hidden">
        <div className="relative flex w-full items-center justify-center">
          <Link to="/loja" className="flex flex-col items-center gap-1">
            <img src={logoImage} alt="Clube do Adubo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col items-center text-center">
              <span className="font-bold text-foreground text-sm leading-tight">Clube do Adubo</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Adubos orgânicos artesanais</span>
            </div>
          </Link>
          <Link to="/loja/carrinho" aria-label="Carrinho" className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-secondary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={handleNav(l.to)} className={isLinkActive(l.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function LojaFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} Clube do Adubo — Adubos orgânicos artesanais</p>
        <div className="flex gap-6">
          <Link to="/loja" className="hover:text-foreground">Produtos</Link>
          <Link to="/loja/servicos-de-adubacao" className="hover:text-foreground">Serviços de adubação</Link>
        </div>
      </div>
    </footer>
  );
}

export function LojaLayout() {
  const location = useLocation();

  // Preserva parâmetros UTM (Google Ads etc.) sem quebrar a navegação
  useEffect(() => {
    captureUtm();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location]);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <LojaHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <LojaFooter />
      </div>
    </CartProvider>
  );
}

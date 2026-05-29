import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, Leaf } from "lucide-react";
import logoImage from "@/assets/logo.webp";
import { CartProvider, useCart } from "../CartContext";
import {
  Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/loja#produtos", label: "Produtos", end: false },
  { to: "/loja/produto/assinatura-mensal", label: "Assinatura", end: false },
];

function LojaHeader() {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (to: string) => (e: React.MouseEvent) => {
    const [path, hash] = to.split("#");
    if (!hash) return;
    e.preventDefault();
    if (location.pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(to);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4">
        <Link to="/loja" className="flex items-center gap-2 sm:gap-3">
          <img src={logoImage} alt="Clube do Adubo" className="h-9 w-9 sm:h-10 sm:w-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm sm:text-base leading-tight">Clube do Adubo</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Economia Circular Urbana</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={handleNav(l.to)} className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/loja/carrinho" aria-label="Carrinho" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-secondary-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Menu mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={logoImage} alt="Clube do Adubo" className="h-6 w-6 object-contain" />
                  <span className="flex flex-col text-left leading-tight">
                    <span className="text-sm font-bold">Clube do Adubo</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Economia Circular Urbana</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <NavLink to={l.to} end={l.end} onClick={handleNav(l.to)} className={({ isActive }) => `rounded-lg px-3 py-3 text-base font-medium ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>
                      {l.label}
                    </NavLink>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link to="/loja/carrinho" className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                    Carrinho{totalItems > 0 ? ` (${totalItems})` : ""}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/" className="mt-2 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted">
                    ← Voltar ao Clube do Adubo
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function LojaFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} Clube do Adubo — Loja Virtual</p>
        <div className="flex gap-6">
          <Link to="/loja" className="hover:text-foreground">Produtos</Link>
          <Link to="/" className="hover:text-foreground">Voltar ao Clube</Link>
        </div>
      </div>
    </footer>
  );
}

export function LojaLayout() {
  const location = useLocation();

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

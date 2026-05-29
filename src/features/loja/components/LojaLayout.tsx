import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Leaf, ShoppingCart, Menu } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4">
        <Link to="/loja" className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full earth-gradient text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="truncate">Loja do Adubo</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Clube do Adubo
          </Link>
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
                  <Leaf className="h-5 w-5 text-primary" /> Loja do Adubo
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <NavLink to={l.to} end={l.end} className={({ isActive }) => `rounded-lg px-3 py-3 text-base font-medium ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>
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

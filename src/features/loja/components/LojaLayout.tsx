import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Leaf, ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "../CartContext";

function LojaHeader() {
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/loja" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-full earth-gradient text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span>Loja do Adubo</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <NavLink to="/loja" end className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
            Produtos
          </NavLink>
          <NavLink to="/loja/produto/assinatura-mensal" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
            Assinatura
          </NavLink>
          <NavLink to="/loja/admin" className={({ isActive }) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
            Admin
          </NavLink>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Clube do Adubo
          </Link>
        </nav>

        <Link to="/loja/carrinho" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-secondary-foreground">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

function LojaFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
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

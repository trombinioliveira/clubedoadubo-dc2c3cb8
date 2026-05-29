import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "../CartContext";
import { formatBRL } from "../data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SHIPPING_FLAT = 24.9;

export default function CartPage() {
  const { items, getProduct, updateQuantity, removeItem, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const hasOnlySubscription =
    items.length > 0 && items.every((i) => getProduct(i.productId)?.recurring);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      clear();
      toast.success("Pedido registrado (demonstração)", {
        description: "Esta é a vitrine visual. O checkout real será ativado com o Shopify.",
      });
      navigate("/loja");
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">Adicione adubos para continuar.</p>
        <Button asChild className="mt-6">
          <Link to="/loja">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Carrinho</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Itens */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <img src={product.image} alt={product.name} width={96} height={96} className="h-24 w-24 rounded-lg object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBRL(product.unitPrice)} / {product.unitLabel}
                        {product.recurring && " (mensal)"}
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    {product.recurring ? (
                      <span className="text-sm text-muted-foreground">Assinatura mensal</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, Math.max(product.minQuantity, item.quantity - 1))}
                          disabled={item.quantity <= product.minQuantity}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <span className="font-bold">{formatBRL(product.unitPrice * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo + checkout */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span>A combinar</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Entrega</h2>
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" required placeholder="Seu nome" />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp com DDD</Label>
              <Input id="whatsapp" type="tel" required placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" required placeholder="00000-000" />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" required placeholder="Rua, número, bairro, cidade/UF" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={placing}>
              {placing ? "Processando..." : "Finalizar pedido"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Vitrine de demonstração — o pagamento real será ativado com o Shopify.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

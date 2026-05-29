import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Check } from "lucide-react";
import { getProductBySlug, formatBRL } from "../data/products";
import { useCart } from "../CartContext";
import { SealGrid } from "../components/seals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(product?.minQuantity ?? 1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Button asChild className="mt-4">
          <Link to="/loja">Voltar à loja</Link>
        </Button>
      </div>
    );
  }

  const step = product.recurring ? 1 : 1;
  const min = product.minQuantity;
  const total = product.unitPrice * quantity;

  const handleAdd = () => {
    addItem(product.id, quantity);
    setAdded(true);
    toast.success("Adicionado ao carrinho", {
      description: `${quantity}x ${product.unitLabel} — ${product.name}`,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/loja" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
          {product.badge && (
            <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground">
              {product.badge}
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold md:text-3xl">{product.name}</h1>
          <p className="mt-3 text-muted-foreground">{product.description}</p>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-extrabold text-primary">
              {formatBRL(product.unitPrice)}
              {product.recurring ? (
                <span className="text-base font-medium text-muted-foreground">/mês</span>
              ) : (
                <span className="text-base font-medium text-muted-foreground"> / {product.unitLabel}</span>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{product.minLabel}</p>

            {!product.recurring && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium">Quantidade ({product.unitLabel})</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(min, q - step))}
                    disabled={quantity <= min}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => q + step)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Pedido mínimo: {min} {min > 1 ? "unidades" : "unidade"}.</p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">
                {product.recurring ? "Cobrança mensal" : "Subtotal"}
              </span>
              <span className="text-xl font-bold">
                {formatBRL(total)}
                {product.recurring && <span className="text-sm font-medium text-muted-foreground">/mês</span>}
              </span>
            </div>

            <Button onClick={handleAdd} size="lg" className="mt-4 w-full">
              {added ? (
                <><Check className="mr-2 h-5 w-5" /> Adicionado</>
              ) : product.recurring ? (
                "Assinar agora"
              ) : (
                "Adicionar ao carrinho"
              )}
            </Button>
            <Button asChild variant="outline" size="lg" className="mt-2 w-full">
              <Link to="/loja/carrinho">Ir para o carrinho</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "../CartContext";
import { formatBRL } from "../data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "5512996682454";
const CHECKOUT_STORAGE_KEY = "loja-checkout-dados";

export default function CartPage() {
  const { items, getProduct, updateQuantity, removeItem, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [saved, setSaved] = useState<{ nome: string; whatsapp: string; cep: string; endereco: string }>({
    nome: "",
    whatsapp: "",
    cep: "",
    endereco: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) setSaved((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // ignore
    }
  }, []);

  const persist = (field: string, value: string) => {
    setSaved((prev) => {
      const next = { ...prev, [field]: value };
      try {
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };


  const hasOnlySubscription =
    items.length > 0 && items.every((i) => getProduct(i.productId)?.recurring);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const nome = String(data.get("nome") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const cep = String(data.get("cep") ?? "").trim();
    const endereco = String(data.get("endereco") ?? "").trim();

    // Validação do WhatsApp: 10 ou 11 dígitos (DDD + número)
    const whatsappDigits = whatsapp.replace(/\D/g, "");
    if (whatsappDigits.length < 10 || whatsappDigits.length > 11) {
      toast.error("WhatsApp inválido", {
        description: "Informe o número com DDD, ex: (11) 99999-9999.",
      });
      return;
    }

    // Validação do CEP: 8 dígitos
    const cepDigits = cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      toast.error("CEP inválido", {
        description: "Informe um CEP com 8 dígitos, ex: 00000-000.",
      });
      return;
    }

    setPlacing(true);

    const linhas = items.map((i) => {
      const p = getProduct(i.productId);
      if (!p) return "";
      return `• ${i.quantity}x ${p.name} (${p.unitLabel}) — ${formatBRL(p.unitPrice * i.quantity)}`;
    }).filter(Boolean);

    const mensagem = [
      "Olá! Gostaria de finalizar meu pedido no Clube do Adubo.",
      "",
      "Itens:",
      ...linhas,
      "",
      `Subtotal: ${formatBRL(subtotal)}`,
      "",
      "Dados:",
      `Nome: ${nome}`,
      `WhatsApp: ${whatsapp}`,
      `CEP: ${cep}`,
      `Endereço: ${endereco}`,
      "",
      "Entrega/frete: A combinar pelo atendimento.",
      "",
      "Observação: Os adubos físicos são entregues em São Paulo Capital e no Litoral Norte/SP.",
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    setPlacing(false);
    clear();
    toast.success("Redirecionando para o WhatsApp", {
      description: "Finalize seu pedido na conversa que abrimos para você.",
    });
    navigate("/loja");
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
              <Label htmlFor="nome">Primeiro nome</Label>
              <Input id="nome" name="nome" required placeholder="Seu primeiro nome" />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp com DDD</Label>
              <Input id="whatsapp" name="whatsapp" type="tel" required placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" name="cep" required placeholder="00000-000" />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" name="endereco" required placeholder="Rua, número, bairro, cidade/UF" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={placing}>
              {placing ? "Processando..." : "Finalizar pedido"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Finalizaremos seu Pedido por Whatsapp para maior comodidade.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

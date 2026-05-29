import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package, DollarSign, ShoppingBag, RefreshCw, Pencil } from "lucide-react";
import { PRODUCTS, Product, formatBRL } from "../data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MockOrder {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: "Novo" | "Enviado" | "Entregue";
  date: string;
}

const MOCK_ORDERS: MockOrder[] = [
  { id: "#1042", customer: "Marina Souza", items: "4x Granulado 0,5 kg", total: 51.6 + 24.9, status: "Novo", date: "29/05/2026" },
  { id: "#1041", customer: "Carlos Lima", items: "Assinatura mensal", total: 99, status: "Enviado", date: "28/05/2026" },
  { id: "#1040", customer: "Ana Pereira", items: "4x Líquido 0,5 L", total: 75.6 + 24.9, status: "Entregue", date: "27/05/2026" },
];

const statusColor: Record<MockOrder["status"], string> = {
  Novo: "bg-accent text-accent-foreground",
  Enviado: "bg-secondary text-secondary-foreground",
  Entregue: "bg-primary text-primary-foreground",
};

export default function LojaAdminPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [editing, setEditing] = useState<Product | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const revenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
    return {
      revenue,
      orders: MOCK_ORDERS.length,
      products: products.length,
      subscriptions: 38,
    };
  }, [products]);

  const openEdit = (p: Product) => {
    setEditing(p);
    setPriceDraft(String(p.unitPrice));
    setOpen(true);
  };

  const savePrice = () => {
    if (!editing) return;
    const value = parseFloat(priceDraft.replace(",", "."));
    if (isNaN(value) || value <= 0) {
      toast.error("Informe um preço válido");
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === editing.id ? { ...p, unitPrice: value } : p))
    );
    toast.success("Preço atualizado (demonstração)");
    setOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Administração da Loja</h1>
          <p className="text-muted-foreground">Gestão de produtos, preços e pedidos.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/loja">Ver vitrine</Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: "Receita (mês)", value: formatBRL(stats.revenue) },
          { icon: ShoppingBag, label: "Pedidos", value: String(stats.orders) },
          { icon: Package, label: "Produtos", value: String(stats.products) },
          { icon: RefreshCw, label: "Assinantes", value: String(stats.subscriptions) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      {/* Produtos */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Produtos</h2>

        {/* Cards (mobile) */}
        <div className="space-y-3 md:hidden">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.unitLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.minLabel}</p>
                </div>
                <p className="shrink-0 font-bold text-primary">
                  {formatBRL(p.unitPrice)}{p.recurring && "/mês"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => openEdit(p)}>
                <Pencil className="mr-1 h-4 w-4" /> Editar preço
              </Button>
            </div>
          ))}
        </div>

        {/* Tabela (desktop) */}
        <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.unitLabel}</TableCell>
                  <TableCell className="text-muted-foreground">{p.minLabel}</TableCell>
                  <TableCell className="font-semibold">
                    {formatBRL(p.unitPrice)}{p.recurring && "/mês"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Pedidos */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Pedidos recentes</h2>

        {/* Cards (mobile) */}
        <div className="space-y-3 md:hidden">
          {MOCK_ORDERS.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{o.id}</p>
                <Badge className={statusColor[o.status]}>{o.status}</Badge>
              </div>
              <p className="mt-1 font-medium">{o.customer}</p>
              <p className="text-sm text-muted-foreground">{o.items}</p>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm text-muted-foreground">{o.date}</span>
                <span className="font-bold">{formatBRL(o.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela (desktop) */}
        <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{o.items}</TableCell>
                  <TableCell className="font-semibold">{formatBRL(o.total)}</TableCell>
                  <TableCell><Badge className={statusColor[o.status]}>{o.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar preço — {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="preco">Preço por {editing?.unitLabel}</Label>
            <Input id="preco" value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} placeholder="0,00" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={savePrice}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Painel de demonstração. A gestão real de estoque, pedidos e pagamentos será conectada via Shopify.
      </p>
    </div>
  );
}

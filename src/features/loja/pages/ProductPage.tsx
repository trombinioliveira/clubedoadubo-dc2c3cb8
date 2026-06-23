import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Check } from "lucide-react";
import { getProductBySlug, formatBRL } from "../data/products";
import { useCart } from "../CartContext";
import { SealGrid } from "../components/seals";
import { Seo } from "../components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "5512996682454";
const SITE_URL = "https://www.clubedoadubo.com.br";

const PRODUCT_SEO: Record<
  string,
  { title: string; description: string; ogTitle: string; ogDescription: string; productName: string }
> = {
  "adubo-liquido": {
    title: "Adubo Líquido Orgânico 0,5 L | Clube do Adubo",
    description:
      "Adubo líquido orgânico artesanal à base de húmus de minhoca para plantas, vasos, hortas e jardins. Entrega em São Paulo Capital e no Litoral Norte/SP.",
    ogTitle: "Adubo Líquido Orgânico 0,5 L | Clube do Adubo",
    ogDescription:
      "Adubo líquido orgânico à base de húmus de minhoca, produzido artesanalmente para o cuidado das suas plantas.",
    productName: "Adubo Líquido Orgânico 0,5 L",
  },
  "adubo-granulado": {
    title: "Adubo Granulado Orgânico 0,5 kg | Clube do Adubo",
    description:
      "Adubo granulado orgânico artesanal à base de húmus de minhoca para vasos, canteiros, hortas e jardins. Entrega em São Paulo Capital e no Litoral Norte/SP.",
    ogTitle: "Adubo Granulado Orgânico 0,5 kg | Clube do Adubo",
    ogDescription:
      "Adubo granulado orgânico à base de húmus de minhoca, ideal para misturar à terra de vasos, canteiros, hortas e jardins.",
    productName: "Adubo Granulado Orgânico 0,5 kg",
  },
};

function buildProductJsonLd(slug: string, price: number) {
  const seo = PRODUCT_SEO[slug];
  if (!seo) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: seo.productName,
    description:
      "Adubo orgânico à base de húmus de minhoca, produzido artesanalmente a partir da transformação de matéria orgânica.",
    brand: { "@type": "Brand", name: "Clube do Adubo" },
    category: "Adubo orgânico",
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/loja/produto/${slug}`,
    },
  };
}

const SUBSCRIPTION_SEALS = [
  "Produção artesanal",
  "Rico em húmus de minhoca",
  "Plano flexível",
  "Entrega local combinada",
];

function SubscriptionView({
  name,
  image,
}: {
  name: string;
  image: string;
}) {
  const [placing, setPlacing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const nome = String(data.get("nome") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const cep = String(data.get("cep") ?? "").trim();
    const endereco = String(data.get("endereco") ?? "").trim();
    const observacao = String(data.get("observacao") ?? "").trim();

    const whatsappDigits = whatsapp.replace(/\D/g, "");
    if (whatsappDigits.length < 10 || whatsappDigits.length > 11) {
      toast.error("WhatsApp inválido", {
        description: "Informe o número com DDD, ex: (11) 99999-9999.",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido", { description: "Informe um e-mail válido." });
      return;
    }

    setPlacing(true);

    // 1) Salvar solicitação no banco ANTES de abrir o WhatsApp.
    let externalReference = "";
    try {
      const res = await createClubeOrder({
        customer_name: nome,
        customer_whatsapp: whatsapp,
        customer_email: email,
        items: [
          {
            name: "Assinatura Mensal e Flexível de Adubos",
            type: "subscription",
            quantity: 1,
            price: null,
            label: "Plano sob medida",
          },
        ],
        quantity_total: 1,
        subtotal_amount: null,
        delivery_amount: null,
        discount_amount: 0,
        total_amount: null,
        order_type: "subscription_request",
        source_page: "/loja/produto/assinatura-mensal",
        payment_method: "whatsapp",
        delivery_method: "a_combinar",
        delivery_address: `${endereco} — CEP ${cep}`,
        notes: `Solicitação de assinatura mensal e flexível. Cliente deseja combinar quantidade, frequência, entrega e valor pelo WhatsApp. Observação do cliente: ${observacao || "—"}`,
      });
      externalReference = res.external_reference;
    } catch (err) {
      setPlacing(false);
      toast.error("Não conseguimos salvar sua solicitação agora", {
        description:
          "Tente novamente em alguns instantes ou fale com o Clube do Adubo pelo WhatsApp.",
      });
      return;
    }

    const mensagem = [
      "Olá! Quero montar uma Assinatura Mensal e Flexível de Adubos do Clube do Adubo.",
      "",
      "Pedido:",
      externalReference,
      "",
      "Meus dados:",
      `Nome: ${nome}`,
      `WhatsApp: ${whatsapp}`,
      `E-mail: ${email}`,
      `CEP: ${cep}`,
      `Endereço/cidade: ${endereco}`,
      `Observação: ${observacao}`,
      "",
      "Quero combinar quantidade, frequência, entrega e valor pelo WhatsApp.",
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
    setPlacing(false);
    toast.success("Redirecionando para o WhatsApp", {
      description: "Vamos montar sua assinatura na conversa que abrimos para você.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Seo
        title="Assinatura Mensal de Adubos Orgânicos | Clube do Adubo"
        description="Monte uma assinatura mensal e flexível de adubos orgânicos pelo WhatsApp. Plano sob medida para plantas, vasos, hortas e jardins."
        path="/loja/produto/assinatura-mensal"
        ogTitle="Assinatura Mensal e Flexível de Adubos | Clube do Adubo"
        ogDescription="Receba adubos orgânicos todo mês em um plano flexível, combinado pelo WhatsApp conforme suas plantas e região de entrega."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Assinatura Mensal e Flexível de Adubos",
          serviceType: "Assinatura de adubos orgânicos",
          provider: { "@type": "Organization", name: "Clube do Adubo" },
          areaServed: "São Paulo Capital e Litoral Norte/SP",
        }}
      />
      <Link to="/loja" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <img src={image} alt={name} width={1024} height={1024} className="h-full w-full object-cover" />
          <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground">Plano mensal</Badge>
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold md:text-3xl">{name}</h1>
          <p className="mt-3 text-muted-foreground">
            Receba adubos orgânicos em casa todo mês, conforme a necessidade das suas plantas.
            Você combina quantidade, frequência e entrega pelo WhatsApp.
          </p>
          <p className="mt-3 text-muted-foreground">
            Ideal para quem quer manter plantas, vasos, hortas ou jardins sempre bem cuidados,
            com adubos artesanais à base de húmus de minhoca.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SUBSCRIPTION_SEALS.map((s) => (
              <Badge key={s} variant="outline" className="border-primary/30 text-primary">
                {s}
              </Badge>
            ))}
          </div>

          <p className="mt-6 text-2xl font-extrabold text-primary">Plano sob medida</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Monte sua assinatura</h2>
            <p className="text-sm text-muted-foreground">
              Preencha seus dados e envie sua solicitação pelo WhatsApp. Vamos te ajudar a
              montar o melhor plano conforme suas plantas, frequência de uso e região de entrega.
            </p>
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
              <Label htmlFor="endereco">Endereço ou cidade/bairro</Label>
              <Input id="endereco" name="endereco" required placeholder="Cidade, bairro ou endereço" />
            </div>
            <div>
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea id="observacao" name="observacao" placeholder="Conte quais plantas, vasos, horta ou jardim você quer cuidar" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={placing} data-analytics-event="subscription_whatsapp">
              {placing ? "Processando..." : "Montar assinatura pelo WhatsApp"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              A assinatura é flexível e combinada pelo WhatsApp. Entrega disponível em São Paulo
              Capital e no Litoral Norte/SP.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

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

  if (product.recurring) {
    return (
      <SubscriptionView
        name="Assinatura Mensal e Flexível de Adubos"
        image={product.image}
      />
    );
  }

  const step = 1;
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
      <Seo
        title={PRODUCT_SEO[product.slug]?.title ?? `${product.name} | Clube do Adubo`}
        description={PRODUCT_SEO[product.slug]?.description ?? product.shortDescription}
        path={`/loja/produto/${product.slug}`}
        ogType="product"
        ogTitle={PRODUCT_SEO[product.slug]?.ogTitle}
        ogDescription={PRODUCT_SEO[product.slug]?.ogDescription}
        jsonLd={buildProductJsonLd(product.slug, product.unitPrice)}
      />
      <Link to="/loja" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-analytics-event="back_to_store">
        <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
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

          <SealGrid layout="scroll" className="mt-5 sm:hidden" />
          <SealGrid className="mt-5 hidden grid-cols-4 sm:grid lg:grid-cols-4" size="sm" />

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-3xl font-extrabold text-primary">
              {formatBRL(product.unitPrice)}
              <span className="text-base font-medium text-muted-foreground"> / {product.unitLabel}</span>
            </p>
            {product.minLabel && (
              <p className="mt-1 text-sm text-muted-foreground">{product.minLabel}</p>
            )}

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
              {min > 1 && (
                <p className="mt-2 text-xs text-muted-foreground">Pedido mínimo: {min} unidades.</p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold">{formatBRL(total)}</span>
            </div>

            <Button onClick={handleAdd} size="lg" className="mt-4 w-full" data-analytics-event="add_to_cart">
              {added ? (
                <><Check className="mr-2 h-5 w-5" /> Adicionado</>
              ) : (
                "Adicionar ao carrinho"
              )}
            </Button>
            <Button asChild variant="outline" size="lg" className="mt-2 w-full">
              <Link to="/loja/carrinho" data-analytics-event="go_to_cart">Ir para o carrinho</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

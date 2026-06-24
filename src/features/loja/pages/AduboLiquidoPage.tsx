import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Sprout,
  Droplets,
  ShieldCheck,
  Truck,
  MessageCircle,
  Instagram,
  CheckCircle2,
} from "lucide-react";
import liquidoImg from "../assets/liquido.jpg";
import { Seo } from "../components/Seo";
import { SealsSection } from "../components/seals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pushWhatsappClick, type WhatsappOffer } from "../dataLayer";

const WHATSAPP_NUMBER = "5512996682454";
const INSTAGRAM_URL = "https://instagram.com/clubedoadubo";

const MESSAGES: Record<WhatsappOffer, string> = {
  unidade:
    "Olá! Quero comprar 1 unidade do Adubo Líquido Orgânico 0,5 L (R$ 15) do Clube do Adubo.",
  kit_3:
    "Olá! Quero comprar o Kit com 3 unidades do Adubo Líquido Orgânico 0,5 L do Clube do Adubo.",
  assinatura:
    "Olá! Quero saber mais sobre a assinatura mensal do Adubo Líquido Orgânico 0,5 L do Clube do Adubo.",
  cta_final:
    "Olá! Quero comprar o Adubo Líquido Orgânico 0,5 L do Clube do Adubo.",
};

function whatsappUrl(offer: WhatsappOffer): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGES[offer])}`;
}

const PRODUCT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Adubo Líquido Orgânico 0,5 L",
  description:
    "Adubo líquido orgânico à base de húmus de minhoca, produzido artesanalmente para plantas, vasos, hortas e jardins.",
  brand: { "@type": "Brand", name: "Clube do Adubo" },
  category: "Adubo orgânico",
  offers: {
    "@type": "Offer",
    price: "15.00",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    url: "https://www.clubedoadubo.com.br/loja/adubo-liquido",
  },
};

interface WhatsAppButtonProps {
  id: string;
  offer: WhatsappOffer;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
  size?: "default" | "lg";
}

function WhatsAppButton({
  id,
  offer,
  children,
  variant = "default",
  className,
  size = "lg",
}: WhatsAppButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
    >
      <a
        id={id}
        href={whatsappUrl(offer)}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-offer={offer}
        onClick={() => pushWhatsappClick(offer)}
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        {children}
      </a>
    </Button>
  );
}

const BENEFITS = [
  { icon: Leaf, title: "100% orgânico", text: "À base de húmus de minhoca e matéria orgânica transformada." },
  { icon: Sprout, title: "Plantas mais fortes", text: "Nutre vasos, hortas e jardins de forma natural." },
  { icon: ShieldCheck, title: "Produção artesanal", text: "Feito em pequenos lotes, com cuidado em cada etapa." },
  { icon: Droplets, title: "Fácil de usar", text: "Líquido pronto para diluir e aplicar na rega." },
];

const HOW_TO_USE = [
  "Dilua aproximadamente 1 parte de adubo líquido em 10 partes de água.",
  "Regue a terra ao redor da planta, evitando encharcar.",
  "Aplique a cada 15 dias para manter as plantas verdes e saudáveis.",
];

export default function AduboLiquidoPage() {
  return (
    <div>
      <Seo
        title="Adubo Líquido Orgânico | Clube do Adubo"
        description="Compre adubo líquido orgânico à base de húmus de minhoca para plantas mais fortes, verdes e saudáveis. Atendimento pelo WhatsApp."
        path="/loja/adubo-liquido"
        ogType="product"
        ogTitle="Adubo Líquido Orgânico 0,5 L | Clube do Adubo"
        ogDescription="Adubo líquido orgânico à base de húmus de minhoca para plantas mais fortes, verdes e saudáveis. Atendimento pelo WhatsApp."
        jsonLd={PRODUCT_JSONLD}
      />

      {/* Hero */}
      <section className="earth-gradient text-primary-foreground">
        <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className="text-center md:text-left">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">Mais vendido</Badge>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              Adubo Líquido Orgânico
            </h1>
            <p className="mt-4 max-w-xl text-base opacity-90 md:text-lg">
              Húmus de minhoca em forma líquida para deixar suas plantas mais
              fortes, verdes e saudáveis. Ideal para vasos, hortas e jardins.
            </p>
            <div className="mt-6 flex items-baseline justify-center gap-2 md:justify-start">
              <span className="text-4xl font-extrabold md:text-5xl">R$ 15</span>
              <span className="text-lg opacity-90">/ garrafa de 0,5 L</span>
            </div>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
              <WhatsAppButton id="whatsapp-adubo-liquido-unidade" offer="unidade" variant="secondary">
                Comprar pelo WhatsApp
              </WhatsAppButton>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm opacity-90 md:justify-start">
              <Truck className="h-4 w-4" />
              Entrega em São Paulo Capital e Litoral Norte/SP
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-elevated">
            <img
              src={liquidoImg}
              alt="Adubo Líquido Orgânico 0,5 L do Clube do Adubo"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ofertas */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Escolha como comprar</h2>
          <p className="mt-3 text-muted-foreground">
            Atendimento manual e direto pelo WhatsApp. É só clicar e combinar a entrega.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Unidade */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-lg font-bold">1 unidade</h3>
            <p className="mt-1 text-sm text-muted-foreground">Garrafa de 0,5 L para começar.</p>
            <p className="mt-4 text-3xl font-extrabold text-primary">R$ 15</p>
            <p className="text-xs text-muted-foreground">por garrafa de 0,5 L</p>
            <WhatsAppButton
              id="whatsapp-adubo-liquido-unidade"
              offer="unidade"
              className="mt-6 w-full"
            >
              Comprar 1 unidade
            </WhatsAppButton>
          </div>

          {/* Kit 3 — destaque */}
          <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-6 shadow-elevated">
            <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">Mais econômico</Badge>
            <h3 className="text-lg font-bold">Kit com 3 unidades</h3>
            <p className="mt-1 text-sm text-muted-foreground">3 garrafas de 0,5 L para durar mais.</p>
            <p className="mt-4 text-3xl font-extrabold text-primary">R$ 45</p>
            <p className="text-xs text-muted-foreground">3 garrafas de 0,5 L</p>
            <WhatsAppButton
              id="whatsapp-adubo-liquido-kit3"
              offer="kit_3"
              className="mt-6 w-full"
            >
              Comprar kit de 3
            </WhatsAppButton>
          </div>

          {/* Assinatura */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-lg font-bold">Assinatura mensal</h3>
            <p className="mt-1 text-sm text-muted-foreground">Receba todo mês, sem precisar lembrar.</p>
            <p className="mt-4 text-3xl font-extrabold text-primary">Sob medida</p>
            <p className="text-xs text-muted-foreground">combine quantidade e frequência</p>
            <WhatsAppButton
              id="whatsapp-adubo-liquido-assinatura"
              offer="assinatura"
              variant="outline"
              className="mt-6 w-full"
            >
              Quero assinar
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* Como usar */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Como usar</h2>
            <ul className="mt-5 space-y-3">
              {HOW_TO_USE.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Entrega e retirada</h2>
            <p className="mt-5 text-muted-foreground">
              Entregamos em São Paulo Capital e no Litoral Norte/SP. Também é
              possível combinar a retirada. Os detalhes de entrega, prazo e
              pagamento são combinados diretamente com você pelo WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Selos */}
      <SealsSection />

      {/* CTA final */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-14 text-center md:py-20">
          <h2 className="mx-auto max-w-2xl text-2xl font-bold md:text-3xl">
            Pronto para deixar suas plantas mais verdes?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Fale com a gente pelo WhatsApp e receba seu Adubo Líquido Orgânico.
          </p>
          <div className="mt-8 flex justify-center">
            <WhatsAppButton id="whatsapp-final-cta" offer="cta_final">
              Comprar pelo WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* Rodapé com links úteis */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Clube do Adubo — Adubos orgânicos artesanais</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/politica-de-privacidade" className="hover:text-foreground">
              Política de Privacidade
            </Link>
            <Link to="/contato" className="hover:text-foreground">
              Contato
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href={whatsappUrl("cta_final")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => pushWhatsappClick("cta_final")}
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Truck, RefreshCw } from "lucide-react";
import { PRODUCTS, formatBRL } from "../data/products";
import { SealsSection, SealStrip } from "../components/seals";
import { Seo } from "../components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LOJA_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Clube do Adubo",
  url: "https://www.clubedoadubo.com.br/loja",
  description:
    "Adubos líquidos e granulados à base de húmus de minhoca, produzidos artesanalmente para plantas, vasos, hortas e jardins.",
};

export default function LojaPage() {
  return (
    <div>
      <Seo
        title="Clube do Adubo | Adubos orgânicos artesanais"
        description="Compre adubo líquido e granulado à base de húmus de minhoca. Entrega em São Paulo Capital e no Litoral Norte/SP. Brasil via Adubo Digital."
        path="/loja"
        ogTitle="Clube do Adubo | Adubos orgânicos artesanais"
        ogDescription="Adubos líquidos e granulados à base de húmus de minhoca, produzidos artesanalmente para plantas, vasos, hortas e jardins."
        jsonLd={LOJA_JSONLD}
      />
      {/* Hero */}
      <section className="earth-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center md:py-24">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold md:text-5xl">
            Adubos premium artesanais, direto para suas plantas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base opacity-90 md:text-lg whitespace-pre-line">
            {"Adubos líquidos e granulados à base de húmus de minhoca, feitos artesanalmente para plantas, vasos, hortas e jardins.\n\n\nEntregamos para\u00a0toda São Paulo Capital e Litoral Norte/SP."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href="#produtos" data-analytics-event="view_products">Ver produtos</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/10 text-primary-foreground border-primary-foreground/40 hover:bg-background/20">
              <Link to="/loja/adubo-digital" data-analytics-event="view_adubo_digital">Conheça o Adubo Digital</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: Leaf, title: "Orgânico artesanal", text: "À base de húmus de minhoca e matéria orgânica transformada." },
            { icon: Truck, title: "Entrega local", text: "São Paulo Capital e Litoral Norte/SP." },
            { icon: RefreshCw, title: "Brasil via Adubo Digital", text: "Para outras regiões, participe digitalmente do ciclo." },
          ].map(({ icon: Icon, title, text }) => (
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

      {/* Produtos */}
      <section id="produtos" className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">Nossos adubos orgânicos</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => {
            const isAssinatura = product.category === "assinatura";
            const cardName = isAssinatura ? "Assinatura Mensal e Flexível de Adubos" : product.name;
            const cardDescription = isAssinatura
              ? "Receba adubos em casa todo mês, conforme a necessidade das suas plantas. Você combina quantidade, frequência e entrega pelo WhatsApp."
              : product.shortDescription;
            const cardBadge = isAssinatura ? "Plano mensal" : product.badge;
            return (
            <Link
              key={product.id}
              to={`/loja/produto/${product.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:shadow-elevated"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={cardName}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {cardBadge && (
                  <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">
                    {cardBadge}
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold">{cardName}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {cardDescription}
                </p>
                <SealStrip className="mt-3" />
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    {isAssinatura ? (
                      <p className="text-xl font-extrabold text-primary">Plano sob medida</p>
                    ) : (
                      <>
                        <p className="text-xl font-extrabold text-primary">
                          {formatBRL(product.unitPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">{product.minLabel}</p>
                      </>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-primary group-hover:underline">
                    {isAssinatura ? "Montar minha assinatura →" : "Ver mais →"}
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      {/* Selos — diferenciação artesanal */}
      <SealsSection />


      {/* Sobre — o que fazemos */}
      <section id="sobre" className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">O que fazemos</h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Transformamos resíduos orgânicos urbanos em adubo de verdade. No Litoral
              Norte/SP e em São Paulo Capital, coletamos e processamos matéria orgânica
              para produzir adubos artesanais à base de húmus de minhoca.
            </p>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Os adubos físicos são entregues em São Paulo Capital e no Litoral Norte/SP.
              Para outras regiões do Brasil, o Clube do Adubo se conecta ao Adubo Digital:
              você participa digitalmente e o ciclo acontece fisicamente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

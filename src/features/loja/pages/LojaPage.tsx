import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Truck, RefreshCw } from "lucide-react";
import { PRODUCTS, formatBRL } from "../data/products";
import { SealsSection, SealStrip } from "../components/seals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LojaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="earth-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center md:py-24">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold md:text-5xl">
            Adubo orgânico de verdade, direto na sua porta
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base opacity-90 md:text-lg">
            Adubos granulados e líquidos produzidos a partir do ciclo do Clube do Adubo.
            Compre avulso ou assine e receba todo mês, com entrega para todo o Brasil.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href="#produtos">Ver produtos</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/10 text-primary-foreground border-primary-foreground/40 hover:bg-background/20">
              <Link to="/loja/produto/assinatura-mensal">Quero assinar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: Leaf, title: "100% orgânico", text: "Feito do processamento de resíduos orgânicos reais." },
            { icon: Truck, title: "Entrega Brasil", text: "Enviamos para todo o território nacional." },
            { icon: RefreshCw, title: "Assinatura flexível", text: "Receba mensalmente e ajuste quando quiser." },
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
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">Adubos Orgânicos</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to={`/loja/produto/${product.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:shadow-elevated"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {product.badge && (
                  <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">
                    {product.badge}
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {product.shortDescription}
                </p>
                <SealStrip className="mt-3" />
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-primary">
                      {formatBRL(product.unitPrice)}
                      {product.recurring && <span className="text-sm font-medium text-muted-foreground">/mês</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.minLabel}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary group-hover:underline">
                    Ver mais →
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
              Transformamos resíduos orgânicos urbanos em adubo de verdade. A cidade
              produz resíduo, a gente processa e devolve à terra em forma de adubos
              granulados e líquidos — fechando o ciclo da economia circular urbana.
            </p>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Cada compra aqui leva esse adubo até a sua casa, com entrega para todo o
              Brasil, e ajuda a manter o ciclo girando.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

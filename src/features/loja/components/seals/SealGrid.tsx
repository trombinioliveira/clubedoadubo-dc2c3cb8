import React from "react";
import { cn } from "@/lib/utils";
import { ProductSeal, type ProductSealProps } from "./ProductSeal";
import { PRIMARY_SEALS, SECONDARY_SEALS, ALL_SEALS, type SealDef } from "./seals";

type Variant = ProductSealProps["variant"];
type Size = ProductSealProps["size"];

interface SealGridProps {
  seals?: SealDef[];
  variant?: Variant;
  size?: Size;
  /** layout: grade responsiva ou scroll horizontal suave (ideal mobile) */
  layout?: "grid" | "scroll";
  className?: string;
}

export function SealGrid({
  seals = ALL_SEALS,
  variant = "default",
  size = "md",
  layout = "grid",
  className,
}: SealGridProps) {
  if (layout === "scroll") {
    return (
      <div
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
      >
        {seals.map((s) => (
          <div key={s.id} className="snap-start shrink-0">
            <ProductSeal title={s.title} icon={s.icon} variant={variant} size={size} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-3 place-items-center gap-4 sm:grid-cols-4 md:gap-6 lg:grid-cols-6",
        className
      )}
    >
      {seals.map((s) => (
        <ProductSeal key={s.id} title={s.title} icon={s.icon} variant={variant} size={size} />
      ))}
    </div>
  );
}

/** Tira compacta de selos (pílulas) — ideal para cards e checkout */
export function SealStrip({
  seals = PRIMARY_SEALS,
  variant = "default",
  className,
}: {
  seals?: SealDef[];
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {seals.map((s) => (
        <ProductSeal key={s.id} title={s.title} icon={s.icon} variant={variant} compact />
      ))}
    </div>
  );
}

/** Seção pronta de selos para a loja / landing */
export function SealsSection({ className }: { className?: string }) {
  return (
    <section className={cn("border-t border-border bg-background", className)}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-seal-moss">
            Natural · Vivo · Local
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Por que nosso adubo é diferente
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Cada selo representa um compromisso real com produção artesanal,
            solo vivo e regeneração — um adubo feito com cuidado, origem e impacto local.
          </p>
        </div>

        <div className="mt-10">
          {/* Mobile: scroll horizontal suave / Desktop: grade */}
          <div className="md:hidden">
            <SealGrid seals={PRIMARY_SEALS} layout="scroll" />
          </div>
          <div className="hidden md:block">
            <SealGrid seals={PRIMARY_SEALS} className="lg:grid-cols-4" />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {SECONDARY_SEALS.map((s) => (
            <ProductSeal key={s.id} {...s} variant="beige" compact />
          ))}
        </div>
      </div>
    </section>
  );
}

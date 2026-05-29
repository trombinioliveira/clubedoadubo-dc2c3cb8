import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { SEAL_ICONS, type SealIconName } from "./SealIcons";

const sealVariants = cva(
  "group/seal relative flex select-none flex-col items-center justify-center rounded-full border-2 text-center transition-transform duration-300 ease-out will-change-transform",
  {
    variants: {
      variant: {
        default: "border-seal-moss/50 bg-seal-cream text-seal-deep shadow-[0_2px_10px_-4px_hsl(var(--seal-ink)/0.2)]",
        mono: "border-current bg-transparent text-seal-ink",
        negative: "border-seal-moss/60 bg-seal-deep text-seal-cream shadow-[0_4px_14px_-6px_hsl(var(--seal-ink)/0.5)]",
        beige: "border-seal-moss/40 bg-seal-beige text-seal-deep",
      },
      size: {
        sm: "h-20 w-20 gap-1 p-2",
        md: "h-24 w-24 gap-1.5 p-2.5",
        lg: "h-28 w-28 gap-1.5 p-3",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

const iconSize = { sm: "h-6 w-6", md: "h-7 w-7", lg: "h-8 w-8" } as const;
const labelSize = { sm: "text-[9px]", md: "text-[10px]", lg: "text-[11px]" } as const;

export interface ProductSealProps extends VariantProps<typeof sealVariants> {
  title: string;
  icon: SealIconName;
  /** versão compacta em formato de pílula (icon + texto inline) */
  compact?: boolean;
  className?: string;
}

export function ProductSeal({
  title,
  icon,
  variant = "default",
  size = "md",
  compact = false,
  className,
}: ProductSealProps) {
  const Icon = SEAL_ICONS[icon];

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-transform duration-200 hover:scale-[1.03]",
          variant === "negative"
            ? "border-seal-moss/60 bg-seal-deep text-seal-cream"
            : variant === "mono"
              ? "border-current bg-transparent text-seal-ink"
              : "border-seal-moss/40 bg-seal-cream text-seal-deep",
          className
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="leading-none">{title}</span>
      </span>
    );
  }

  const s = (size ?? "md") as keyof typeof iconSize;

  return (
    <div
      className={cn(sealVariants({ variant, size }), "hover:scale-[1.04]", className)}
      role="img"
      aria-label={title}
      title={title}
    >
      {/* anel interno tracejado — toque de carimbo artesanal */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[6px] rounded-full border border-dashed border-current opacity-30"
      />
      <Icon className={cn(iconSize[s], "shrink-0")} />
      <span className={cn(labelSize[s], "px-1 font-extrabold uppercase leading-tight tracking-wide")}>
        {title}
      </span>
    </div>
  );
}

export default ProductSeal;

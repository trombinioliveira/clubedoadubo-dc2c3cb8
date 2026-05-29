import React from "react";

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Mão segurando uma folha — produção artesanal */
export const HandLeafIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M12 3c2.6 0 4.7 2.1 4.7 4.7 0 2.9-2.2 5-4.7 5.6C9.5 12.7 7.3 10.6 7.3 7.7 7.3 5.1 9.4 3 12 3Z" />
    <path d="M12 4.5v8.2" />
    <path d="M4 14c1.7-.4 3 .3 4 1.4l1.7 1.8c.4.4 1 .6 1.5.6H15c.9 0 1.6.7 1.6 1.6 0 .2 0 .3-.1.5" />
    <path d="M20 13.5c-1.4.2-2.4 1-3 1.9" />
  </svg>
);

/** Solo com minhoca — rico em húmus de minhoca */
export const SoilWormIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M3 16h18" opacity="0.5" />
    <path d="M3 19.5h18" />
    <path d="M5 12.5c1.3 0 1.3 1.6 2.6 1.6S8.9 10 10.2 10s1.3 2.5 2.6 2.5 1.3-2 2.6-2 1.3 1.5 2.6 1.5" />
    <circle cx="18" cy="11.6" r="0.5" fill="currentColor" />
    <path d="M7 6.5v1.5M11 5v2M15 6.5v1.5" opacity="0.6" />
  </svg>
);

/** Ciclo orgânico circular — economia circular */
export const CircularCycleIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M18.5 8A7 7 0 0 0 6 6.5" />
    <path d="M5.5 16A7 7 0 0 0 18 17.5" />
    <path d="M18.5 4v4h-4" />
    <path d="M5.5 20v-4h4" />
    <path d="M12 9.5c1.4 0 2.5 1.1 2.5 2.5S13.4 14.5 12 14.5 9.5 13.4 9.5 12" opacity="0.6" />
  </svg>
);

/** Folha simples — sem fertilizantes químicos */
export const LeafIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M19 4c0 8-5 13-12 13 0-7 5-13 12-13Z" />
    <path d="M12 17C9 14 8 10 7 8" opacity="0.6" />
  </svg>
);

/** Broto no solo — solo vivo */
export const LivingSoilIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M4 18h16" />
    <path d="M12 18v-6" />
    <path d="M12 12c0-2 1.5-3.5 3.5-3.5C15.5 10.5 14 12 12 12Z" />
    <path d="M12 13c0-2-1.5-3.5-3.5-3.5C8.5 11.5 10 13 12 13Z" />
    <path d="M6 21c.8-1 2-1.5 3-1.5M18 21c-.8-1-2-1.5-3-1.5" opacity="0.5" />
  </svg>
);

/** Compostagem natural — folhas em decomposição */
export const CompostIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M4 14c0 3.3 3.6 6 8 6s8-2.7 8-6" />
    <path d="M4 14c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    <path d="M9 13c1-1.5 2-2 3-2s2 .5 3 2" opacity="0.6" />
    <path d="M12 8V4M12 4c1.2 0 2-.8 2-2M12 4c-1.2 0-2-.8-2-2" />
  </svg>
);

/** Pino de localização com folha — produção local */
export const LocalIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M12 21c4-4 6-7 6-10a6 6 0 1 0-12 0c0 3 2 6 6 10Z" />
    <path d="M12 8.5c1.8 0 2.8 1.4 2.8 1.4S13.8 12 12 12 9.2 9.9 9.2 9.9 10.2 8.5 12 8.5Z" />
  </svg>
);

/** Montanha e mar — feito em Cambury */
export const CamburyIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M3 15l4-6 3 4 3-5 4 7" />
    <path d="M3 19c1.2 0 1.2-1 2.5-1S6.7 19 8 19s1.2-1 2.5-1 1.3 1 2.5 1 1.2-1 2.5-1 1.3 1 2.5 1" />
    <circle cx="17" cy="6.5" r="1.5" opacity="0.7" />
  </svg>
);

/** Mão com broto — impacto positivo local */
export const PositiveImpactIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M4 21c0-2.2 1.8-4 4-4h2.5c1 0 1.5-.6 1.5-1.4 0 0 4-1.1 5.5-1.1S20 16 18 17l-3 1.5" />
    <path d="M12 13V8" />
    <path d="M12 8c0-2 1.5-3 3.2-3C15.2 7 13.7 8 12 8Z" />
    <path d="M12 9c0-2-1.5-3-3.2-3C8.8 8 10.3 9 12 9Z" />
  </svg>
);

/** Células — microvida ativa */
export const MicrolifeIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <circle cx="8" cy="9" r="3.2" />
    <circle cx="16" cy="14" r="3.6" />
    <circle cx="8" cy="9" r="0.6" fill="currentColor" />
    <circle cx="16" cy="14" r="0.6" fill="currentColor" />
    <path d="M14 7l1.5-1M18.5 12.5L20 11" opacity="0.5" />
  </svg>
);

/** Camadas de solo — alta matéria orgânica */
export const OrganicMatterIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M4 8c1.3-1 2.7-1 4 0s2.7 1 4 0 2.7-1 4 0 2.7 1 4 0" opacity="0.5" />
    <path d="M4 13c1.3-1 2.7-1 4 0s2.7 1 4 0 2.7-1 4 0 2.7 1 4 0" />
    <path d="M4 18c1.3-1 2.7-1 4 0s2.7 1 4 0 2.7-1 4 0 2.7 1 4 0" />
  </svg>
);

export const SEAL_ICONS = {
  hand: HandLeafIcon,
  worm: SoilWormIcon,
  cycle: CircularCycleIcon,
  leaf: LeafIcon,
  soil: LivingSoilIcon,
  compost: CompostIcon,
  local: LocalIcon,
  cambury: CamburyIcon,
  impact: PositiveImpactIcon,
  microlife: MicrolifeIcon,
  matter: OrganicMatterIcon,
} as const;

export type SealIconName = keyof typeof SEAL_ICONS;

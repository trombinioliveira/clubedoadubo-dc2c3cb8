import type { SealIconName } from "./SealIcons";

export interface SealDef {
  id: string;
  title: string;
  icon: SealIconName;
}

/** Selos principais — diferenciação contra adubo industrial */
export const PRIMARY_SEALS: SealDef[] = [
  { id: "artesanal", title: "Produção Artesanal", icon: "hand" },
  { id: "humus", title: "Rico em Húmus de Minhoca", icon: "worm" },
  { id: "circular", title: "Ciclo Orgânico", icon: "cycle" },
  { id: "sem-quimicos", title: "Sem Fertilizantes Químicos", icon: "leaf" },
];

/** Selos secundários — reforço de naturalidade e território */
export const SECONDARY_SEALS: SealDef[] = [
  { id: "solo-vivo", title: "Solo Vivo", icon: "soil" },
  { id: "compostagem", title: "Compostagem Natural", icon: "compost" },
  { id: "local", title: "Produção Local", icon: "local" },
  { id: "cambury", title: "Feito em Cambury", icon: "cambury" },
  { id: "impacto", title: "Impacto Positivo Local", icon: "impact" },
  { id: "microvida", title: "Microvida Ativa", icon: "microlife" },
  { id: "materia", title: "Alta Matéria Orgânica", icon: "matter" },
];

export const ALL_SEALS = [...PRIMARY_SEALS, ...SECONDARY_SEALS];

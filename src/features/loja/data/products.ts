import granuladoImg from "../assets/granulado.jpg";
import liquidoImg from "../assets/liquido.jpg";
import assinaturaImg from "../assets/assinatura.jpg";

export interface ProductVariant {
  id: string;
  label: string;
  /** preço por unidade da variante */
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "granulado" | "liquido" | "assinatura";
  shortDescription: string;
  description: string;
  image: string;
  /** unidade vendida (ex: "saco de 0,5 kg") */
  unitLabel: string;
  /** quantidade mínima de unidades por pedido */
  minQuantity: number;
  /** preço por unidade */
  unitPrice: number;
  /** texto auxiliar de unidade mínima */
  minLabel: string;
  badge?: string;
  /** assinatura recorrente */
  recurring?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "liquido-05l",
    slug: "adubo-liquido",
    name: "Adubo Líquido Orgânico",
    category: "liquido",
    shortDescription: "Garrafas de 0,5 L de Fertilizante líquido a base de Húmus de Minhoca, pronto para borrifar nas folhas ou colocar no seus vasos e jardins.",
    description:
      "Adubo líquido concentrado rico em nutrientes, resultado do processamento da matéria orgânica. Rápida absorção pelas plantas, ideal para adubação foliar e de cobertura. Vendido em garrafas de 0,5 L.",
    image: liquidoImg,
    unitLabel: "garrafa de 0,5 L",
    minQuantity: 1,
    unitPrice: 15.0,
    minLabel: "",
    badge: "Mais vendido",
  },
  {
    id: "granulado-05kg",
    slug: "adubo-granulado",
    name: "Adubo Granulado Orgânico",
    category: "granulado",
    shortDescription: "Sacos de 0,5 Kg de adubo granulado 100% orgânico. Pronto para forrar seus vasos ou colocar no seu jardim.",
    description:
      "Adubo granulado produzido a partir do processamento de resíduos orgânicos do Clube do Adubo. Liberação gradual de nutrientes, ideal para hortas, jardins e vasos. Vendido em sacos de 0,5 kg.",
    image: granuladoImg,
    unitLabel: "saco de 0,5 kg",
    minQuantity: 1,
    unitPrice: 15.0,
    minLabel: "",
  },
  {
    id: "assinatura-mensal",
    slug: "assinatura-mensal",
    name: "Assinatura Mensal de Adubos",
    category: "assinatura",
    shortDescription: "Receba adubos em casa todo mês conforme sua necessidade.",
    description:
      "Plano de assinatura mensal: receba uma seleção de adubos granulados e líquidos em casa, com frete incluso para todo o Brasil. Ajuste, pause ou cancele quando quiser. Ideal para quem mantém horta ou jardim ativos o ano todo.",
    image: assinaturaImg,
    unitLabel: "plano mensal",
    minQuantity: 1,
    unitPrice: 99,
    minLabel: "R$ 99 / mês — frete incluso",
    badge: "Frete grátis",
    recurring: true,
  },
];

export const getProductBySlug = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

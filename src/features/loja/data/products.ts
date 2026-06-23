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
    shortDescription: "Garrafa de 0,5 L de adubo líquido orgânico à base de húmus de minhoca. Ideal para plantas, vasos, hortas e jardins.",
    description:
      "Adubo líquido orgânico à base de húmus de minhoca, produzido artesanalmente a partir da transformação de matéria orgânica. Ideal para o cuidado de plantas, vasos, hortas e jardins. Vendido em garrafa de 0,5 L.",
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
    shortDescription: "Saco de 0,5 kg de adubo granulado orgânico à base de húmus de minhoca. Ideal para misturar à terra de vasos, canteiros, hortas e jardins.",
    description:
      "Adubo granulado orgânico à base de húmus de minhoca, produzido artesanalmente a partir da transformação de matéria orgânica. Ideal para misturar à terra de vasos, canteiros, hortas e jardins. Vendido em saco de 0,5 kg.",
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
    shortDescription: "Receba adubos orgânicos todo mês em um plano flexível, montado conforme suas plantas e sua região de entrega.",
    description:
      "Receba adubos orgânicos em casa todo mês, conforme a necessidade das suas plantas. Você combina quantidade, frequência e entrega pelo WhatsApp.",
    image: assinaturaImg,
    unitLabel: "plano mensal",
    minQuantity: 1,
    unitPrice: 99,
    minLabel: "Plano sob medida",
    badge: "Plano mensal",
    recurring: true,
  },
];

export const getProductBySlug = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

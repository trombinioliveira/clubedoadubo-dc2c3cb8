import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.clubedoadubo.com.br";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface SeoProps {
  title: string;
  description: string;
  /** caminho relativo a partir da raiz, ex: "/loja" */
  path: string;
  robots?: string;
  ogType?: "website" | "product" | "article";
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  /** dados estruturados JSON-LD (objeto único ou lista) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Componente leve de SEO por rota.
 * Controla title, description, canonical, robots, Open Graph, Twitter Card e JSON-LD.
 */
export function Seo({
  title,
  description,
  path,
  robots = "index, follow",
  ogType = "website",
  ogTitle,
  ogDescription,
  image = DEFAULT_OG_IMAGE,
  jsonLd,
}: SeoProps) {
  const canonical = `${SITE_URL}${path}`;
  const resolvedImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={ogDescription ?? description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:site_name" content="Clube do Adubo" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle ?? title} />
      <meta name="twitter:description" content={ogDescription ?? description} />
      <meta name="twitter:image" content={resolvedImage} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}

export default Seo;

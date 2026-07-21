import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Building2,
  Home,
  Store,
  Leaf,
  Users,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Seo } from "../components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// NOTE: tracking no banco (saveInterestLead/recordLinkClick) pausado temporariamente
// enquanto a Data API pública do Supabase está bloqueada por billing/quota.
// A estrutura (tracking.ts, tabelas, policies, RLS) permanece intacta para retomada futura.

const WHATSAPP_NUMBER = "5512996682454";
const SOURCE_PAGE = "/loja/servicos-de-adubacao";

const PARA_QUEM = [
  { icon: Users, title: "Condomínios de casas", text: "Para áreas verdes, jardins coletivos, canteiros e espaços comuns." },
  { icon: Building2, title: "Prédios residenciais", text: "Para jardins de entrada, vasos, floreiras, áreas comuns e espaços de convivência." },
  { icon: Building2, title: "Prédios comerciais", text: "Para recepções, fachadas, vasos, jardineiras e áreas verdes corporativas." },
  { icon: Home, title: "Casas", text: "Para jardins, hortas, vasos, quintais e plantas ornamentais." },
  { icon: Store, title: "Comércios e empresas", text: "Para lojas, cafés, restaurantes, escritórios e espaços que querem manter plantas bem cuidadas." },
  { icon: Leaf, title: "Projetos locais", text: "Para espaços sustentáveis, hortas comunitárias, escolas, iniciativas ambientais e parceiros do ciclo." },
];

const COMO_FUNCIONA = [
  { title: "Você conta sobre o espaço", text: "Informe se é casa, condomínio, prédio, comércio ou outro tipo de local." },
  { title: "Entendemos a necessidade", text: "Avaliamos o tipo de área, plantas, vasos, canteiros, horta ou jardim." },
  { title: "Combinamos a melhor forma de atendimento", text: "Definimos frequência, quantidade de adubo, região e logística." },
  { title: "Realizamos a adubação", text: "Aplicamos o adubo orgânico de forma simples, cuidadosa e adequada ao espaço." },
  { title: "Você mantém o cuidado", text: "Também podemos orientar uma rotina de manutenção com adubo líquido, granulado ou assinatura." },
];

const PLACE_TYPES = [
  "Casa",
  "Condomínio de casas",
  "Prédio residencial",
  "Prédio comercial",
  "Comércio ou empresa",
  "Horta/projeto local",
  "Outro",
];

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Quero entender os Serviços de Adubação do Clube do Adubo em São Paulo Capital ou Litoral Norte/SP.",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function ServicosAdubacaoPage() {


  return (
    <div>
      <Seo
        title="Serviços de Adubação | Clube do Adubo"
        description="Serviços de adubação com adubos orgânicos artesanais para casas, condomínios, prédios residenciais, comerciais e áreas verdes em São Paulo Capital e Litoral Norte/SP."
        path="/loja/servicos-de-adubacao"
        ogTitle="Serviços de Adubação | Clube do Adubo"
        ogDescription="Adubação com adubos orgânicos à base de húmus de minhoca para casas, condomínios, prédios e espaços comerciais."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Serviços de Adubação",
          serviceType: "Adubação com adubos orgânicos artesanais",
          provider: { "@type": "Organization", name: "Clube do Adubo" },
          areaServed: "São Paulo Capital e Litoral Norte/SP",
          description:
            "Serviços de adubação com adubos orgânicos artesanais para casas, condomínios, prédios residenciais, comerciais e áreas verdes.",
          url: "https://www.clubedoadubo.com.br/loja/servicos-de-adubacao",
        }}
      />

      {/* Hero */}
      <section className="earth-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-14 text-center md:py-20">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background/15">
            <Sprout className="h-7 w-7" />
          </span>
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold md:text-5xl">
            Serviços de adubação
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base opacity-90 md:text-lg">
            Adubação com adubos orgânicos artesanais para casas, condomínios, prédios e
            espaços comerciais.
          </p>
        </div>
      </section>

      {/* Abertura */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground md:text-lg">
          O Clube do Adubo realiza serviços de adubação com adubos orgânicos à base de húmus
          de minhoca, ajudando a cuidar de jardins, vasos, canteiros, hortas e áreas verdes
          com uma solução simples, natural e artesanal.
        </p>
        <p className="mx-auto mt-4 flex max-w-3xl items-center justify-center gap-2 text-center text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" /> Atendimento disponível em São Paulo
          Capital e Litoral Norte/SP.
        </p>
      </section>

      {/* Para quem é */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
            Para quem é o serviço de adubação?
          </h2>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARA_QUEM.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-5">
                <item.icon className="mb-3 h-7 w-7 text-primary" />
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Como funciona</h2>
        <ol className="mx-auto max-w-2xl space-y-4">
          {COMO_FUNCIONA.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Regiões atendidas */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl border border-border bg-background p-5">
            <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Regiões atendidas</h2>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                Atendemos serviços de adubação em São Paulo Capital e no Litoral Norte/SP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div>
            <h2 className="text-xl font-bold text-foreground">Entenda o serviço de adubação</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha seus dados e envie uma mensagem pelo WhatsApp. Vamos entender o tipo
              de espaço, a região e a melhor forma de atendimento.
            </p>
          </div>

          <div>
            <Label htmlFor="first_name">Primeiro nome *</Label>
            <Input id="first_name" name="first_name" required placeholder="Seu primeiro nome" />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp com DDD *</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" required placeholder="(00) 00000-0000" />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" />
          </div>
          <div>
            <Label htmlFor="place_type">Tipo de local *</Label>
            <select
              id="place_type"
              name="place_type"
              required
              defaultValue=""
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="" disabled>Selecione...</option>
              {PLACE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="city_neighborhood">Cidade/bairro *</Label>
            <Input id="city_neighborhood" name="city_neighborhood" required placeholder="Ex: São Paulo / Pinheiros" />
          </div>
          <div>
            <Label htmlFor="notes">Observação opcional</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Conte um pouco sobre o espaço, plantas, jardim, vasos, horta ou área verde."
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="consent_contact" className="mt-1 h-4 w-4 rounded border-input" />
            <span>
              Aceito receber contato do Clube do Adubo sobre serviços, adubo, plantas e
              próximos passos.
            </span>
          </label>

          <p className="text-xs text-muted-foreground">
            Ao enviar, você concorda com a{" "}
            <Link
              to="/politica-de-privacidade?returnTo=/loja/servicos-de-adubacao"
              className="text-primary underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>

          <Button type="submit" size="lg" className="w-full" disabled={submitting} data-analytics-event="servicos_adubacao_whatsapp">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {submitting ? "Enviando..." : "Conversar pelo WhatsApp"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link to="/loja" data-analytics-event="back_to_store">Voltar para a loja</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

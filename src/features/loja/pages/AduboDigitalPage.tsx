import React from "react";
import { Link } from "react-router-dom";
import { Globe, Recycle, Sprout, CheckCircle2 } from "lucide-react";
import { Seo } from "../components/Seo";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5512996682454";
const WHATSAPP_MESSAGE =
  "Olá! Quero entender como funciona o Adubo Digital para participar de qualquer lugar do Brasil.";

const COMO_FUNCIONA = [
  "Você participa digitalmente.",
  "O Clube do Adubo executa o ciclo fisicamente.",
  "Resíduos orgânicos são coletados e processados.",
  "O material vira adubo artesanal.",
  "O impacto fica registrado dentro do ciclo.",
];

export default function AduboDigitalPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div>
      <Seo
        title="Adubo Digital | Compra digital com impacto físico real"
        description="Participe do ciclo do Clube do Adubo de qualquer lugar do Brasil. O Adubo Digital conecta compra digital a impacto físico real."
        path="/loja/adubo-digital"
        ogTitle="Adubo Digital | Impacto físico real"
        ogDescription="Você compra digitalmente. O ciclo acontece fisicamente dentro da operação do Clube do Adubo."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Adubo Digital | Compra digital com impacto físico real",
          description:
            "Participe do ciclo do Clube do Adubo de qualquer lugar do Brasil. O Adubo Digital conecta compra digital a impacto físico real.",
          url: "https://www.clubedoadubo.com.br/loja/adubo-digital",
        }}
      />
      {/* Hero */}
      <section className="earth-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center md:py-24">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background/15">
            <Globe className="h-7 w-7" />
          </span>
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold md:text-5xl">
            Adubo Digital
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base opacity-90 md:text-lg">
            Você compra digitalmente. O ciclo acontece fisicamente.
          </p>
        </div>
      </section>

      {/* Texto principal */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground md:text-lg">
          O Adubo Digital é uma forma de participar do ciclo do Clube do Adubo de qualquer
          lugar do Brasil. Enquanto os adubos físicos são entregues em São Paulo Capital e
          no Litoral Norte/SP, o Adubo Digital conecta pessoas de outras regiões a um
          impacto físico real.
        </p>
      </section>

      {/* Como funciona */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Como funciona</h2>
          <ol className="mx-auto max-w-2xl space-y-4">
            {COMO_FUNCIONA.map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {i + 1}
                </span>
                <span className="pt-1 text-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* O que ele representa */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-bold md:text-3xl">O que ele representa</h2>
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <Sprout className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="text-base text-muted-foreground md:text-lg">
              1 Adubo Digital representa uma participação digital conectada a um ciclo físico
              real de coleta, compostagem e produção de adubo.
            </p>
            <p className="mt-5 rounded-xl bg-primary/5 p-4 text-sm font-semibold text-primary md:text-base">
              1 Adubo Digital = 1 adubo físico + 9 PROs + 900 g de resíduo orgânico
              processado + 1 impacto real registrado.
            </p>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl border border-border bg-background p-5">
            <Recycle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground md:text-base">
              O Adubo Digital não é investimento, não promete lucro e não gera rendimento.
              É uma compra digital com impacto físico real, conectada à operação do Clube do
              Adubo.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="adubo_digital_whatsapp">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Quero entender pelo WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/loja" data-analytics-event="back_to_store">Voltar para a loja</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

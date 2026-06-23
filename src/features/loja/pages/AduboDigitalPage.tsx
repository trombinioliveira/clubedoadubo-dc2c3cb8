import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Recycle, Sprout, CheckCircle2 } from "lucide-react";
import { Seo } from "../components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createClubeLead } from "../api/clube";

const SOURCE_PAGE = "/loja/adubo-digital";

const COMO_FUNCIONA = [
  "Você participa digitalmente.",
  "O Clube do Adubo executa o ciclo fisicamente.",
  "Resíduos orgânicos são coletados e processados.",
  "O material vira adubo artesanal.",
  "O impacto fica registrado dentro do ciclo.",
];

function LeadForm() {
  const [placing, setPlacing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const first_name = String(data.get("nome") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const instagram = String(data.get("instagram") ?? "").trim();

    if (first_name.length < 2) {
      toast.error("Informe seu primeiro nome.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("WhatsApp inválido", { description: "Informe o número com DDD." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido.");
      return;
    }
    if (!consent) {
      toast.error("É preciso aceitar receber contato para continuar.");
      return;
    }

    setPlacing(true);
    try {
      const res = await createClubeLead({
        first_name,
        whatsapp,
        email,
        instagram: instagram || undefined,
        lead_type: "general",
        source_page: SOURCE_PAGE,
        consent_contact: true,
        consent_privacy: true,
        notes: "Interesse no Adubo Digital",
      });
      setToken(res.public_access_token);
      toast.success("Cadastro recebido 🌱", {
        description: "Agora você pode seguir para o próximo passo do Clube do Adubo.",
      });
    } catch (err) {
      toast.error("Não conseguimos salvar seu cadastro agora", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setPlacing(false);
    }
  };

  if (token) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-primary" />
        <h3 className="text-lg font-bold">Cadastro recebido 🌱</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Recebemos seus dados. Agora você pode seguir para o próximo passo do Clube do Adubo.
        </p>
        <Button asChild size="lg" className="mt-5 w-full">
          <a href={`/go/clube-adubo-digital?t=${token}`} data-analytics-event="adubo_digital_whatsapp">
            <CheckCircle2 className="mr-2 h-5 w-5" /> Continuar pelo WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-3 rounded-2xl border border-border bg-card p-6 text-left shadow-soft"
    >
      <h3 className="text-lg font-bold">Quero entender o Adubo Digital</h3>
      <p className="text-sm text-muted-foreground">
        Deixe seus dados e a gente continua pelo WhatsApp.
      </p>
      <div>
        <Label htmlFor="nome">Primeiro nome</Label>
        <Input id="nome" name="nome" required placeholder="Seu primeiro nome" />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp com DDD</Label>
        <Input id="whatsapp" name="whatsapp" type="tel" required placeholder="(00) 00000-0000" />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required placeholder="voce@email.com" />
      </div>
      <div>
        <Label htmlFor="instagram">Instagram (opcional)</Label>
        <Input id="instagram" name="instagram" placeholder="@seuinstagram" />
      </div>
      <label className="flex items-start gap-2 pt-1 text-sm text-muted-foreground">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <span>
          Aceito receber contato do Clube do Adubo sobre produtos, adubo, plantas, comunidade e
          próximos passos.
        </span>
      </label>
      <p className="text-xs text-muted-foreground">
        Ao enviar, você concorda com a{" "}
        <Link
          to={`/politica-de-privacidade?returnTo=${SOURCE_PAGE}`}
          className="text-primary underline"
        >
          Política de Privacidade
        </Link>
        .
      </p>
      <Button type="submit" size="lg" className="w-full" disabled={placing}>
        {placing ? "Enviando..." : "Quero entender pelo WhatsApp"}
      </Button>
    </form>
  );
}

export default function AduboDigitalPage() {
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

      {/* Segurança + cadastro */}
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

          <div className="mt-8">
            <LeadForm />
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/loja" data-analytics-event="back_to_store">Voltar para a loja</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

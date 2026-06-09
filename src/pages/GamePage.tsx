import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Recycle,
  Factory,
  ShoppingBag,
  Trophy,
  HandCoins,
  Sprout,
  Minus,
  Plus,
  ArrowRight,
  HelpCircle,
  Clock,
} from "lucide-react";

type Stage = {
  num: number;
  title: string;
  helper: string;
  Icon: typeof Leaf;
  pill?: string;
  detail: string;
};

const stages: Stage[] = [
  {
    num: 1,
    title: "Participação",
    helper: "Escolha a quantidade de PROs",
    Icon: HandCoins,
    detail: "Você entra no ciclo escolhendo seus PROs.",
  },
  {
    num: 2,
    title: "Coleta",
    helper: "Recolhimento dos resíduos",
    Icon: Recycle,
    pill: "2 dias",
    detail: "Os resíduos orgânicos entram na etapa de coleta.",
  },
  {
    num: 3,
    title: "Produção",
    helper: "Transformação em adubo",
    Icon: Factory,
    pill: "5 dias",
    detail: "O material segue para transformação em adubo.",
  },
  {
    num: 4,
    title: "Adubo pronto",
    helper: "Pronto para seguir",
    Icon: Sprout,
    pill: "7 dias",
    detail: "O adubo fica pronto para seguir seu destino.",
  },
  {
    num: 5,
    title: "Venda",
    helper: "Adubo digital ou físico",
    Icon: ShoppingBag,
    detail: "O adubo pode gerar retorno digital ou físico.",
  },
  {
    num: 6,
    title: "Recompensa",
    helper: "Esperada ou recebida",
    Icon: Trophy,
    detail: "Após a venda, sua recompensa pode ser esperada ou recebida.",
  },
];

const presets = [1, 5, 10, 20];

function StageBadge({ stage, angle, radius }: { stage: Stage; angle: number; radius: number }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  const { Icon } = stage;
  return (
    <div
      className="absolute left-1/2 top-1/2 flex flex-col items-center"
      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
    >
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(170_55%_40%)] text-primary-foreground shadow-[0_6px_18px_-4px_hsl(145_45%_32%/0.45)]">
        <Icon className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
          {stage.num}
        </span>
      </div>
      <span className="mt-1 max-w-[64px] text-center text-[10px] font-semibold leading-tight text-foreground">
        {stage.title}
      </span>
    </div>
  );
}

export default function GamePage() {
  const [pros, setPros] = useState(5);
  const [rewardTab, setRewardTab] = useState<"esperada" | "recebida">("esperada");

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(170_55%_40%)] text-primary-foreground shadow-[0_8px_24px_-6px_hsl(145_45%_32%/0.5)]">
          <Leaf className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Clube do Adubo</p>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground">Ciclo do Clube do Adubo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe sua jornada do apoio até a recompensa
        </p>
      </header>

      {/* Hero cycle */}
      <section className="px-5 pt-8">
        <div className="relative mx-auto aspect-square w-full max-w-[340px]">
          {/* gradient ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary via-[hsl(170_55%_42%)] to-accent p-[3px] shadow-[0_0_40px_-8px_hsl(170_55%_42%/0.4)]">
            <div className="h-full w-full rounded-full bg-background" />
          </div>
          {/* center button */}
          <button className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[hsl(145_50%_38%)] to-[hsl(170_55%_40%)] text-center text-primary-foreground shadow-[0_12px_36px_-8px_hsl(145_45%_32%/0.6),inset_0_2px_8px_hsl(0_0%_100%/0.25)] transition-transform active:scale-95">
            <Sprout className="mb-1 h-7 w-7" />
            <span className="text-sm font-bold leading-tight">Entrar no<br />ciclo</span>
          </button>
          {/* stage nodes around circle */}
          {stages.map((stage, i) => (
            <StageBadge
              key={stage.num}
              stage={stage}
              angle={-90 + i * 60}
              radius={138}
            />
          ))}
        </div>
      </section>

      {/* Journey summary */}
      <section className="px-5 pt-6">
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold text-foreground">O ciclo está girando</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada etapa aproxima você de um mundo mais sustentável.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Etapa atual", value: "Produção" },
              { label: "Tempo acumulado", value: "14 dias" },
              { label: "Próxima etapa", value: "Adubo pronto" },
              { label: "Recompensa", value: "Esperada" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-muted/60 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participation selector */}
      <section className="px-5 pt-5">
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold text-foreground">Entrada no ciclo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha quantos PROs você quer colocar nesta jornada.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setPros((p) => Math.max(1, p - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground transition active:scale-90"
              aria-label="Diminuir"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="flex h-16 w-24 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-3xl font-extrabold text-foreground">{pros}</span>
              <span className="text-[11px] font-medium text-muted-foreground">PROs</span>
            </div>
            <button
              onClick={() => setPros((p) => p + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:scale-90"
              aria-label="Aumentar"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setPros(p)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  pros === p
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {p} PRO{p > 1 ? "s" : ""}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-accent/15 px-4 py-2 text-center text-xs font-semibold text-foreground">
            Cada PRO representa a sua participação no ciclo.
          </p>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(145_50%_38%)] to-[hsl(170_55%_40%)] py-3.5 font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(145_45%_32%/0.6)] transition active:scale-[0.98]">
            Confirmar participação
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Stage details */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Etapas da jornada</h2>
        <div className="space-y-3">
          {stages.map((stage) => {
            const { Icon } = stage;
            return (
              <div
                key={stage.num}
                className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(170_55%_40%)] text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{stage.title}</h3>
                    {stage.pill && (
                      <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        <Clock className="h-3 w-3" />
                        {stage.pill}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reward status */}
      <section className="px-5 pt-6">
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">Recompensa</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
            {(["esperada", "recebida"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRewardTab(tab)}
                className={`rounded-full py-2 text-sm font-semibold capitalize transition ${
                  rewardTab === tab
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-5 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {rewardTab === "esperada" ? "Recompensa esperada" : "Recompensa recebida"}
            </p>
            <p className="text-3xl font-extrabold text-foreground">
              {rewardTab === "esperada" ? "R$ 20" : "R$ 0"}
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Quando a venda acontece, o retorno aparece aqui.
          </p>
        </div>
      </section>

      {/* Secondary actions */}
      <section className="px-5 pt-6">
        <Link
          to="/jornada"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-transparent py-3.5 font-bold text-primary transition active:scale-[0.98]"
        >
          Ver minha jornada
        </Link>
        <button className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          Entender como funciona
        </button>
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/90 px-5 py-3 backdrop-blur">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(145_50%_38%)] to-[hsl(170_55%_40%)] py-3.5 font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(145_45%_32%/0.6)] transition active:scale-[0.98]">
          <Sprout className="h-5 w-5" />
          Entrar no ciclo
        </button>
      </div>
    </div>
  );
}

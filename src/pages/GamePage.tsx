import { useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.webp";
import { toast } from "sonner";
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
  ChevronRight,
  HelpCircle,
  Clock,
  Check,
  RotateCcw,
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
const accumDays = [0, 2, 7, 14, 16, 18];

function StageBadge({
  stage,
  angle,
  radius,
  active,
  done,
  onClick,
}: {
  stage: Stage;
  angle: number;
  radius: number;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  const { Icon } = stage;
  return (
    <button
      onClick={onClick}
      className="absolute left-1/2 top-1/2 flex flex-col items-center transition-transform active:scale-90"
      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
    >
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-full text-primary-foreground transition-all ${
          active
            ? "scale-110 bg-gradient-to-br from-accent to-[hsl(35_75%_55%)] shadow-[0_0_22px_-2px_hsl(45_80%_50%/0.8)] ring-2 ring-accent ring-offset-2 ring-offset-background"
            : done
              ? "bg-gradient-to-br from-primary to-[hsl(170_55%_40%)] shadow-[0_6px_18px_-4px_hsl(145_45%_32%/0.45)]"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {done && !active ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        <span
          className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
            active ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
          }`}
        >
          {stage.num}
        </span>
      </div>
      <span
        className={`mt-1 max-w-[64px] text-center text-[10px] font-semibold leading-tight ${
          active ? "text-primary" : "text-foreground"
        }`}
      >
        {stage.title}
      </span>
    </button>
  );
}

export default function GamePage() {
  const [pros, setPros] = useState(5);
  const [rewardTab, setRewardTab] = useState<"esperada" | "recebida">("esperada");
  const [joined, setJoined] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); // index into stages
  const [received, setReceived] = useState(false);
  const [cycleMessage, setCycleMessage] = useState("Toque para entrar no ciclo");
  const [messageKey, setMessageKey] = useState(0);

  const expected = pros * 20;
  const active = stages[currentStage];
  const next = stages[(currentStage + 1) % stages.length];

  const showMessage = (msg: string) => {
    setCycleMessage(msg);
    setMessageKey((k) => k + 1);
  };

  const enterCycle = () => {
    if (!joined) {
      setJoined(true);
      setCurrentStage(1);
      showMessage("Você entrou no ciclo! 🌱");
      toast.success("Você entrou no ciclo! 🌱", {
        description: `${pros} PRO${pros > 1 ? "s" : ""} em jornada.`,
      });
    } else {
      advance();
    }
  };

  const advance = () => {
    setCurrentStage((s) => {
      const nextIdx = s + 1;
      if (nextIdx >= stages.length) {
        setReceived(true);
        setRewardTab("recebida");
        showMessage("Recompensa recebida! 🏆");
        toast.success("Recompensa recebida! 🏆", {
          description: `Você recebeu R$ ${expected}.`,
        });
        return 0;
      }
      showMessage(stages[nextIdx].title);
      toast(`Avançou para: ${stages[nextIdx].title}`, {
        description: stages[nextIdx].detail,
      });
      return nextIdx;
    });
  };

  const confirmParticipation = () => {
    setConfirmed(true);
    setJoined(true);
    setCurrentStage(1);
    showMessage("Participação confirmada! 🌱");
    toast.success("Participação confirmada!", {
      description: `${pros} PRO${pros > 1 ? "s" : ""} adicionados ao ciclo.`,
    });
  };

  const reset = () => {
    setJoined(false);
    setConfirmed(false);
    setReceived(false);
    setCurrentStage(0);
    setRewardTab("esperada");
    showMessage("Toque para entrar no ciclo");
    toast("Ciclo reiniciado", { description: "Pronto para começar de novo." });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-3 text-center">
        <Link to="/loja" className="mb-3 flex items-center justify-center gap-2">
          <img src={logoImage} alt="Clube do Adubo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col text-left">
            <span className="font-bold text-foreground text-base leading-tight">Clube do Adubo</span>
            <span className="text-xs text-muted-foreground leading-tight">Economia Circular Urbana</span>
          </div>
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground">Ciclo do Clube do Adubo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe sua jornada do apoio até a recompensa
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { step: "Passo 1", label: "Entenda o projeto", to: "/economia-circular" },
            { step: "Passo 2", label: "Cadastro rápido", to: "/auth" },
            { step: "Passo 3", label: "Participar", to: "/assinatura" },
          ].map((b) => (
            <Link
              key={b.step}
              to={b.to}
              className="flex flex-col items-center gap-0.5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 px-2 py-3 text-center shadow-[var(--shadow-soft)] transition active:scale-95"
            >
              <span className="text-[11px] font-bold text-primary">{b.step}</span>
              <span className="text-[11px] font-semibold leading-tight text-foreground">{b.label}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* Hero cycle */}
      <section className="px-5 pt-8">
        <div className="relative mx-auto aspect-square w-full max-w-[340px]">
          {/* gradient ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary via-[hsl(170_55%_42%)] to-accent p-[3px] shadow-[0_0_40px_-8px_hsl(170_55%_42%/0.4)]">
            <div className="h-full w-full rounded-full bg-background" />
          </div>
          {/* directional arrows showing the cycle flow */}
          {stages.map((_, i) => {
            const a = -90 + i * 60 + 30; // midpoint between two nodes
            const rad = (a * Math.PI) / 180;
            const r = 138;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            const passed = joined && i < currentStage;
            return (
              <div
                key={`arrow-${i}`}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${a + 90}deg)`,
                }}
              >
                <ChevronRight
                  className={`h-5 w-5 transition-colors ${
                    passed ? "text-accent" : "text-primary/45"
                  }`}
                  strokeWidth={3}
                />
              </div>
            );
          })}
          {/* message balloon in the white space above the center button */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[160px] -translate-x-1/2"
            style={{ transform: "translate(-50%, calc(-50% - 96px))" }}
          >
            <p
              key={messageKey}
              className="animate-in fade-in slide-in-from-bottom-1 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-accent/20 px-3 py-1.5 text-center text-xs font-semibold leading-tight text-foreground shadow-[var(--shadow-soft)] backdrop-blur"
            >
              {cycleMessage}
            </p>
          </div>
          {/* center button */}
          <button
            onClick={enterCycle}
            className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-pulse-attention flex-col items-center justify-center rounded-full bg-gradient-to-br from-[hsl(145_50%_38%)] to-[hsl(170_55%_40%)] text-center text-primary-foreground shadow-[0_12px_36px_-8px_hsl(145_45%_32%/0.6),inset_0_2px_8px_hsl(0_0%_100%/0.25)] transition-transform active:scale-95"
          >
            <Sprout className="mb-1 h-7 w-7" />
            <span className="text-sm font-bold leading-tight">
              {joined ? (
                <>
                  Avançar<br />etapa
                </>
              ) : (
                <>
                  Entrar no<br />ciclo
                </>
              )}
            </span>
          </button>
          {/* stage nodes around circle */}
          {stages.map((stage, i) => (
            <StageBadge
              key={stage.num}
              stage={stage}
              angle={-90 + i * 60}
              radius={150}
              active={joined && i === currentStage}
              done={joined && i < currentStage}
              onClick={() =>
                toast(stage.title, { description: stage.detail })
              }
            />
          ))}
        </div>
      </section>

      {/* Journey summary */}
      <section className="px-5 pt-6">
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {joined ? "O ciclo está girando" : "O ciclo aguarda você"}
            </h2>
            {joined && (
              <button
                onClick={reset}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground transition active:scale-95"
              >
                <RotateCcw className="h-3 w-3" />
                Reiniciar
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada etapa aproxima você de um mundo mais sustentável.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Etapa atual", value: joined ? active.title : "—" },
              { label: "Tempo acumulado", value: joined ? `${accumDays[currentStage]} dias` : "0 dias" },
              { label: "Próxima etapa", value: joined ? next.title : "Participação" },
              { label: "Recompensa", value: received ? "Recebida" : "Esperada" },
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
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${
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
          <button
            onClick={confirmParticipation}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold transition active:scale-[0.98] ${
              confirmed
                ? "bg-[hsl(160_60%_45%)] text-primary-foreground"
                : "bg-gradient-to-r from-[hsl(145_50%_38%)] to-[hsl(170_55%_40%)] text-primary-foreground shadow-[0_8px_24px_-8px_hsl(145_45%_32%/0.6)]"
            }`}
          >
            {confirmed ? (
              <>
                <Check className="h-4 w-4" />
                Participação confirmada
              </>
            ) : (
              <>
                Confirmar participação
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Stage details */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Etapas da jornada</h2>
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const { Icon } = stage;
            const isActive = joined && i === currentStage;
            return (
              <button
                key={stage.num}
                onClick={() => toast(stage.title, { description: stage.detail })}
                className={`flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-[var(--shadow-soft)] transition active:scale-[0.99] ${
                  isActive ? "bg-accent/10 ring-2 ring-accent/40" : "bg-card"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(170_55%_40%)] text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{stage.title}</h3>
                    {isActive && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                        Agora
                      </span>
                    )}
                    {stage.pill && (
                      <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        <Clock className="h-3 w-3" />
                        {stage.pill}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                </div>
              </button>
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
              {rewardTab === "esperada" ? `R$ ${expected}` : received ? `R$ ${expected}` : "R$ 0"}
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
        <button
          onClick={() =>
            toast("Como funciona", {
              description: "Você escolhe seus PROs, o ciclo gira e a recompensa chega após a venda.",
            })
          }
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          Entender como funciona
        </button>
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/90 px-5 py-3 backdrop-blur">
        <button
          onClick={enterCycle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(145_50%_38%)] to-[hsl(170_55%_40%)] py-3.5 font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(145_45%_32%/0.6)] transition active:scale-[0.98]"
        >
          <Sprout className="h-5 w-5" />
          {joined ? "Avançar etapa" : "Entrar no ciclo"}
        </button>
      </div>
    </div>
  );
}

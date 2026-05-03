import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, CheckCircle2, MapPin, Users, Sparkles, Coffee, Recycle,
  Trash2, Leaf, Heart, ShoppingBag, Share2, Copy, Instagram, MessageCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

type PointStats = {
  point_id: string;
  point_name: string;
  point_slug: string;
  city: string | null;
  state: string | null;
  total_users: number;
  total_checkins: number;
};

type CheckinResult = {
  point_name: string;
  point_slug: string;
  is_first_checkin: boolean;
  pro_granted: boolean;
  pro_code: string | null;
  user_total_checkins: number;
  point_total_users: number;
  point_total_checkins: number;
};

type Step =
  | "form"
  | "returning"
  | "connection"
  | "pro"
  | "transform_a"
  | "transform_b"
  | "problem"
  | "solution"
  | "decision"
  | "share";

const synthEmail = (waDigits: string) => `wa${waDigits}@checkin.clubedoadubo.com.br`;
const synthPassword = (waDigits: string) => `cda_${waDigits}_v1_secure`;
const onlyDigits = (s: string) => s.replace(/\D/g, "");

export default function CheckinPage() {
  const { pointSlug } = useParams<{ pointSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [point, setPoint] = useState<PointStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Load point + check existing session for recurring user
  useEffect(() => {
    (async () => {
      if (!pointSlug) return;
      setLoading(true);
      const { data, error } = await supabase.rpc("get_point_checkin_stats", { p_slug: pointSlug });
      if (error || !data) {
        setError("Ponto não encontrado");
        setLoading(false);
        return;
      }
      setPoint(data as PointStats);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, referral_code")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof) {
          setName(prof.full_name || "");
          setReferralCode(prof.referral_code);
        }
        const { data: conn } = await supabase
          .from("user_point_connections")
          .select("total_checkins")
          .eq("user_id", user.id)
          .eq("collection_point_id", (data as PointStats).point_id)
          .maybeSingle();
        if (conn && conn.total_checkins > 0) {
          setStep("returning");
        }
      }
      setLoading(false);
    })();
  }, [pointSlug]);

  const doCheckin = async () => {
    if (!pointSlug) return;
    const { data, error } = await supabase.rpc("register_checkin", { p_slug: pointSlug });
    if (error) throw error;
    const r = data as CheckinResult;
    setResult(r);

    // Refresh referral_code if we don't have it yet
    if (!referralCode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof?.referral_code) setReferralCode(prof.referral_code);
      }
    }
    setStep("connection");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    const wa = onlyDigits(whatsapp);
    if (wa.length < 10) {
      toast.error("WhatsApp inválido");
      return;
    }

    setSubmitting(true);
    try {
      const email = synthEmail(wa);
      const password = synthPassword(wa);

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim(), whatsapp: wa, source: "checkin", point_slug: pointSlug },
            emailRedirectTo: `${window.location.origin}/checkin/${pointSlug}`,
          },
        });
        if (signUpError) throw signUpError;
        await supabase.auth.signInWithPassword({ email, password });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: name.trim(), whatsapp: wa })
          .eq("user_id", user.id);
      }

      await doCheckin();
    } catch (err: any) {
      console.error("[checkin] error", err);
      toast.error(err?.message || "Erro ao fazer check");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturningCheckin = async () => {
    setSubmitting(true);
    try {
      await doCheckin();
    } catch (err: any) {
      toast.error(err?.message || "Erro");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Ponto não encontrado</h1>
        <p className="text-muted-foreground">Verifique o QR code ou o link.</p>
      </div>
    );
  }

  const referralUrl = referralCode
    ? `https://www.clubedoadubo.com.br/u/${referralCode}`
    : `${window.location.origin}/p/${point.point_slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col p-6 max-w-sm mx-auto w-full">
        {/* TELA: FORM (usuário novo) */}
        {step === "form" && (
          <FormScreen
            point={point}
            name={name}
            whatsapp={whatsapp}
            setName={setName}
            setWhatsapp={setWhatsapp}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        {/* TELA: RECORRENTE */}
        {step === "returning" && (
          <ReturningScreen
            point={point}
            name={name}
            onCheckin={handleReturningCheckin}
            submitting={submitting}
          />
        )}

        {/* TELA 2: CONEXÃO */}
        {step === "connection" && result && (
          <FullScreen
            icon={<CheckCircle2 className="w-20 h-20 text-primary" />}
            title="Check feito!"
            subtitle={`Você agora faz parte do ciclo aqui no ${result.point_name}`}
            extra={
              <>
                {result.pro_granted && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 my-4 w-full text-center">
                    <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-sm">Você ganhou 1 PRO de cortesia</p>
                    <p className="text-xs text-muted-foreground mt-1">{result.pro_code}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Stat icon={<Users className="w-5 h-5" />} value={result.point_total_users} label="pessoas" />
                  <Stat icon={<CheckCircle2 className="w-5 h-5" />} value={result.point_total_checkins} label="participações" />
                </div>
              </>
            }
            cta="Continuar"
            onNext={() => setStep("pro")}
          />
        )}

        {/* TELA 3: O PRO */}
        {step === "pro" && (
          <FullScreen
            icon={<Sparkles className="w-20 h-20 text-primary" />}
            title="O que é o PRO?"
            subtitle="Cada PRO é a sua participação no ciclo. Ele ajuda a transformar borra de café e casca de banana em adubo de verdade."
            cta="Como funciona"
            onNext={() => setStep("transform_a")}
          />
        )}

        {/* TELA 4A */}
        {step === "transform_a" && (
          <FullScreen
            icon={<Coffee className="w-20 h-20 text-primary" />}
            title="Aqui no ponto..."
            subtitle="Borra de café e casca de banana não vão para o lixo."
            cta="E aí?"
            onNext={() => setStep("transform_b")}
          />
        )}

        {/* TELA 4B */}
        {step === "transform_b" && (
          <FullScreen
            icon={<Leaf className="w-20 h-20 text-primary" />}
            title="Viram adubo natural"
            subtitle="Resíduo orgânico volta para a terra como nutriente."
            cta="Próximo"
            onNext={() => setStep("problem")}
          />
        )}

        {/* TELA 5: PROBLEMA */}
        {step === "problem" && (
          <FullScreen
            icon={<Trash2 className="w-20 h-20 text-destructive" />}
            title="Fora daqui..."
            subtitle="Esses resíduos vão para o lixo comum. Não voltam para a terra."
            cta="E a solução?"
            onNext={() => setStep("solution")}
          />
        )}

        {/* TELA 6: SOLUÇÃO */}
        {step === "solution" && (
          <FullScreen
            icon={<Recycle className="w-20 h-20 text-primary" />}
            title="No ponto, entram no ciclo"
            subtitle="Viram adubo. Voltam para as plantas. E você acompanha cada etapa."
            cta="O que posso fazer?"
            onNext={() => setStep("decision")}
          />
        )}

        {/* TELA 7: DECISÃO */}
        {step === "decision" && (
          <div className="flex-1 flex flex-col justify-center text-center">
            <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Quer fazer mais?</h1>
            <p className="text-muted-foreground mb-8">Escolha como quer participar do ciclo agora.</p>
            <div className="space-y-3">
              <Link to="/planos" className="block">
                <Button size="lg" className="w-full">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Quero adubo para minhas plantas
                </Button>
              </Link>
              <Link to="/planos" className="block">
                <Button size="lg" variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Apoiar com R$ 1
                </Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("share")}
              >
                Pular <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* TELA FINAL: COMPARTILHAR */}
        {step === "share" && (
          <ShareScreen url={referralUrl} pointName={point.point_name} />
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function FormScreen({
  point, name, whatsapp, setName, setWhatsapp, onSubmit, submitting,
}: any) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">{point.point_name}</h1>
        {point.city && (
          <p className="text-muted-foreground text-sm">
            {point.city}{point.state ? `, ${point.state}` : ""}
          </p>
        )}
        <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{point.total_users}</strong> pessoas</span>
          <span><strong className="text-foreground">{point.total_checkins}</strong> participações</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Seu nome</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Como podemos te chamar?" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="wa">WhatsApp</Label>
          <Input id="wa" type="tel" value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999" autoComplete="tel" required />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Fazer meu check
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Ao continuar você entra no ciclo e ganha 1 PRO de cortesia.
        </p>
      </form>
    </div>
  );
}

function ReturningScreen({ point, name, onCheckin, submitting }: any) {
  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta{name ? `, ${name.split(" ")[0]}` : ""}!</h1>
      <p className="text-muted-foreground mb-6">
        Você já faz parte do ciclo aqui no <strong>{point.point_name}</strong>.
      </p>
      <Button size="lg" className="w-full" onClick={onCheckin} disabled={submitting}>
        {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Fazer novo check
      </Button>
    </div>
  );
}

function FullScreen({ icon, title, subtitle, extra, cta, onNext }: any) {
  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <div className="mx-auto mb-4">{icon}</div>
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <p className="text-muted-foreground mb-6 leading-relaxed">{subtitle}</p>
      {extra}
      <Button size="lg" className="w-full mt-6" onClick={onNext}>
        {cta} <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-muted/50 rounded-xl p-4 text-center">
      <div className="mx-auto mb-1 text-muted-foreground flex justify-center">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ShareScreen({ url, pointName }: { url: string; pointName: string }) {
  const text = `Acabei de fazer check no ${pointName} e entrei no ciclo do Clube do Adubo. Vem comigo:`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const ig = `https://www.instagram.com/`;

  return (
    <div className="flex-1 flex flex-col justify-center text-center">
      <Share2 className="w-16 h-16 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Convide alguém</h1>
      <p className="text-muted-foreground mb-6">Quanto mais gente no ciclo, mais adubo de verdade.</p>

      <div className="bg-muted/50 rounded-xl p-3 text-sm break-all mb-4">{url}</div>

      <div className="space-y-3">
        <a href={wa} target="_blank" rel="noreferrer" className="block">
          <Button size="lg" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Compartilhar no WhatsApp
          </Button>
        </a>
        <Button size="lg" variant="outline" className="w-full" onClick={copy}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar link
        </Button>
        <a href={ig} target="_blank" rel="noreferrer" className="block">
          <Button size="lg" variant="ghost" className="w-full">
            <Instagram className="w-4 h-4 mr-2" />
            Abrir Instagram
          </Button>
        </a>
      </div>
    </div>
  );
}

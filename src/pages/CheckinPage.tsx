import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, MapPin, Users, Sparkles } from "lucide-react";
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

  useEffect(() => {
    (async () => {
      if (!pointSlug) return;
      setLoading(true);
      const { data, error } = await supabase.rpc("get_point_checkin_stats", { p_slug: pointSlug });
      if (error || !data) {
        setError("Ponto não encontrado");
      } else {
        setPoint(data as PointStats);
      }
      setLoading(false);
    })();
  }, [pointSlug]);

  const doCheckin = async () => {
    if (!pointSlug) return;
    const { data, error } = await supabase.rpc("register_checkin", { p_slug: pointSlug });
    if (error) throw error;
    setResult(data as CheckinResult);
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

      // Try sign in first (returning user)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        // Sign up new user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim(), whatsapp: wa, source: "checkin", point_slug: pointSlug },
            emailRedirectTo: `${window.location.origin}/checkin/${pointSlug}`,
          },
        });
        if (signUpError) throw signUpError;
        // Try sign-in again (in case email confirmation off)
        await supabase.auth.signInWithPassword({ email, password });
      }

      // Update profile name/whatsapp (best-effort)
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

  // Success screen
  if (result) {
    return (
      <div className="min-h-screen flex flex-col bg-background p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full">
          <CheckCircle2 className="w-20 h-20 text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-2">Check feito!</h1>
          <p className="text-muted-foreground mb-6">
            Você agora faz parte do ciclo aqui no <strong>{result.point_name}</strong>.
          </p>

          {result.pro_granted && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 w-full">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-semibold">Você ganhou 1 PRO de cortesia</p>
              <p className="text-xs text-muted-foreground mt-1">Código: {result.pro_code}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="bg-muted/50 rounded-xl p-4">
              <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{result.point_total_users}</div>
              <div className="text-xs text-muted-foreground">pessoas conectadas</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{result.point_total_checkins}</div>
              <div className="text-xs text-muted-foreground">participações</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Você já fez check aqui <strong>{result.user_total_checkins}</strong>{" "}
            {result.user_total_checkins === 1 ? "vez" : "vezes"}.
          </p>

          <Link to={`/p/${point.point_slug}`} className="w-full">
            <Button className="w-full" size="lg">Ver página do ponto</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <Label htmlFor="wa">WhatsApp</Label>
            <Input
              id="wa"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Fazer meu check
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Ao continuar você entra no ciclo do ponto e ganha 1 PRO de cortesia.
          </p>
        </form>
      </div>
    </div>
  );
}

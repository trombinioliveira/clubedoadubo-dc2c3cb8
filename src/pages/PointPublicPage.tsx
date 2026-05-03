import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Users, CheckCircle2, QrCode, Share2 } from "lucide-react";

type PointStats = {
  point_id: string;
  point_name: string;
  point_slug: string;
  city: string | null;
  state: string | null;
  total_users: number;
  total_checkins: number;
};

export default function PointPublicPage() {
  const { pointSlug } = useParams<{ pointSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [point, setPoint] = useState<PointStats | null>(null);
  const [myCheckins, setMyCheckins] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!pointSlug) return;
      const { data } = await supabase.rpc("get_point_checkin_stats", { p_slug: pointSlug });
      setPoint((data as PointStats) || null);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const { data: conn } = await supabase
          .from("user_point_connections")
          .select("total_checkins")
          .eq("user_id", user.id)
          .eq("collection_point_id", (data as PointStats).point_id)
          .maybeSingle();
        setMyCheckins(conn?.total_checkins ?? 0);
      }
      setLoading(false);
    })();
  }, [pointSlug]);

  const share = async () => {
    const url = `${window.location.origin}/checkin/${pointSlug}`;
    if (navigator.share) {
      try { await navigator.share({ title: point?.point_name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!point) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Ponto não encontrado</h1>
        <p className="text-muted-foreground">Este ponto não existe ou está inativo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold">{point.point_name}</h1>
          {point.city && (
            <p className="text-muted-foreground">{point.city}{point.state ? `, ${point.state}` : ""}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{point.total_users}</div>
            <div className="text-xs text-muted-foreground">pessoas conectadas</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{point.total_checkins}</div>
            <div className="text-xs text-muted-foreground">participações</div>
          </div>
        </div>

        {myCheckins !== null && myCheckins > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm">
              Você já esteve aqui <strong>{myCheckins}</strong> {myCheckins === 1 ? "vez" : "vezes"}.
            </p>
            <p className="text-xs text-muted-foreground mt-1">Você faz parte deste ponto.</p>
          </div>
        )}

        <div className="space-y-3">
          <Link to={`/checkin/${pointSlug}`} className="block">
            <Button size="lg" className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Fazer check
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full" onClick={share}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar ponto
          </Button>
        </div>
      </div>
    </div>
  );
}

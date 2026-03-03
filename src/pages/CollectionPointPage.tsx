import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Leaf, Recycle, Users, Scale, Package, Phone, Clock, ArrowLeft, TreePine, Sprout, Eye, ArrowRight } from 'lucide-react';
import logoImage from '@/assets/logo.webp';

interface PointData {
  name: string;
  address: string;
  city: string;
  state: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  openingHours: string | null;
  createdAt: string;
  totalWeighings: number;
  totalWeightKg: number;
  totalPros: number;
  uniqueUsers: number;
  co2AvoidedKg: number;
  fertilizerKg: number;
}

export default function CollectionPointPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PointData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: result, error } = await supabase.rpc('get_collection_point_public', { p_slug: slug });
      if (error || !result) {
        setNotFound(true);
      } else {
        setData(result as unknown as PointData);
      }
      setIsLoading(false);
    })();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ponto não encontrado</h1>
        <p className="text-muted-foreground mb-6">Este ponto de coleta não existe ou não possui página pública.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { icon: Scale, label: 'Pesagens realizadas', value: data.totalWeighings.toString() },
    { icon: Package, label: 'PROs gerados', value: data.totalPros.toString() },
    { icon: Users, label: 'Participantes', value: data.uniqueUsers.toString() },
    { icon: Recycle, label: 'Resíduos coletados', value: `${data.totalWeightKg.toFixed(1)} kg` },
    { icon: Leaf, label: 'CO₂ evitado', value: `${data.co2AvoidedKg.toFixed(1)} kg` },
    { icon: TreePine, label: 'Adubo produzido', value: `${data.fertilizerKg.toFixed(1)} kg` },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="Clube do Adubo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-foreground">Clube do Adubo</span>
          </Link>
          <Link to="/auth">
            <Button size="sm" variant="outline">Entrar</Button>
          </Link>
        </div>
      </header>

      {/* Hero — Restructured */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <MapPin className="w-3 h-3 mr-1" />
              Ponto de Coleta
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
              Este local faz parte do ciclo.
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {data.name} — {data.city}/{data.state}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.address}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
        {/* Mini explicação 3 passos */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: '1', text: 'Resíduo orgânico é coletado aqui.', icon: Recycle },
              { num: '2', text: 'Vira adubo real por meio do processamento.', icon: Sprout },
              { num: '3', text: 'Você participa e acompanha o ciclo.', icon: Eye },
            ].map((step) => (
              <Card key={step.num}>
                <CardContent className="p-5 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full earth-gradient text-primary-foreground text-lg font-bold mb-3">
                    {step.num}
                  </span>
                  <p className="text-sm text-foreground font-medium">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/planos">
            <Button variant="hero" size="lg">
              <Sprout className="w-5 h-5 mr-2" />
              Participar também
            </Button>
          </Link>
          <Link to="/painel-publico">
            <Button variant="outline" size="lg">
              <Eye className="w-4 h-4 mr-2" />
              Ver painel público
            </Button>
          </Link>
        </section>

        {/* Description */}
        {data.description && (
          <section>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">Sobre este ponto</h2>
                <p className="text-muted-foreground leading-relaxed">{data.description}</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Info cards */}
        {(data.openingHours || data.phone || data.whatsapp) && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.openingHours && (
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Horário</p>
                    <p className="text-sm text-muted-foreground">{data.openingHours}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.phone && (
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Telefone</p>
                    <p className="text-sm text-muted-foreground">{data.phone}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.whatsapp && (
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {data.whatsapp}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Impact stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-center">Impacto deste ponto</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5 text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Clube do Adubo • Economia Circular Urbana • Impacto real e rastreável
          </p>
        </div>
      </footer>
    </div>
  );
}

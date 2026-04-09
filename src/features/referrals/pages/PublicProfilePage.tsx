import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Leaf, 
  Users, 
  ArrowRight,
  Calendar,
  MapPin,
  Sprout,
  TreePine,
  Trees,
  Sparkles,
  Recycle,
  Wind,
  Flower2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePublicProfile } from '../hooks/usePublicProfile';
import logo from '@/assets/logo.webp';

function getLevelInfo(referralsCount: number) {
  if (referralsCount >= 30) return { label: 'Multiplicador', icon: Trees, phrase: 'Você está expandindo o ciclo de verdade' };
  if (referralsCount >= 11) return { label: 'Cultivador', icon: TreePine, phrase: 'Você já está fortalecendo o ciclo' };
  if (referralsCount >= 4) return { label: 'Semeador', icon: Sprout, phrase: 'Sua rede já está crescendo' };
  return { label: 'Iniciante', icon: Leaf, phrase: 'Esse é o começo da sua onda' };
}

export function PublicProfilePage() {
  const { codigo } = useParams<{ codigo: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(codigo);
  const navigate = useNavigate();

  const handleJoin = () => {
    // Persist referral code to localStorage + cookie for reliability
    if (codigo) {
      localStorage.setItem('referrer_code', codigo);
      document.cookie = `referrer_code=${codigo}; path=/; max-age=2592000; SameSite=Lax`;
      console.log('[Referral] Saved referrer_code to localStorage & cookie:', codigo);
    }
    navigate(`/auth?ref=${codigo}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md text-center">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Perfil não encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            Este link de indicação não existe ou foi desativado.
          </p>
          <Link to="/">
            <Button variant="secondary">
              Conhecer o Clube do Adubo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = (profile as any).public_name || profile.publicName;
  const firstName = displayName?.split(' ')[0] || displayName;
  const city = profile.city;
  const referrals = profile.referralsCount || 0;
  const level = getLevelInfo(referrals);
  const LevelIcon = level.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/5 via-background to-secondary/3">
      <Helmet>
        <title>Entrar no ciclo com {firstName} | Clube do Adubo</title>
        <meta name="description" content={`${firstName} já faz parte do Clube do Adubo. Entre no ciclo e faça parte dessa transformação real.`} />
        <link rel="canonical" href={`https://clubedoadubo.com.br/u/${codigo}`} />
        <meta property="og:title" content={`Entrar no ciclo com ${firstName} | Clube do Adubo`} />
        <meta property="og:description" content={`${firstName} já faz parte do Clube do Adubo. Participe e faça parte dessa transformação real.`} />
        <meta property="og:url" content={`https://clubedoadubo.com.br/u/${codigo}`} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Clube do Adubo" className="h-8 w-auto" />
            <span className="font-bold text-foreground hidden sm:inline">Clube do Adubo</span>
          </Link>
          <Button variant="outline" size="sm" onClick={handleJoin}>
            Entrar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">

        {/* ===== HERO ===== */}
        <section className="text-center space-y-5 py-4">
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary/20 flex items-center justify-center text-3xl font-bold text-secondary border-2 border-secondary/30">
            {displayName?.charAt(0)}
          </div>

          {/* Name + location + date */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground flex-wrap">
              {city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde {format(new Date(profile.memberSince), "MMM yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
              O ciclo já começou com {firstName}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Agora ele pode crescer com você — participe e faça parte dessa transformação real.
            </p>
            {city && (
              <p className="text-sm text-muted-foreground/70">
                {city} já pode fazer parte desse movimento.
              </p>
            )}
          </div>

          {/* CTA Principal */}
          <Button
            size="lg"
            onClick={handleJoin}
            className="mt-4 text-base px-8 py-6 rounded-xl shadow-md"
          >
            <img src={logo} alt="" className="w-5 h-5 mr-2 rounded-full object-cover" />
            Entrar no ciclo com {firstName}
          </Button>
        </section>

        {/* ===== BLOCO DE IMPACTO ===== */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
                <Leaf className="w-5 h-5 text-secondary" />
                Esse impacto já começou
              </h3>
              <p className="text-sm text-muted-foreground">
                E cresce a cada nova participação
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-secondary/5 rounded-xl text-center space-y-1">
                <Recycle className="w-5 h-5 mx-auto text-secondary/70" />
                <p className="text-xl font-bold text-foreground">
                  {profile.totalWeightKg > 0 ? `${profile.totalWeightKg.toFixed(1)}` : '—'}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">kg de resíduo transformado</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-xl text-center space-y-1">
                <Wind className="w-5 h-5 mx-auto text-secondary/70" />
                <p className="text-xl font-bold text-foreground">
                  {profile.co2AvoidedKg > 0 ? `~${profile.co2AvoidedKg.toFixed(1)}` : '—'}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">kg CO₂ evitado</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-xl text-center space-y-1">
                <Flower2 className="w-5 h-5 mx-auto text-secondary/70" />
                <p className="text-xl font-bold text-foreground">
                  {profile.fertilizerKg > 0 ? `~${profile.fertilizerKg.toFixed(1)}` : '—'}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">kg de adubo gerado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== ONDA DE IMPACTO ===== */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Essa é a onda de impacto de {firstName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Cada pessoa que entra por aqui ajuda esse ciclo a crescer.
              </p>
            </div>

            {/* Level Badge */}
            <div className="flex flex-col items-center gap-2 py-2">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 flex items-center gap-1.5">
                <LevelIcon className="w-4 h-4" />
                {level.label}
              </Badge>
              <p className="text-sm text-muted-foreground italic">
                {level.phrase}
              </p>
            </div>

            {/* Network count */}
            {referrals > 0 ? (
              <div className="text-center p-4 bg-primary/5 rounded-xl">
                <p className="text-2xl font-bold text-primary">{referrals}</p>
                <p className="text-sm text-muted-foreground">
                  {referrals === 1 ? 'pessoa já faz parte dessa onda' : 'pessoas já fazem parte dessa onda'}
                </p>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  Você pode ser uma das primeiras pessoas a fortalecer esse ciclo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== PROVA SOCIAL ===== */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            {referrals > 3
              ? `${referrals} pessoas já começaram esse ciclo`
              : 'Esse é o começo de uma nova rede de impacto real.'}
          </p>
        </div>

        {/* ===== CTA FINAL ===== */}
        <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <Sparkles className="w-10 h-10 mx-auto text-secondary" />
            <div className="space-y-2">
              <p className="text-foreground font-medium">
                Você pode começar agora — junto com {firstName}
              </p>
              <p className="text-sm text-muted-foreground">
                E fazer parte de algo real na sua região.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleJoin}
              className="text-base px-8 py-6 rounded-xl shadow-md"
            >
              <img src={logo} alt="" className="w-5 h-5 mr-2 rounded-full object-cover" />
              Entrar no ciclo com {firstName}
            </Button>
          </CardContent>
        </Card>

        {/* ===== TRANSPARÊNCIA ===== */}
        <p className="text-xs text-center text-muted-foreground py-4 max-w-md mx-auto">
          Todos os dados são reais e baseados em participações no ciclo.
          <br />
          Transparência total faz parte do Clube do Adubo.
        </p>
      </main>
    </div>
  );
}

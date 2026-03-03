import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Leaf, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle,
  Calendar,
  Instagram
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePublicProfile } from '../hooks/usePublicProfile';
import logo from '@/assets/logo.webp';

export function PublicProfilePage() {
  const { codigo } = useParams<{ codigo: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(codigo);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
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

  const levelColors: Record<number, string> = {
    1: 'bg-muted text-muted-foreground',
    2: 'bg-secondary/20 text-secondary',
    3: 'bg-primary/20 text-primary',
    4: 'bg-amber-500/20 text-amber-600',
  };

  // Use public_name if available, fallback to publicName from RPC
  const displayName = (profile as any).public_name || profile.publicName;
  const instagram = (profile as any).instagram as string | null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/5 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Clube do Adubo" className="h-8 w-auto" />
            <span className="font-bold text-foreground hidden sm:inline">Clube do Adubo</span>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-2xl font-bold text-secondary">
                {displayName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  {profile.sealActive && (
                    <Badge className={levelColors[profile.currentLevel] || levelColors[1]}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {profile.sealLabel}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membro desde {format(new Date(profile.memberSince), "MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  {instagram && (
                    <a
                      href={`https://instagram.com/${instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      {instagram.startsWith('@') ? instagram : `@${instagram}`}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Metrics */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-secondary" />
              Impacto Ambiental
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <p className="text-3xl font-bold text-foreground">{profile.totalPros}</p>
                <p className="text-sm text-muted-foreground">PROs Ativos</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <p className="text-3xl font-bold text-foreground">{profile.totalWeightKg.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">kg de Resíduo</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-xl text-center">
                <p className="text-3xl font-bold text-secondary">{profile.co2AvoidedKg.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">kg CO₂ Evitado</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-xl text-center">
                <p className="text-3xl font-bold text-secondary">{profile.fertilizerKg.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">kg de Adubo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Impact */}
        {profile.referralsCount > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Onda de Impacto
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <p className="text-3xl font-bold text-primary">{profile.referralsCount}</p>
                  <p className="text-sm text-muted-foreground">Pessoas Convidadas</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-foreground">{profile.networkPros}</p>
                  <p className="text-sm text-muted-foreground">PROs da Rede</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="border-2 border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent">
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 mx-auto text-secondary mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Faça parte do ciclo!
            </h2>
            <p className="text-muted-foreground mb-4">
              Junte-se a {displayName} e milhares de pessoas transformando resíduos em impacto real.
            </p>
            <Link to="/auth">
              <Button className="w-full sm:w-auto" size="lg">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Transparency note */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          Todas as métricas são derivadas de PROs (Processamento de Resíduo Orgânico) reais e verificáveis.
          <br />
          O Clube do Adubo pratica economia circular com transparência total.
        </p>
      </main>
    </div>
  );
}

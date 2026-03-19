import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useReferralData } from '../hooks/useReferralData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  AlertCircle, RefreshCw, ArrowRight, Copy, Link2, ExternalLink,
  Sparkles, Users, Leaf, Waves, Sprout, ChevronDown, ChevronUp,
  HelpCircle, Recycle, TrendingUp, Shield
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── MicroHelp ───

function MicroHelp({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── PathCard ───

function PathCard({ title, text, link }: { title: string; text: string; link: string }) {
  return (
    <Link to={link}>
      <Card className="hover:shadow-md transition-shadow h-full group">
        <CardContent className="p-5 space-y-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          <span className="inline-flex items-center text-xs font-medium text-primary gap-1">
            Acessar <ArrowRight className="w-3 h-3" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Privacy-safe name ───

function safeDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || 'Participante';
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

// ─── Level labels (human) ───

const levelHuman: Record<number, { label: string; emoji: string; reading: string }> = {
  1: {
    label: 'Iniciante',
    emoji: '🌱',
    reading: 'Sua onda de impacto está começando. Cada pessoa que entra pelo seu link amplia o ciclo.',
  },
  2: {
    label: 'Ativo',
    emoji: '🌿',
    reading: 'Sua onda já alcança outras pessoas. Você está expandindo o ciclo de forma real.',
  },
  3: {
    label: 'Embaixador',
    emoji: '🌳',
    reading: 'Você é um embaixador do ciclo. Sua rede gera impacto ambiental significativo.',
  },
  4: {
    label: 'Líder',
    emoji: '🌍',
    reading: 'Você lidera uma onda de impacto expressiva. Sua participação inspira uma rede inteira.',
  },
};

// ─── Page ───

export function ReferralsPage() {
  const { user, profile: authProfile } = useAuth();
  const {
    profile,
    stats,
    referredUsers,
    impact,
    ownImpact,
    isLoading,
    referralCode,
    referralLink,
  } = useReferralData();
  const [showAllNetwork, setShowAllNetwork] = useState(false);

  const currentLevel = stats?.current_level || 1;
  const levelInfo = levelHuman[currentLevel] || levelHuman[1];
  const tierRates: Record<number, number> = { 1: 5, 2: 7, 3: 10, 4: 15 };
  const currentRate = tierRates[currentLevel] || 5;

  // Copy link helper
  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado!', {
      description: 'Compartilhe para expandir sua onda de impacto.',
    });
  };

  const shareLink = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clube do Adubo — Entre no ciclo',
          text: 'Faça parte da economia circular urbana. Transforme resíduos em impacto real.',
          url: referralLink,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  // ── Error ──
  if (!isLoading && !profile && !referralCode) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Não foi possível carregar seus dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tente novamente em instantes.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-80" />
          </div>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasNetwork = referredUsers.length > 0;
  const activeNetwork = referredUsers.filter(u => u.isActive).length;
  const networkPros = referredUsers.reduce((sum, u) => sum + u.prosCount, 0);
  const commissionEarned = stats?.commission_earned || 0;
  const visibleNetwork = showAllNetwork ? referredUsers : referredUsers.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ═══ Header ═══ */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha onda de impacto</h1>
          <p className="text-muted-foreground leading-relaxed">
            Cada pessoa que entra pelo seu link amplia o ciclo. Aqui você acompanha como sua participação se expande.
          </p>
        </section>

        {/* ═══ BLOCO 1 — Seu link e sua porta de entrada ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Sua porta de entrada no ciclo</h2>
          {referralCode ? (
            <Card className="border-primary/20">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este é seu link pessoal. Quando alguém entra no Clube do Adubo por ele, essa pessoa faz parte da sua onda de impacto.
                </p>

                {/* Link display + copy */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      value={referralLink || ''}
                      readOnly
                      className="font-mono text-sm bg-muted pr-3 truncate"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyLink} variant="default" size="sm" className="gap-1.5">
                      <Copy className="w-4 h-4" /> Copiar
                    </Button>
                    <Button onClick={shareLink} variant="outline" size="sm" className="gap-1.5">
                      <Link2 className="w-4 h-4" /> Compartilhar
                    </Button>
                  </div>
                </div>

                {/* Public page — prominent */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">Sua página pessoal no ciclo</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Quem visita seu link vê uma página com seu impacto real. Você pode abrir, revisar e compartilhar quando quiser.
                  </p>
                  <a
                    href={referralLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Abrir minha página →
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <Link2 className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Seu link será gerado automaticamente quando seu perfil estiver completo.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ═══ BLOCO 2 — Resumo da sua onda ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Sua onda agora</h2>
          {hasNetwork ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Pessoas conectadas</span>
                      <MicroHelp text="Pessoas que entraram no Clube do Adubo através do seu link." />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{referredUsers.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeNetwork} {activeNetwork === 1 ? 'já está participando' : 'já estão participando'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Participações geradas</span>
                    <p className="text-2xl font-bold text-foreground">{networkPros}</p>
                    <p className="text-xs text-muted-foreground">Criadas por quem entrou pela sua onda</p>
                  </CardContent>
                </Card>
              </div>
              {impact.co2AvoidedKg > 0 && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  🌿 Sua onda já ajudou a evitar <span className="font-semibold text-foreground">{impact.co2AvoidedKg.toFixed(1)} kg de CO₂</span> — calculado com base nos resíduos que sua rede processou no ciclo.
                </p>
              )}
            </>
          ) : (
            <Card className="border-dashed border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Waves className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Sua onda ainda não começou</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Quando alguém entrar no ciclo pelo seu link, essa pessoa vai aparecer aqui e você vai acompanhar o impacto que vocês geram juntos.
                  </p>
                </div>
                <Button onClick={shareLink} className="earth-gradient gap-1.5">
                  <Link2 className="w-4 h-4" /> Compartilhar meu link
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ═══ BLOCO 3 — Sua rede (LGPD-safe) ═══ */}
        {hasNetwork && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Pessoas na sua onda</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Quem entrou no ciclo pelo seu link. Os nomes são exibidos de forma abreviada para proteger a privacidade de cada participante.
              </p>
            </div>

            <div className="space-y-2">
              {visibleNetwork.map(user => (
                <Card key={user.id} className={user.isActive ? '' : 'opacity-70'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {safeDisplayName(user.fullName)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Entrou em {format(new Date(user.joinedAt), 'MMM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {user.isActive ? (
                          <Badge variant="default" className="text-xs">Participando</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Cadastrado</Badge>
                        )}
                        {user.prosCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {user.prosCount} {user.prosCount === 1 ? 'participação' : 'participações'}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {referredUsers.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllNetwork(!showAllNetwork)}
                className="gap-1 w-full text-muted-foreground"
              >
                {showAllNetwork ? (
                  <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Ver todas ({referredUsers.length})</>
                )}
              </Button>
            )}
          </section>
        )}

        {/* ═══ BLOCO 4 — Seu momento na onda ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Seu momento na onda</h2>
          <Card className="border-primary/15">
            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Level display */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {levelInfo.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-lg">{levelInfo.label}</p>
                    <MicroHelp text="Seu reconhecimento dentro da onda é baseado no número de pessoas que estão participando ativamente por seu link." />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{levelInfo.reading}</p>
                </div>
              </div>

              {/* Retorno da onda */}
              {(commissionEarned > 0 || hasNetwork) && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-foreground">Como o retorno da onda acontece</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O adubo produzido pelo ciclo é vendido para compradores reais. De cada venda, uma parte do valor sustenta a operação e outra parte é distribuída dentro do ciclo. Quem ajudou a expandir a rede recebe uma parcela proporcional dessas vendas — hoje, no seu nível, isso corresponde a <span className="font-semibold text-foreground">{currentRate}%</span> sobre cada venda ligada à sua onda.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Esse retorno só existe porque existe venda real de adubo. Sem venda, não há retorno.
                  </p>
                  {commissionEarned > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">Total acumulado até agora</p>
                      <p className="text-lg font-bold text-primary">
                        R$ {commissionEarned.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Preference note */}
              {authProfile?.commission_preference && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Preferência atual de retorno: <span className="font-medium text-foreground">
                    {authProfile.commission_preference === 'pro' || authProfile.commission_preference === 'pros'
                      ? 'Converter em participações'
                      : authProfile.commission_preference === 'pix'
                        ? 'Receber via Pix'
                        : authProfile.commission_preference === 'mix'
                          ? 'Parte em participações, parte via Pix'
                          : authProfile.commission_preference}
                  </span>.
                  Para alterar, acesse <Link to="/perfil" className="text-primary hover:underline">seu perfil</Link>.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 5 — Como a onda funciona ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Como a onda funciona</h2>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              {[
                {
                  emoji: '🔗',
                  title: 'Cada pessoa tem um link próprio',
                  desc: 'Seu link é único. Quando alguém entra pelo seu link, ela se conecta à sua onda de impacto dentro do ciclo.',
                },
                {
                  emoji: '🌊',
                  title: 'A onda cresce com participação real',
                  desc: 'Cada pessoa que participa de verdade — com resíduos entrando no ciclo — amplia o impacto ambiental da sua onda.',
                },
                {
                  emoji: '♻️',
                  title: 'Parte do ciclo volta para quem ajudou a expandir',
                  desc: 'Quando o adubo é vendido, uma parcela do valor é direcionada a quem contribuiu para expandir a rede. O reconhecimento cresce conforme sua onda se fortalece.',
                },
              ].map(step => (
                <div key={step.title} className="flex gap-3 items-start">
                  <span className="text-xl mt-0.5">{step.emoji}</span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 6 — Reconhecimento progressivo ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Reconhecimento progressivo</h2>
          <p className="text-sm text-muted-foreground">
            Conforme sua onda cresce, seu papel dentro do ciclo evolui.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(level => {
              const info = levelHuman[level];
              const isCurrent = level === currentLevel;
              const rate = tierRates[level];
              return (
                <Card key={level} className={isCurrent ? 'border-primary/30 bg-primary/5' : 'opacity-60'}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.emoji}</span>
                      <span className="font-semibold text-foreground">{info.label}</span>
                      {isCurrent && <Badge variant="default" className="text-[10px] px-1.5 py-0">Você</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{info.reading}</p>
                    <p className="text-[11px] text-muted-foreground/70">{rate}% de participação nas vendas da rede</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ═══ BLOCO 7 — Próximo passo ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Próximo passo</h2>
          <Card className="border-primary/15">
            <CardContent className="p-5 sm:p-6 space-y-3">
              {!hasNetwork ? (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Compartilhe seu link com alguém que possa se interessar pelo ciclo. Uma pessoa já é o começo da sua onda.
                  </p>
                  <Button onClick={shareLink} className="earth-gradient gap-1.5">
                    <Link2 className="w-4 h-4" /> Compartilhar meu link
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-foreground font-medium leading-relaxed">
                    Sua onda já está ativa. Continue acompanhando e, quando quiser, amplie compartilhando seu link.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={shareLink} className="earth-gradient gap-1.5">
                      <Link2 className="w-4 h-4" /> Compartilhar novamente
                    </Button>
                    <Link to="/dreams">
                      <Button variant="outline" className="gap-1.5">
                        <Sparkles className="w-4 h-4" /> Ver meus sonhos
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ Continue sua jornada ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Continue sua jornada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PathCard
              title="Minha participação"
              text="Veja onde estão suas participações no ciclo."
              link="/fifo"
            />
            <PathCard
              title="Meus sonhos"
              text="Dê direção pessoal ao retorno do ciclo."
              link="/dreams"
            />
            <PathCard
              title="Entender o ciclo"
              text="Veja como cada etapa funciona."
              link="/ciclo"
            />
          </div>
        </section>

      </div>
    </div>
  );
}

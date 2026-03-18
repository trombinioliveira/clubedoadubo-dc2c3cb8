import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Eye, Globe, PartyPopper, X, Compass, ArrowRight, Footprints, Waves, RefreshCw, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

type UserStage = 'starting' | 'entered' | 'connected' | 'recurring';

const JornadaPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `welcome_shown_${user.id}`;
    const alreadyShown = localStorage.getItem(key);
    if (!alreadyShown) {
      setShowWelcome(true);
      localStorage.setItem(key, 'true');
    }
  }, [user]);

  const { data: prosCount = 0 } = useQuery({
    queryKey: ['jornada-pros', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('pros')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: dreamsCount = 0 } = useQuery({
    queryKey: ['jornada-dreams', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('dreams')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: hasSubscription = false } = useQuery({
    queryKey: ['jornada-sub', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { count } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');
      return (count ?? 0) > 0;
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(' ')[0] || 'Participante';

  // Determine user stage
  const stage: UserStage = hasSubscription
    ? 'recurring'
    : dreamsCount > 0
      ? 'connected'
      : prosCount > 0
        ? 'entered'
        : 'starting';

  const stageContent = {
    starting: {
      phrase: 'Você chegou ao seu espaço no Clube do Adubo. Agora pode dar seu primeiro passo no ciclo.',
      micro: 'Começando por aqui, você entende melhor como sua participação funciona e passa a acompanhar tudo com clareza.',
      cta: 'Dar meu primeiro passo',
      ctaLink: '/planos#inicio',
      cta2: 'Entender como funciona',
      cta2Link: '/ciclo',
      nextPhrase: 'Seu melhor próximo passo agora é começar sua participação no ciclo.',
      nextMicro: 'Ao começar, você entra no sistema de forma concreta e passa a acompanhar tudo por aqui.',
      nextCta: 'Dar meu primeiro passo',
      nextCtaLink: '/planos#inicio',
    },
    entered: {
      phrase: 'Sua participação já começou. Agora vale dar direção ao que você está construindo por aqui.',
      micro: 'Ao conectar um sonho à sua jornada, fica mais fácil acompanhar sua evolução e sentir o ciclo ganhar forma na sua vida.',
      cta: 'Criar meu primeiro sonho',
      ctaLink: '/dreams',
      cta2: 'Ver como o ciclo funciona',
      cta2Link: '/ciclo',
      nextPhrase: 'Agora vale conectar sua participação a algo que faça sentido para você.',
      nextMicro: 'Ao criar um sonho, sua jornada ganha direção e fica mais fácil acompanhar sua evolução.',
      nextCta: 'Criar meu primeiro sonho',
      nextCtaLink: '/dreams',
    },
    connected: {
      phrase: 'Sua jornada já está conectada a algo seu. Agora você pode acompanhar com mais clareza o que está em movimento.',
      micro: 'Você já transformou participação em direção. O próximo passo é acompanhar sua evolução e fortalecer seu ritmo no ciclo.',
      cta: 'Acompanhar minha jornada',
      ctaLink: '/fifo',
      cta2: 'Conhecer a participação mensal',
      cta2Link: '/planos#inicio',
      nextPhrase: 'Seu próximo passo agora é acompanhar o que já está em movimento na sua jornada.',
      nextMicro: 'Você já começou e já deu direção ao ciclo. Agora vale observar sua evolução e fortalecer sua participação.',
      nextCta: 'Acompanhar minha jornada',
      nextCtaLink: '/fifo',
      nextCta2: 'Conhecer a participação mensal',
      nextCta2Link: '/planos#inicio',
    },
    recurring: {
      phrase: 'Sua participação já segue com continuidade. Por aqui, você acompanha o que está ativo, o que evoluiu e o que vem a seguir.',
      micro: 'Seu ciclo já está em movimento recorrente. Agora o mais importante é acompanhar desdobramentos, sonhos e próximos avanços.',
      cta: 'Ver minha evolução',
      ctaLink: '/fifo',
      cta2: 'Acompanhar o sistema',
      cta2Link: '/painel-publico#inicio',
      nextPhrase: 'Seu próximo passo agora é acompanhar seus avanços e os desdobramentos da sua participação.',
      nextMicro: 'Com participação contínua ativa, o mais importante passa a ser visão, acompanhamento e próximos ajustes da jornada.',
      nextCta: 'Ver minha evolução',
      nextCtaLink: '/fifo',
    },
  };

  const content = stageContent[stage];
  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Welcome banner — shown only once */}
        {showWelcome && (
          <motion.div {...fadeIn} className="relative rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <PartyPopper className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">
                  Bem-vindo ao Clube do Adubo
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Seu e-mail foi confirmado com sucesso. Agora você já pode acompanhar sua jornada, conhecer os planos e dar o próximo passo no ciclo.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to="/planos#inicio">
                    <Button size="sm" className="earth-gradient font-medium gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Conhecer os planos
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setShowWelcome(false)}>
                    Ver minha jornada
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========== BLOCO 1 — Seu momento no ciclo ========== */}
        <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Seu momento no ciclo
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            Olá, {firstName}!
          </p>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 sm:p-6 space-y-3">
              <p className="text-foreground font-medium leading-relaxed">
                {content.phrase}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.micro}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link to={content.ctaLink}>
                  <Button className="earth-gradient gap-1.5">
                    <ArrowRight className="w-4 h-4" />
                    {content.cta}
                  </Button>
                </Link>
                {content.cta2 && (
                  <Link to={content.cta2Link!}>
                    <Button variant="outline" size="sm">
                      {content.cta2}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ========== BLOCO 2 — O que já está em andamento ========== */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-semibold text-foreground mb-1">O que já está em andamento</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Veja o que já começou a ganhar forma na sua jornada.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-5 text-center space-y-1">
                <Sparkles className="w-7 h-7 text-primary mx-auto" />
                <p className="text-2xl font-bold text-foreground">{prosCount}</p>
                <p className="text-xs text-muted-foreground">Sua participação</p>
                <p className="text-[11px] text-muted-foreground/70 leading-tight">
                  Tudo o que você já conectou ao ciclo.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-5 text-center space-y-1">
                <Heart className="w-7 h-7 text-primary mx-auto" />
                <p className="text-2xl font-bold text-foreground">{dreamsCount}</p>
                <p className="text-xs text-muted-foreground">Seus sonhos</p>
                <p className="text-[11px] text-muted-foreground/70 leading-tight">
                  Para onde sua jornada está apontando.
                </p>
              </CardContent>
            </Card>
            {/* Card 3 — Ritmo (opcional) */}
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="p-4 sm:p-5 text-center space-y-1">
                <RefreshCw className="w-7 h-7 text-primary mx-auto" />
                <p className="text-2xl font-bold text-foreground">{hasSubscription ? 'Ativo' : '—'}</p>
                <p className="text-xs text-muted-foreground">Seu ritmo</p>
                <p className="text-[11px] text-muted-foreground/70 leading-tight">
                  {hasSubscription
                    ? 'Sua participação segue em ritmo contínuo.'
                    : 'Você pode automatizar sua participação depois.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ========== BLOCO 3 — Seu próximo passo ========== */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
          <h2 className="text-xl font-semibold text-foreground mb-1">Seu próximo passo</h2>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <p className="text-foreground font-medium">{content.nextPhrase}</p>
              <p className="text-sm text-muted-foreground">{content.nextMicro}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link to={content.nextCtaLink}>
                  <Button className="earth-gradient gap-1.5">
                    <ArrowRight className="w-4 h-4" />
                    {content.nextCta}
                  </Button>
                </Link>
                {(content as any).nextCta2 && (
                  <Link to={(content as any).nextCta2Link}>
                    <Button variant="outline" size="sm">
                      {(content as any).nextCta2}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ========== BLOCO 4 — Como sua jornada avança ========== */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-semibold text-foreground mb-1">Como sua jornada avança</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sua participação não fica parada. Ela ganha forma, direção e continuidade com o tempo.
          </p>
          <div className="space-y-3">
            {[
              {
                title: 'Você entrou no ciclo',
                text: 'Sua participação já começou de forma real.',
                active: prosCount > 0,
              },
              {
                title: 'Você deu direção à sua jornada',
                text: 'Seus sonhos ajudam a transformar participação em algo que faz sentido para sua vida.',
                active: dreamsCount > 0,
              },
              {
                title: 'Sua jornada pode ganhar continuidade',
                text: 'Acompanhar e fortalecer o ritmo da sua participação torna sua experiência mais viva e mais estável.',
                active: hasSubscription,
              },
            ].map((marco, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  marco.active
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  marco.active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {marco.active ? '✓' : i + 1}
                </div>
                <div>
                  <p className={`font-medium text-sm ${marco.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {marco.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{marco.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ========== BLOCO 5 — Continue sua jornada ========== */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
          <h2 className="text-xl font-semibold text-foreground mb-1">Continue sua jornada</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Aqui estão os caminhos mais importantes para continuar acompanhando e construindo sua participação.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Entender meu ciclo',
                text: 'Veja as etapas da sua participação e entenda como o sistema funciona.',
                link: '/ciclo',
                icon: Footprints,
              },
              {
                title: 'Ver meus sonhos',
                text: 'Acompanhe o que já está conectado à sua jornada.',
                link: '/dreams',
                icon: Heart,
              },
              {
                title: 'Acompanhar minha participação',
                text: 'Veja como sua posição evolui e acompanhe o andamento do ciclo.',
                link: '/fifo',
                icon: Sparkles,
              },
              {
                title: 'Minha onda de impacto',
                text: 'Acompanhe como sua participação pode alcançar outras pessoas.',
                link: '/indicacoes',
                icon: Waves,
              },
            ].map(({ title, text, link, icon: Icon }) => (
              <Link key={link} to={link}>
                <Card className="hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{text}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ========== BLOCO 6 — Você faz parte de algo maior ========== */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-5 sm:p-6 text-center space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Você faz parte de algo maior</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Sua jornada faz parte de um ciclo real de transformação de resíduos, produção de adubo e acompanhamento público no território.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                <Link to="/painel-publico#inicio">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="w-4 h-4" />
                    Ver o Painel Público
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Globe className="w-4 h-4" />
                    Ir para a Área Pública
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default JornadaPage;

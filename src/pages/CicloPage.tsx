import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Heart, Eye, RefreshCw, Footprints, Compass } from 'lucide-react';

interface StepStatus {
  hasPro: boolean;
  hasDream: boolean;
  hasSubscription: boolean;
}

export default function CicloPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<StepStatus>({
    hasPro: false,
    hasDream: false,
    hasSubscription: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStatus();
  }, [user]);

  const fetchStatus = async () => {
    if (!user) return;
    setIsLoading(true);
    const [prosRes, dreamsRes, subsRes] = await Promise.all([
      supabase.from('pros').select('id').eq('user_id', user.id).limit(1),
      supabase.from('dreams').select('id').eq('user_id', user.id).limit(1),
      supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').limit(1),
    ]);
    setStatus({
      hasPro: (prosRes.data?.length ?? 0) > 0,
      hasDream: (dreamsRes.data?.length ?? 0) > 0,
      hasSubscription: (subsRes.data?.length ?? 0) > 0,
    });
    setIsLoading(false);
  };

  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const steps = [
    {
      title: 'Entrar no ciclo',
      text: 'Sua participação começa quando você assume um lugar real dentro do sistema.',
      active: status.hasPro,
      icon: Sparkles,
      cta: status.hasPro ? null : { label: 'Dar meu primeiro passo', link: '/planos#inicio' },
    },
    {
      title: 'Acompanhar a transformação',
      text: 'O resíduo passa por um processo real até se tornar adubo e seguir adiante no ciclo.',
      active: status.hasPro,
      icon: RefreshCw,
      cta: status.hasPro ? { label: 'Ver minha participação', link: '/fifo' } : null,
    },
    {
      title: 'Dar direção à sua jornada',
      text: 'Ao conectar um sonho, sua participação passa a apontar para algo concreto na sua vida.',
      active: status.hasDream,
      icon: Heart,
      cta: status.hasDream ? null : { label: 'Criar meu primeiro sonho', link: '/dreams' },
    },
    {
      title: 'Ver o retorno do ciclo',
      text: 'Quando o adubo entra em movimento e o ciclo se fecha, sua participação acompanha esse retorno com clareza.',
      active: status.hasSubscription,
      icon: Eye,
      cta: null,
    },
  ];

  // Determine current step (number for display)
  const currentStepIndex: number = !status.hasPro ? 0 : !status.hasDream ? 2 : !status.hasSubscription ? 3 : 4;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
      {/* ========== HEADER ========== */}
      <motion.div {...fadeIn} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Passo a passo do ciclo
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Entenda como sua participação funciona e em que etapa você está hoje.
        </p>
      </motion.div>

      {/* ========== BLOCO 1 — Abertura explicativa ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="mb-8">
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aqui você acompanha, de forma simples, como sua participação entra no ciclo, ganha direção e se conecta ao retorno real do sistema.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== BLOCO 2 — Seu estágio no ciclo ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-1">Seu estágio no ciclo</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Seu momento atual aparece aqui para ajudar você a entender o que já aconteceu e o que ainda pode avançar.
        </p>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                {Math.min(currentStepIndex + 1, 4)}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {currentStepIndex === 0 && 'Você ainda não entrou no ciclo'}
                  {currentStepIndex === 1 && 'Sua participação já começou'}
                  {currentStepIndex === 2 && 'Hora de dar direção à sua jornada'}
                  {currentStepIndex === 3 && 'Acompanhando o retorno do ciclo'}
                  {currentStepIndex >= 4 && 'Sua jornada está em movimento contínuo'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentStepIndex === 0 && 'Dê seu primeiro passo para começar.'}
                  {currentStepIndex === 1 && 'Sua transformação já está em andamento.'}
                  {currentStepIndex === 2 && 'Conecte um sonho para avançar.'}
                  {currentStepIndex === 3 && 'O ciclo continua avançando.'}
                  {currentStepIndex >= 4 && 'Tudo funcionando com continuidade.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== BLOCO 3 — As etapas do ciclo ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">As etapas do ciclo</h2>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Card className={`transition-colors ${
                  step.active
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border'
                }`}>
                  <CardContent className="p-4 sm:p-5 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.active ? <span className="text-sm font-bold">✓</span> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.text}</p>
                      {step.cta && (
                        <Link to={step.cta.link}>
                          <Button size="sm" variant="outline" className="mt-2 gap-1">
                            {step.cta.label}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ========== BLOCO 4 — O que acontece depois ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">O que acontece depois</h2>
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              No Clube do Adubo, o ciclo não termina como um ponto final. Ele continua em movimento, e sua jornada pode seguir avançando com mais clareza e continuidade.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== BLOCO 5 — Continue sua jornada ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.45 }}>
        <h2 className="text-xl font-semibold text-foreground mb-4">Continue sua jornada</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: 'Minha Jornada',
              text: 'Veja seu momento atual e o próximo passo.',
              link: '/jornada',
              icon: Compass,
            },
            {
              title: 'Meus Sonhos',
              text: 'Conecte sua participação a algo concreto.',
              link: '/dreams',
              icon: Heart,
            },
            {
              title: 'Minha participação',
              text: 'Acompanhe onde você está no ciclo.',
              link: '/fifo',
              icon: Sparkles,
            },
          ].map(({ title, text, link, icon: Icon }) => (
            <Link key={link} to={link}>
              <Card className="hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4 text-center space-y-2">
                  <Icon className="w-5 h-5 text-primary mx-auto" />
                  <p className="font-medium text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ListOrdered, Heart, RefreshCw, Check, ArrowRight, Leaf } from 'lucide-react';
import { PurchaseProModal } from '@/components/PurchaseProModal';

interface StepStatus {
  hasPro: boolean;
  hasViewedFifo: boolean;
  hasDream: boolean;
  hasSubscription: boolean;
}

export default function CicloPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<StepStatus>({
    hasPro: false,
    hasViewedFifo: false,
    hasDream: false,
    hasSubscription: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (user) fetchStatus();
  }, [user]);

  const fetchStatus = async () => {
    if (!user) return;
    setIsLoading(true);

    const [prosRes, dreamsRes, subsRes, profileRes] = await Promise.all([
      supabase.from('pros').select('id').eq('user_id', user.id).limit(1),
      supabase.from('dreams').select('id').eq('user_id', user.id).limit(1),
      supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').limit(1),
      supabase.from('profiles').select('has_viewed_fifo').eq('user_id', user.id).single(),
    ]);

    setStatus({
      hasPro: (prosRes.data?.length ?? 0) > 0,
      hasViewedFifo: profileRes.data?.has_viewed_fifo ?? false,
      hasDream: (dreamsRes.data?.length ?? 0) > 0,
      hasSubscription: (subsRes.data?.length ?? 0) > 0,
    });
    setIsLoading(false);
  };

  const completedCount = [status.hasPro, status.hasViewedFifo, status.hasDream, status.hasSubscription].filter(Boolean).length;
  const progressPercent = (completedCount / 4) * 100;
  const allComplete = completedCount === 4;
  const step4Recommended = status.hasPro && status.hasDream;

  const steps = [
    {
      num: 1,
      icon: Sparkles,
      title: 'Ative seu primeiro PRO',
      description: 'Cada PRO representa 100g de resíduo real sendo transformado.',
      completed: status.hasPro,
      action: () => setShowPurchaseModal(true),
      actionLabel: 'Ativar agora',
    },
    {
      num: 2,
      icon: ListOrdered,
      title: 'Entenda sua posição na fila',
      description: 'A fila é única, cronológica e pública. Ninguém fura.',
      completed: status.hasViewedFifo,
      action: () => navigate('/fifo'),
      actionLabel: 'Ver minha posição',
    },
    {
      num: 3,
      icon: Heart,
      title: 'Conecte um sonho ao ciclo',
      description: 'Dê um destino ao seu impacto.',
      completed: status.hasDream,
      action: () => navigate('/dreams'),
      actionLabel: 'Criar meu primeiro sonho',
    },
    {
      num: 4,
      icon: RefreshCw,
      title: 'Feche o ciclo',
      description: 'Transforme impacto pontual em impacto contínuo com assinatura.',
      completed: status.hasSubscription,
      action: () => navigate('/planos'),
      actionLabel: 'Fechar o ciclo mensal',
      recommended: step4Recommended && !status.hasSubscription,
      completedLabel: 'Ciclo fechado',
      completedSubtitle: 'Impacto recorrente ativo',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Seu Caminho no Ciclo
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Transforme resíduo em impacto real — passo a passo.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Você completou {completedCount} de 4 etapas
            </span>
            <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </motion.div>

        {/* All Complete Banner */}
        <AnimatePresence>
          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 p-6 rounded-2xl earth-gradient text-primary-foreground text-center shadow-glow"
            >
              <div className="text-4xl mb-2">🌿</div>
              <h2 className="text-xl font-bold mb-1">Você fechou o ciclo.</h2>
              <p className="text-sm opacity-90">
                Sustentabilidade em ação. Seu impacto é real e contínuo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Cards */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = step.completed;

            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
              >
                <Card className={`relative overflow-hidden transition-all ${
                  isCompleted
                    ? 'border-primary/30 bg-primary/5'
                    : step.recommended
                      ? 'border-accent/50 bg-accent/5 shadow-md ring-1 ring-accent/30'
                      : 'border-border'
                }`}>
                  {step.recommended && (
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg bg-accent text-accent-foreground text-xs font-semibold">
                      Recomendado
                    </div>
                  )}
                  <CardContent className="p-5 sm:p-6 flex items-start gap-4">
                    {/* Number Circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="w-6 h-6" /> : step.num}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                      {isCompleted ? (
                        <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                          <Check className="w-3 h-3 mr-1" />
                          {step.completedLabel || 'Concluído'}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={step.action}
                          className={step.recommended ? 'gold-gradient text-accent-foreground' : 'earth-gradient text-primary-foreground'}
                        >
                          {step.actionLabel}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}

                      {isCompleted && step.completedSubtitle && (
                        <p className="text-xs text-primary mt-1">{step.completedSubtitle}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12 mb-8"
        >
          <Leaf className="w-6 h-6 mx-auto text-primary mb-3 opacity-60" />
          <p className="text-muted-foreground text-sm italic leading-relaxed">
            Sustentabilidade não precisa ser complicada.<br />
            Ela só precisa funcionar.
          </p>
        </motion.div>
      </div>

      {/* Purchase Modal */}
      <PurchaseProModal
        open={showPurchaseModal}
        onOpenChange={(open) => {
          setShowPurchaseModal(open);
          if (!open) fetchStatus();
        }}
        onConfirm={() => {
          setShowPurchaseModal(false);
          fetchStatus();
        }}
      />
    </div>
  );
}

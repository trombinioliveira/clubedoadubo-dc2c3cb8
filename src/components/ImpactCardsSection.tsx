import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { Leaf, RefreshCw, Users, Award, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImpactCardsSectionProps {
  directPros: number;
  recurringPros: number;
  globalPros: number;
  fifoPosition?: number;
  currentGoal?: number;
  statusBadge?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const
    }
  })
};

export const ImpactCardsSection = ({
  directPros,
  recurringPros,
  globalPros,
  fifoPosition,
  currentGoal = 2,
  statusBadge = 'Participante'
}: ImpactCardsSectionProps) => {
  const goalProgress = Math.min((globalPros / currentGoal) * 100, 100);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Meu Impacto
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1 - PROs Diretos */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="overflow-hidden card-hover-lift border-2 border-transparent hover:border-primary/30">
            <CardContent className="p-0">
              <div className="earth-gradient p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium">PROs Diretos</p>
                    <p className="text-white text-2xl font-bold">{directPros}</p>
                  </div>
                </div>
                <HelpTooltip 
                  content="PROs Diretos são gerados quando alguém compra usando seu link. Eles representam impacto criado diretamente por você e não entram na fila FIFO."
                  className="bg-white/20 hover:bg-white/30"
                />
              </div>
              <div className="p-3 bg-primary/5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Impacto direto da sua indicação
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2 - Impacto Recorrente */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="overflow-hidden card-hover-lift border-2 border-transparent hover:border-secondary/30">
            <CardContent className="p-0">
              <div className="warmth-gradient p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse-slow">
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium">PROs Recorrentes</p>
                    <p className="text-white text-2xl font-bold">{recurringPros}</p>
                  </div>
                </div>
                <HelpTooltip 
                  content="Quando alguém indicado mantém uma assinatura ativa, o impacto continua acontecendo mês a mês. São PROs que você ganha por manter sua rede engajada."
                  className="bg-white/20 hover:bg-white/30"
                />
              </div>
              <div className="p-3 bg-secondary/5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Impacto contínuo da sua rede
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3 - Fila FIFO Global */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="overflow-hidden card-hover-lift border-2 border-transparent hover:border-accent/30">
            <CardContent className="p-0">
              <div className="gold-gradient p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium">PROs Globais</p>
                    <p className="text-white text-2xl font-bold">{globalPros}<span className="text-sm font-normal">/{currentGoal}</span></p>
                  </div>
                </div>
                <HelpTooltip 
                  content="A fila global funciona em ordem de chegada. Cada venda de adubo gera 1 PRO Global que vai para quem está no início da fila, garantindo justiça para todos."
                  className="bg-white/20 hover:bg-white/30"
                />
              </div>
              <div className="p-3 bg-accent/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Meta de impacto</span>
                  <span className="font-medium text-accent">{Math.round(goalProgress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
                {fifoPosition && (
                  <p className="text-xs text-muted-foreground">
                    Posição na fila: <span className="font-medium">#{fifoPosition}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4 - Status no Clube */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="overflow-hidden card-hover-lift border-2 border-transparent hover:border-emerald-500/30">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-glow">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium">Status no Clube</p>
                    <p className="text-white text-lg font-bold">{statusBadge}</p>
                  </div>
                </div>
                <HelpTooltip 
                  content="Seu status reflete sua constância e contribuição para o ecossistema. Aqui o reconhecimento é real e você ajuda o ciclo a girar."
                  className="bg-white/20 hover:bg-white/30"
                />
              </div>
              <div className="p-3 bg-emerald-500/5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Reconhecimento por constância
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Frase guia */}
      <motion.div 
        className="text-center py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm text-muted-foreground italic">
          "Você ajuda o ciclo a girar. O ciclo cuida de todos."
        </p>
      </motion.div>
    </div>
  );
};

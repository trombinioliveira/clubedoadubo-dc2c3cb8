import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HelpTooltip } from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Leaf, ListOrdered, Scale, User, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ProStatus = 'pending' | 'processing' | 'ready' | 'sold' | 'paid';

interface FifoQueuePublic {
  queue_id: string;
  queue_position: number;
  queue_status: ProStatus;
  queue_created_at: string;
  queue_paid_at: string | null;
  pro_id: string;
  pro_code: string;
  pro_weight_grams: number;
  pro_status: ProStatus;
  pro_created_at: string;
  pro_user_id: string | null;
  user_name: string;
}

interface StageConfig {
  key: string;
  label: string;
  title: string;
  icon: string;
  statuses: ProStatus[];
  color: string;
  bgColor: string;
  tooltip: string;
  curiosity: string;
}

const stageConfigs: StageConfig[] = [
  { 
    key: 'pending', 
    label: '1', 
    title: 'Coleta', 
    icon: '📍', 
    statuses: ['pending'],
    color: 'hsl(var(--chart-4))',
    bgColor: 'bg-amber-500',
    tooltip: 'Esses resíduos estão aguardando coleta nos pontos parceiros.',
    curiosity: 'Os resíduos coletados vêm de restaurantes, cafeterias e residências urbanas.'
  },
  { 
    key: 'processing', 
    label: '2', 
    title: 'Processamento', 
    icon: '🏭', 
    statuses: ['processing'],
    color: 'hsl(var(--chart-3))',
    bgColor: 'bg-orange-500',
    tooltip: 'Resíduos em compostagem, transformando-se em adubo.',
    curiosity: 'O processo de compostagem leva em média 60-90 dias.'
  },
  { 
    key: 'ready', 
    label: '3', 
    title: 'Produção', 
    icon: '🌾', 
    statuses: ['ready'],
    color: 'hsl(var(--chart-2))',
    bgColor: 'bg-green-500',
    tooltip: 'Adubo pronto! Aguardando distribuição para venda.',
    curiosity: '100g de resíduo produzem aproximadamente 30g de adubo de alta qualidade.'
  },
  { 
    key: 'sold', 
    label: '4', 
    title: 'Venda', 
    icon: '📦', 
    statuses: ['sold'],
    color: 'hsl(var(--chart-1))',
    bgColor: 'bg-blue-500',
    tooltip: 'Adubo vendido! O Real do Ciclo está em movimento.',
    curiosity: 'Cada venda ativa R$ 2,00 que seguem a ordem da Fila FIFO.'
  },
  { 
    key: 'paid', 
    label: 'R$', 
    title: 'Pago', 
    icon: '💰', 
    statuses: ['paid'],
    color: 'hsl(var(--primary))',
    bgColor: 'bg-emerald-500',
    tooltip: 'Ciclo completo! O valor foi distribuído ao participante.',
    curiosity: 'R$ 2,00 por PRO = 100% do valor vem da venda real de adubo.'
  },
];

interface FifoCircularRingProps {
  queue: FifoQueuePublic[];
  userId?: string;
  stats: {
    totalInQueue: number;
    pending: number;
    processing: number;
    ready: number;
    sold: number;
    paid: number;
  };
}

type FilterMode = 'mine' | 'all' | 'compare';

export function FifoCircularRing({ queue, userId, stats }: FifoCircularRingProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('compare');
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [selectedPro, setSelectedPro] = useState<FifoQueuePublic | null>(null);
  const [showRealAnimation, setShowRealAnimation] = useState(false);

  // Calculate user's PROs per stage
  const userStats = useMemo(() => {
    const userPros = queue.filter(p => p.pro_user_id === userId);
    return {
      total: userPros.length,
      pending: userPros.filter(p => p.queue_status === 'pending').length,
      processing: userPros.filter(p => p.queue_status === 'processing').length,
      ready: userPros.filter(p => p.queue_status === 'ready').length,
      sold: userPros.filter(p => p.queue_status === 'sold').length,
      paid: userPros.filter(p => p.queue_status === 'paid').length,
    };
  }, [queue, userId]);

  // Get PROs for trajectory visualization
  const trajectoryPros = useMemo(() => {
    if (filterMode === 'mine') {
      return queue.filter(p => p.pro_user_id === userId);
    }
    return queue;
  }, [queue, userId, filterMode]);

  const getStatusLabel = (status: ProStatus) => {
    const labels: Record<ProStatus, string> = {
      pending: 'Aguardando Coleta',
      processing: 'Em Processamento',
      ready: 'Pronto (Adubo)',
      sold: 'Vendido',
      paid: 'Pago'
    };
    return labels[status];
  };

  const getStageCount = (stageKey: string): { global: number; user: number } => {
    const key = stageKey as keyof typeof stats;
    return {
      global: stats[key] || 0,
      user: userStats[key] || 0,
    };
  };

  // SVG Arc calculations
  const size = 320;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gapAngle = 6; // Gap between arcs in degrees
  const totalGap = gapAngle * 5;
  const arcAngle = (360 - totalGap) / 5;

  const polarToCartesian = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(startAngle, r);
    const end = polarToCartesian(endAngle, r);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  // Generate trajectory dots positions
  const generateDots = (stageIndex: number, count: number, isUser: boolean) => {
    const startAngle = stageIndex * (arcAngle + gapAngle);
    const endAngle = startAngle + arcAngle;
    const dotRadius = isUser ? radius + 25 : radius - 25;
    const dots = [];
    
    const maxDots = Math.min(count, 8);
    for (let i = 0; i < maxDots; i++) {
      const angle = startAngle + ((endAngle - startAngle) / (maxDots + 1)) * (i + 1);
      const pos = polarToCartesian(angle, dotRadius);
      dots.push({ x: pos.x, y: pos.y, angle });
    }
    
    return dots;
  };

  // Trigger Real do Ciclo animation
  const triggerRealAnimation = () => {
    setShowRealAnimation(true);
    setTimeout(() => setShowRealAnimation(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Visualizar:</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filterMode"
                  checked={filterMode === 'mine'}
                  onChange={() => setFilterMode('mine')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">Meus PROs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filterMode"
                  checked={filterMode === 'all'}
                  onChange={() => setFilterMode('all')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">Todos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filterMode"
                  checked={filterMode === 'compare'}
                  onChange={() => setFilterMode('compare')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">Comparar</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Ring Visualization */}
      <div className="relative flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Main Arcs */}
          {stageConfigs.map((stage, index) => {
            const startAngle = index * (arcAngle + gapAngle);
            const endAngle = startAngle + arcAngle;
            const counts = getStageCount(stage.key);
            
            return (
              <g key={stage.key}>
                {/* Arc Background */}
                <motion.path
                  d={describeArc(startAngle, endAngle, radius)}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="opacity-30"
                />
                
                {/* Arc Foreground (clickable) */}
                <motion.path
                  d={describeArc(startAngle, endAngle, radius)}
                  fill="none"
                  stroke={stage.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all hover:opacity-80"
                  onClick={() => setSelectedStage(stage)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.15 }}
                />

                {/* Stage Icon & Label */}
                {(() => {
                  const midAngle = startAngle + arcAngle / 2;
                  const labelPos = polarToCartesian(midAngle, radius);
                  return (
                    <g 
                      className="cursor-pointer" 
                      onClick={() => setSelectedStage(stage)}
                    >
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-lg pointer-events-none select-none"
                      >
                        {stage.icon}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* Trajectory Dots - Global (outer or inner based on mode) */}
          {(filterMode === 'all' || filterMode === 'compare') && (
            stageConfigs.map((stage, stageIndex) => {
              const stageQueue = queue.filter(p => stage.statuses.includes(p.queue_status));
              const dots = generateDots(stageIndex, stageQueue.length, false);
              
              return dots.map((dot, dotIndex) => (
                <motion.circle
                  key={`global-${stage.key}-${dotIndex}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={4}
                  fill="hsl(var(--muted-foreground))"
                  className="opacity-40 cursor-pointer hover:opacity-70"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: stageIndex * 0.1 + dotIndex * 0.02 }}
                  onClick={() => {
                    if (stageQueue[dotIndex]) setSelectedPro(stageQueue[dotIndex]);
                  }}
                />
              ));
            })
          )}

          {/* Trajectory Dots - User (highlighted) */}
          {(filterMode === 'mine' || filterMode === 'compare') && userId && (
            stageConfigs.map((stage, stageIndex) => {
              const userStageQueue = queue.filter(
                p => stage.statuses.includes(p.queue_status) && p.pro_user_id === userId
              );
              const dots = generateDots(stageIndex, userStageQueue.length, true);
              
              return dots.map((dot, dotIndex) => (
                <motion.circle
                  key={`user-${stage.key}-${dotIndex}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={6}
                  fill="hsl(var(--primary))"
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: stageIndex * 0.1 + dotIndex * 0.02, type: 'spring' }}
                  onClick={() => {
                    if (userStageQueue[dotIndex]) setSelectedPro(userStageQueue[dotIndex]);
                  }}
                />
              ));
            })
          )}

          {/* Real do Ciclo Animation (R$ moving from Venda to Pago) */}
          <AnimatePresence>
            {showRealAnimation && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.text
                  fontSize="16"
                  fontWeight="bold"
                  fill="hsl(var(--primary))"
                  initial={{ 
                    x: polarToCartesian(3 * (arcAngle + gapAngle) + arcAngle / 2, radius).x,
                    y: polarToCartesian(3 * (arcAngle + gapAngle) + arcAngle / 2, radius).y
                  }}
                  animate={{
                    x: center,
                    y: center,
                  }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                >
                  💰
                </motion.text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Center Content */}
          <foreignObject x={center - 90} y={center - 60} width={180} height={120}>
            <div className="flex flex-col items-center justify-center h-full text-center px-2">
              <p className="text-xs text-muted-foreground leading-tight mb-2">
                A fila se move com impacto real, não com promessas.
              </p>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                R$ 1,00 por venda ativa o ciclo
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs h-6 px-2"
                onClick={triggerRealAnimation}
              >
                Ver Real do Ciclo ➡️
              </Button>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* External Stats Cards */}
      <div className="grid grid-cols-5 gap-2">
        {stageConfigs.map((stage) => {
          const counts = getStageCount(stage.key);
          return (
            <Card 
              key={stage.key}
              className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-${stage.key === 'paid' ? 'emerald' : 'border'}-200`}
              onClick={() => setSelectedStage(stage)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-lg mb-1">{stage.icon}</div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{stage.title}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-bold">{counts.global}</span>
                    <HelpTooltip content={stage.tooltip} />
                  </div>
                  {userId && counts.user > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      Meus: {counts.user}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stage Detail Modal */}
      <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedStage?.icon}</span>
              {selectedStage?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStage && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">O que acontece aqui?</p>
                    <p className="text-sm text-muted-foreground">{selectedStage.tooltip}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">PROs Globais</p>
                  <p className="text-2xl font-bold">{getStageCount(selectedStage.key).global}</p>
                </div>
                {userId && (
                  <div className="p-3 bg-emerald-100 rounded-lg text-center">
                    <p className="text-xs text-emerald-700 mb-1">Meus PROs</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {getStageCount(selectedStage.key).user}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 border border-dashed border-primary/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">💡 Curiosidade</p>
                <p className="text-sm">{selectedStage.curiosity}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PRO Detail Modal */}
      <Dialog open={!!selectedPro} onOpenChange={() => setSelectedPro(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Resumo do PRO
            </DialogTitle>
          </DialogHeader>
          
          {selectedPro && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Código</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {selectedPro.pro_code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ListOrdered className="w-4 h-4" />
                    <span className="text-xs">Posição na Fila</span>
                  </div>
                  <p className="text-xl font-bold">{selectedPro.queue_position}º</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Scale className="w-4 h-4" />
                    <span className="text-xs">Peso</span>
                  </div>
                  <p className="text-xl font-bold">{selectedPro.pro_weight_grams}g</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Participante</span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {selectedPro.user_name || 'Participante'}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Data de Entrada</span>
                  </div>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedPro.queue_created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Status Atual</p>
                <Badge variant="default" className={`text-sm ${
                  selectedPro.queue_status === 'paid' ? 'bg-emerald-500' : ''
                }`}>
                  {getStatusLabel(selectedPro.queue_status)}
                </Badge>
                {selectedPro.queue_status === 'paid' && selectedPro.queue_paid_at && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Pago em {format(new Date(selectedPro.queue_paid_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>

              <div className="text-center p-3 border border-dashed border-primary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Valor ao completar o ciclo
                </p>
                <p className="text-2xl font-bold text-emerald-600">R$ 2,00</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

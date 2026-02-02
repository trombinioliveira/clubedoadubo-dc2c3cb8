import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Coffee, 
  UtensilsCrossed, 
  ShoppingBag, 
  Footprints,
  Leaf,
  Recycle,
  Link2,
  Gift,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { useNavigate } from 'react-router-dom';

interface Mission {
  id: string;
  type: 'habit' | 'impact' | 'expansion' | 'special';
  icon: React.ElementType;
  emoji: string;
  title: string;
  description: string;
  reward: number;
  action: () => void;
}

interface ImpactMissionsSectionProps {
  onOpenPix: () => void;
  referralCode: string;
}

export function ImpactMissionsSection({ onOpenPix, referralCode }: ImpactMissionsSectionProps) {
  const navigate = useNavigate();
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
    const shareText = `Faça parte do Clube do Adubo! Transforme resíduo em impacto real. Use meu código: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clube do Adubo',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const allMissions: Mission[] = useMemo(() => [
    // Hábitos
    {
      id: 'coffee',
      type: 'habit',
      icon: Coffee,
      emoji: '☕',
      title: 'Café Consciente',
      description: 'Transforme o café do dia em impacto',
      reward: 1,
      action: onOpenPix,
    },
    {
      id: 'meal',
      type: 'habit',
      icon: UtensilsCrossed,
      emoji: '🍽',
      title: 'Refeição Urbana',
      description: 'Cada refeição pode mover o ciclo',
      reward: 2,
      action: onOpenPix,
    },
    {
      id: 'shopping',
      type: 'habit',
      icon: ShoppingBag,
      emoji: '🛒',
      title: 'Compra Local',
      description: 'Gaste local, impacte global',
      reward: 2,
      action: onOpenPix,
    },
    {
      id: 'mobility',
      type: 'habit',
      icon: Footprints,
      emoji: '🚶',
      title: 'Mobilidade Sustentável',
      description: 'Cada passo fortalece o ciclo',
      reward: 1,
      action: onOpenPix,
    },
    // Impacto
    {
      id: 'activate-waste',
      type: 'impact',
      icon: Leaf,
      emoji: '🌱',
      title: 'Ativar um Resíduo',
      description: 'Coloque resíduo no ciclo agora',
      reward: 3,
      action: onOpenPix,
    },
    {
      id: 'zero-waste',
      type: 'impact',
      icon: Recycle,
      emoji: '♻️',
      title: 'Dia sem Desperdício',
      description: 'Comprometa-se com um dia consciente',
      reward: 5,
      action: onOpenPix,
    },
    // Expansão
    {
      id: 'share-link',
      type: 'expansion',
      icon: Link2,
      emoji: '🔗',
      title: 'Compartilhar Link',
      description: 'Crie ondas de impacto',
      reward: 1,
      action: handleShare,
    },
    {
      id: 'advance-dream',
      type: 'expansion',
      icon: Gift,
      emoji: '🎁',
      title: 'Avançar no Sonho',
      description: 'Adicione PROs ao seu sonho atual',
      reward: 1,
      action: () => navigate('/dreams'),
    },
    // Especial
    {
      id: 'close-cycle',
      type: 'special',
      icon: Sparkles,
      emoji: '♻️',
      title: 'Feche o Ciclo Hoje',
      description: 'Ative assinatura ou compre adubo',
      reward: 3,
      action: () => navigate('/planos?tab=assinatura'),
    },
  ], [onOpenPix, referralCode, navigate]);

  // Get one mission of each type that hasn't been completed
  const getVisibleMissions = (): Mission[] => {
    const types: Array<'habit' | 'impact' | 'expansion'> = ['habit', 'impact', 'expansion'];
    const result: Mission[] = [];

    types.forEach(type => {
      const available = allMissions.filter(
        m => m.type === type && !completedMissions.has(m.id)
      );
      if (available.length > 0) {
        // Rotate through available missions based on activeIndex
        const index = activeIndex % available.length;
        result.push(available[index]);
      }
    });

    return result;
  };

  const visibleMissions = getVisibleMissions();

  const handleCompleteMission = (mission: Mission) => {
    mission.action();
    // Mark as completed for rotation (optional - remove if you want continuous rotation)
    // setCompletedMissions(prev => new Set([...prev, mission.id]));
  };

  const handleRotate = (direction: 'prev' | 'next') => {
    setActiveIndex(prev => direction === 'next' ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">
            Missões de Impacto 🌱
          </h2>
          <HelpTooltip 
            content="Complete missões diárias para ativar PROs e mover o ciclo. Cada ação gera impacto real."
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleRotate('prev')}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleRotate('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground px-1">
        Escolha uma ação e mova o ciclo hoje
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleMissions.map((mission, index) => {
            const Icon = mission.icon;
            const typeColors = {
              habit: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
              impact: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
              expansion: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
              special: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
            };
            const iconColors = {
              habit: 'text-amber-600 bg-amber-500/10',
              impact: 'text-emerald-600 bg-emerald-500/10',
              expansion: 'text-blue-600 bg-blue-500/10',
              special: 'text-purple-600 bg-purple-500/10',
            };

            return (
              <motion.div
                key={mission.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`bg-gradient-to-br ${typeColors[mission.type]} border cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => handleCompleteMission(mission)}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <div className={`w-14 h-14 rounded-2xl ${iconColors[mission.type]} flex items-center justify-center mx-auto`}>
                      <span className="text-2xl">{mission.emoji}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-foreground text-sm">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mission.description}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                      <span className="text-xs font-bold text-primary">
                        +{mission.reward} PRO{mission.reward > 1 ? 's' : ''}
                      </span>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteMission(mission);
                      }}
                    >
                      Completar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ImpactMissionsSectionProps {
  onOpenPix: () => void;
  referralCode: string;
}

export function ImpactMissionsSection({ onOpenPix, referralCode }: ImpactMissionsSectionProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Check if missions module is enabled
  const { data: missionsEnabled } = useQuery({
    queryKey: ['site-settings', 'missions_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'missions_enabled')
        .single();
      if (error) return true; // default enabled
      return (data?.value as any)?.enabled ?? true;
    },
  });

  // Fetch active missions from DB
  const { data: dbMissions = [] } = useQuery({
    queryKey: ['impact-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_missions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) return [];
      return data;
    },
    enabled: missionsEnabled !== false,
  });

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
    const shareText = `Faça parte do Clube do Adubo! Transforme resíduo em impacto real. Use meu código: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Clube do Adubo', text: shareText, url: shareUrl });
      } catch (err) { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  // Map DB missions to actionable items
  const missions = useMemo(() => {
    return dbMissions.map((m) => {
      let action = onOpenPix;
      if (m.title === 'Compartilhar Link') action = handleShare;
      else if (m.title === 'Avançar no Sonho') action = () => navigate('/dreams');
      else if (m.title === 'Feche o Ciclo Hoje') action = () => navigate('/planos?tab=assinatura');

      return { ...m, action };
    });
  }, [dbMissions, onOpenPix, referralCode, navigate]);

  // Don't render if module is disabled or no missions
  if (missionsEnabled === false || missions.length === 0) return null;

  // Get one mission of each type for the carousel
  const getVisibleMissions = () => {
    const types = ['habit', 'impact', 'expansion'];
    const result: typeof missions = [];
    types.forEach(type => {
      const available = missions.filter(m => m.type === type);
      if (available.length > 0) {
        result.push(available[activeIndex % available.length]);
      }
    });
    return result;
  };

  const visibleMissions = getVisibleMissions();

  const typeColors: Record<string, string> = {
    habit: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    impact: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    expansion: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
    special: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
  };
  const iconColors: Record<string, string> = {
    habit: 'text-amber-600 bg-amber-500/10',
    impact: 'text-emerald-600 bg-emerald-500/10',
    expansion: 'text-blue-600 bg-blue-500/10',
    special: 'text-purple-600 bg-purple-500/10',
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
            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setActiveIndex(prev => prev + 1)}
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
          {visibleMissions.map((mission, index) => (
            <motion.div
              key={mission.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`bg-gradient-to-br ${typeColors[mission.type] || typeColors.habit} border cursor-pointer hover:shadow-md transition-all`}
                onClick={() => mission.action()}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div className={`w-14 h-14 rounded-2xl ${iconColors[mission.type] || iconColors.habit} flex items-center justify-center mx-auto`}>
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
                      +{mission.reward_pros} PRO{mission.reward_pros > 1 ? 's' : ''}
                    </span>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      mission.action();
                    }}
                  >
                    Completar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

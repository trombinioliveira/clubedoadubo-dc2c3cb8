import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  TrendingUp, 
  Plus,
  Sparkles,
  Star
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { calculateLevelInfo } from '@/features/dreams/constants/levels';
import { motion } from 'framer-motion';

interface LevelProgressCardProps {
  totalPros: number;
  onOpenPix: () => void;
}

export function LevelProgressCard({ totalPros, onOpenPix }: LevelProgressCardProps) {
  const levelInfo = calculateLevelInfo(totalPros);
  
  const currentLevelConfig = levelInfo.levels.find(l => l.level === levelInfo.currentLevel);
  const nextLevelConfig = levelInfo.levels.find(l => l.level === levelInfo.currentLevel + 1);
  const progressPercent = currentLevelConfig?.progress || 0;
  const nextThreshold = nextLevelConfig?.threshold || levelInfo.nextLevelPros;

  const isCloseToLevel = levelInfo.prosToNextLevel <= 5 && levelInfo.prosToNextLevel > 0;
  const isMaxLevel = levelInfo.currentLevel >= 21;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Níveis e Progressão
          </div>
          <HelpTooltip 
            content="São 21 níveis de progresso. Cada PRO ativado te aproxima do próximo nível."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
              animate={isCloseToLevel ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: isCloseToLevel ? Infinity : 0, duration: 2 }}
            >
              <span className="text-2xl font-bold text-primary-foreground">
                {levelInfo.currentLevel}
              </span>
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">Nível atual</p>
              <p className="text-lg font-bold text-foreground">
                Nível {levelInfo.currentLevel} de 21
              </p>
            </div>
          </div>
          {!isMaxLevel && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">PROs para próximo</p>
              <p className="text-lg font-bold text-primary">
                {levelInfo.prosToNextLevel}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!isMaxLevel && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalPros} PROs</span>
              <span>{nextThreshold} PROs</span>
            </div>
          </div>
        )}

        {/* Close to level alert */}
        {isCloseToLevel && (
          <motion.div 
            className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Você está a <span className="font-bold">{levelInfo.prosToNextLevel} PRO{levelInfo.prosToNextLevel > 1 ? 's' : ''}</span> do próximo nível!
              </p>
            </div>
          </motion.div>
        )}

        {/* Max level celebration */}
        {isMaxLevel && (
          <motion.div 
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Star className="w-6 h-6 text-amber-500" />
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Você atingiu o nível máximo! 🏆
            </p>
          </motion.div>
        )}

        {/* CTA */}
        {!isMaxLevel && (
          <Button 
            onClick={onOpenPix}
            variant={isCloseToLevel ? 'default' : 'outline'}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCloseToLevel 
              ? `Adicionar ${levelInfo.prosToNextLevel} PRO${levelInfo.prosToNextLevel > 1 ? 's' : ''} → subir de nível`
              : 'Adicionar PROs'
            }
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

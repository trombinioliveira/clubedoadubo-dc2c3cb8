import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LevelBarsDisplay } from './LevelBarsDisplay';
import { calculateLevelInfo, formatPros, MAX_LEVEL, MAX_PROS } from '../constants/levels';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

interface AggregatedImpactCardProps {
  totalProsInDreams: number;
  totalDreams: number;
  completedDreams: number;
}

export function AggregatedImpactCard({
  totalProsInDreams,
  totalDreams,
  completedDreams,
}: AggregatedImpactCardProps) {
  const levelInfo = calculateLevelInfo(totalProsInDreams);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            Impacto dos Seus Sonhos
          </CardTitle>
          <HelpTooltip content="Aqui está o impacto combinado de todos os seus sonhos. Os níveis crescem conforme PROs válidos entram no seu ciclo." />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalDreams}</div>
            <div className="text-xs text-muted-foreground">Sonhos</div>
          </div>
          <div className="text-center border-x border-border">
            <div className="text-2xl font-bold text-primary">{formatPros(totalProsInDreams)}</div>
            <div className="text-xs text-muted-foreground">PROs Alocados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{completedDreams}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
        </div>

        {/* Level Bars */}
        <LevelBarsDisplay
          levels={levelInfo.levels}
          currentLevel={levelInfo.currentLevel}
          totalPros={totalProsInDreams}
          tooltipText={`Os níveis crescem conforme PROs válidos entram no seu ciclo. O nível ${MAX_LEVEL} é o limite máximo por CPF.`}
        />

        {/* Progress to next level */}
        {levelInfo.currentLevel < MAX_LEVEL && (
          <div className="p-3 bg-muted/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Próximo nível ({levelInfo.currentLevel + 1})
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {formatPros(levelInfo.prosToNextLevel)} PROs
            </span>
          </div>
        )}

        {levelInfo.currentLevel === MAX_LEVEL && (
          <div className="p-3 bg-emerald-500/10 rounded-xl text-center">
            <span className="text-sm font-medium text-emerald-600">
              🏆 Nível máximo atingido!
            </span>
          </div>
        )}

        {/* Maximum limit info */}
        <div className="text-center text-xs text-muted-foreground">
          Limite máximo: {formatPros(MAX_PROS)} PROs por CPF
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { calculateLevelInfo, formatPros, MAX_LEVEL } from '../constants/levels';
import { ArrowRight, Zap, Users, Sparkles, Trophy } from 'lucide-react';

interface NextLevelCardProps {
  totalPros: number;
  hasDreams: boolean;
  onAddPros: () => void;
  onCreateDream: () => void;
}

export function NextLevelCard({
  totalPros,
  hasDreams,
  onAddPros,
  onCreateDream,
}: NextLevelCardProps) {
  const levelInfo = calculateLevelInfo(totalPros);

  // Determina a ação recomendada
  const getRecommendedAction = () => {
    if (!hasDreams) {
      return {
        icon: Sparkles,
        text: 'Criar seu primeiro sonho',
        action: onCreateDream,
        buttonText: 'Criar sonho',
      };
    }
    if (levelInfo.prosToNextLevel <= 5) {
      return {
        icon: Zap,
        text: 'Adicionar PROs via PIX',
        action: onAddPros,
        buttonText: 'Adicionar PROs',
      };
    }
    if (levelInfo.currentLevel < 5) {
      return {
        icon: Zap,
        text: 'Adicionar PROs via PIX',
        action: onAddPros,
        buttonText: 'Adicionar PROs',
      };
    }
    return {
      icon: Users,
      text: 'Indicar alguém para acelerar',
      action: () => window.location.href = '/indicacoes',
      buttonText: 'Ver indicações',
    };
  };

  const recommendation = getRecommendedAction();
  const RecommendationIcon = recommendation.icon;

  if (levelInfo.currentLevel === MAX_LEVEL) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="py-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-600" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            Nível Máximo Alcançado!
          </h3>
          <p className="text-sm text-muted-foreground">
            Você atingiu o nível 21 — o impacto máximo por CPF.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Seu Próximo Nível</span>
            <HelpTooltip content="Essa é a ação mais curta para alcançar o próximo nível." />
          </div>
        </div>

        {/* Level Progress */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-foreground">{levelInfo.currentLevel}</span>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <span className="text-primary">{levelInfo.currentLevel + 1}</span>
          </div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{ 
                width: `${levelInfo.levels[levelInfo.currentLevel]?.progress || 0}%` 
              }}
            />
          </div>
        </div>

        {/* PROs to next level */}
        <p className="text-sm text-muted-foreground mb-4">
          Faltam <span className="font-semibold text-foreground">{formatPros(levelInfo.prosToNextLevel)} PROs</span> para o próximo nível
        </p>

        {/* Recommended Action */}
        <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RecommendationIcon className="w-4 h-4 text-primary" />
            <span className="text-sm">{recommendation.text}</span>
          </div>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={recommendation.action}
            className="shrink-0"
          >
            {recommendation.buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

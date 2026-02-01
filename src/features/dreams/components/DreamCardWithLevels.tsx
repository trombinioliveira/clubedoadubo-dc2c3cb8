import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { LevelBarsDisplay } from './LevelBarsDisplay';
import { calculateLevelInfo, getDreamStatus, formatPros } from '../constants/levels';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  Sparkles, 
  Target, 
  Package, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Pencil 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Dream {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  created_at: string;
  auto_reactivate?: boolean;
}

interface DreamCardWithLevelsProps {
  dream: Dream;
  allocatedPros: number;
  onAllocatePros: () => void;
  onToggleReactivation: (enabled: boolean) => void;
  onEditDream?: () => void;
}

export function DreamCardWithLevels({
  dream,
  allocatedPros,
  onAllocatePros,
  onToggleReactivation,
  onEditDream,
}: DreamCardWithLevelsProps) {
  const [showLevels, setShowLevels] = useState(false);
  const [isReactivating, setIsReactivating] = useState(dream.auto_reactivate || false);

  const progress = Math.min((dream.current_amount / dream.target_amount) * 100, 100);
  const remaining = Math.max(dream.target_amount - dream.current_amount, 0);
  const prosNeeded = Math.ceil(remaining / 2);
  const status = getDreamStatus(progress);
  const levelInfo = calculateLevelInfo(allocatedPros);

  const handleReactivationToggle = (checked: boolean) => {
    setIsReactivating(checked);
    onToggleReactivation(checked);
  };

  // Ícone baseado no progresso
  const getIcon = () => {
    if (progress >= 100) return '🎉';
    if (progress >= 75) return '🔥';
    if (progress >= 50) return '🌿';
    if (progress >= 25) return '🌱';
    return '💭';
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-elevated",
      dream.is_completed && "ring-2 ring-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
              dream.is_completed 
                ? "bg-emerald-100 dark:bg-emerald-900" 
                : "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900"
            )}>
              {getIcon()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground truncate">{dream.title}</h3>
              <p className="text-xs text-muted-foreground">
                Criado em {format(new Date(dream.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Badge 
              variant="outline" 
              className={cn("text-xs", status.color)}
            >
              {status.emoji} {status.label}
            </Badge>
            {onEditDream && !dream.is_completed && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEditDream}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta e Progresso Financeiro */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Meta: R$ {dream.target_amount.toFixed(2)}</span>
            <span className="font-semibold text-foreground">
              R$ {dream.current_amount.toFixed(2)}
            </span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">
              {progress.toFixed(0)}% concluído
            </span>
            {!dream.is_completed && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                ~{prosNeeded} PROs restantes
              </span>
            )}
          </div>
        </div>

        {/* PROs Alocados */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{allocatedPros} PROs alocados</span>
          </div>
          {!dream.is_completed && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAllocatePros}
              className="h-8"
            >
              + Alocar
            </Button>
          )}
        </div>

        {/* Bloco de Níveis (colapsável) */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowLevels(!showLevels)}
            className="w-full p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Níveis do Sonho</span>
              <HelpTooltip content="Os níveis do sonho seguem a mesma lógica do sistema global. Diferentes ações aceleram seu avanço nos mesmos níveis." />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Nível {levelInfo.currentLevel}
              </span>
              {showLevels ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>
          
          {showLevels && (
            <div className="p-3 border-t border-border">
              <LevelBarsDisplay
                levels={levelInfo.levels}
                currentLevel={levelInfo.currentLevel}
                totalPros={allocatedPros}
                compact
                showLabels={false}
              />
              <div className="mt-2 text-xs text-center text-muted-foreground">
                {formatPros(allocatedPros)} / 1M PROs
              </div>
            </div>
          )}
        </div>

        {/* Chave de Reativação */}
        {!dream.is_completed && (
          <div className="p-3 border border-dashed border-primary/30 rounded-lg bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn(
                  "w-4 h-4",
                  isReactivating ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium">Reativar PROs após cada ciclo</span>
                <HelpTooltip content="Enquanto este sonho não for concluído, cada ciclo pode gerar novos PROs automaticamente." />
              </div>
              <Switch
                checked={isReactivating}
                onCheckedChange={handleReactivationToggle}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Válido apenas até a conclusão deste sonho.
            </p>
          </div>
        )}

        {/* Celebração para sonhos concluídos */}
        {dream.is_completed && (
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 rounded-xl text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Parabéns! Você realizou esse sonho! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

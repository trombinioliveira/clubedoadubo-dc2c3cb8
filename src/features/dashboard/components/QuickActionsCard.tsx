import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Target, 
  Share2, 
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsCardProps {
  totalPros: number;
  hasActiveDream: boolean;
  prosToNextLevel: number;
  onOpenPix: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  variant: 'default' | 'outline' | 'secondary';
  priority: number;
}

export function QuickActionsCard({ 
  totalPros, 
  hasActiveDream, 
  prosToNextLevel,
  onOpenPix 
}: QuickActionsCardProps) {
  const navigate = useNavigate();

  // Gera lista de ações baseada no estado do usuário
  const generateActions = (): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Prioridade 1: Se não tem PROs
    if (totalPros === 0) {
      actions.push({
        id: 'first-pro',
        title: 'Adicionar 1 PRO agora',
        description: 'Entre na fila e comece seu ciclo',
        icon: Plus,
        action: onOpenPix,
        variant: 'default',
        priority: 1,
      });
    } else {
      // Prioridade 2: Se não tem sonho ativo
      if (!hasActiveDream) {
        actions.push({
          id: 'create-dream',
          title: 'Criar seu primeiro sonho',
          description: 'Dê um propósito aos seus PROs',
          icon: Target,
          action: () => navigate('/dreams'),
          variant: 'default',
          priority: 2,
        });
      }

      // Prioridade 3: Se está perto do próximo nível
      if (prosToNextLevel <= 5 && prosToNextLevel > 0) {
        actions.push({
          id: 'level-up',
          title: `Faltam ${prosToNextLevel} PROs para o próximo nível`,
          description: 'Compartilhe seu QR e acelere!',
          icon: TrendingUp,
          action: onOpenPix,
          variant: prosToNextLevel <= 2 ? 'default' : 'secondary',
          priority: 3,
        });
      }

      // Ação padrão: Adicionar mais PROs
      actions.push({
        id: 'add-pros',
        title: 'Adicionar mais PROs',
        description: 'Cada real é um passo à frente',
        icon: Plus,
        action: onOpenPix,
        variant: 'outline',
        priority: 4,
      });

      // Ação: Indicar pessoas
      actions.push({
        id: 'refer',
        title: 'Indicar alguém',
        description: 'Crie ondas de impacto',
        icon: Share2,
        action: () => navigate('/indicacoes'),
        variant: 'outline',
        priority: 5,
      });
    }

    // Ordena por prioridade e retorna no máximo 3
    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  const actions = generateActions();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Ações Rápidas de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start h-auto py-3 px-4"
              onClick={action.action}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  action.variant === 'default' 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-primary/10'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground' 
                      : 'text-primary'
                  }`} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className={`text-xs ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {action.description}
                  </p>
                </div>
                {index === 0 && (
                  <Zap className={`w-4 h-4 ${
                    action.variant === 'default' 
                      ? 'text-primary-foreground' 
                      : 'text-amber-500'
                  }`} />
                )}
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

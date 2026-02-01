import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  ChevronRight,
  Plus,
  Rocket,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface Dream {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface DreamsResumeCardProps {
  dreams: Dream[];
  onAddPros: (dreamId: string) => void;
}

export function DreamsResumeCard({ dreams, onAddPros }: DreamsResumeCardProps) {
  const navigate = useNavigate();

  // Filtra os 3 primeiros sonhos ativos (não concluídos)
  const activeDreams = dreams
    .filter(d => d.current_amount < d.target_amount)
    .slice(0, 3);

  const getStatus = (progress: number) => {
    if (progress >= 85) return { label: 'Quase lá! 🚀', color: 'text-amber-600' };
    if (progress >= 50) return { label: 'Crescendo', color: 'text-emerald-600' };
    if (progress > 0) return { label: 'Plantado', color: 'text-blue-600' };
    return { label: 'Novo', color: 'text-muted-foreground' };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Meus Sonhos
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/dreams')}
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeDreams.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-xl">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">
              Você ainda não tem sonhos ativos
            </p>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate('/dreams')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar primeiro sonho
            </Button>
          </div>
        ) : (
          <>
            {activeDreams.map((dream) => {
              const progress = Math.round((dream.current_amount / dream.target_amount) * 100);
              const remaining = dream.target_amount - dream.current_amount;
              const prosNeeded = Math.ceil(remaining / 2); // R$2 por PRO pago
              const status = getStatus(progress);

              return (
                <div 
                  key={dream.id}
                  className="p-4 bg-muted/30 rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{dream.title}</h4>
                      <p className={`text-xs ${status.color}`}>{status.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        R$ {dream.target_amount.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">meta</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress}% completo</span>
                      <span>Faltam R$ {remaining.toLocaleString('pt-BR')} (~{prosNeeded} PROs)</span>
                    </div>
                  </div>

                  {/* Sprint final */}
                  {progress >= 85 && (
                    <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg">
                      <Rocket className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-700">
                        Sprint final: faltam poucos PROs para realizar este sonho!
                      </span>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => onAddPros(dream.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar PROs a este sonho
                  </Button>
                </div>
              );
            })}

            {dreams.length > 3 && (
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={() => navigate('/dreams')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ver mais {dreams.length - 3} sonho{dreams.length - 3 > 1 ? 's' : ''}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

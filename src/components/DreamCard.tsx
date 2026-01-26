import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dream } from '@/types';
import { Target, Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DreamCardProps {
  dream: Dream;
}

export const DreamCard = ({ dream }: DreamCardProps) => {
  const progress = Math.min((dream.currentAmount / dream.targetAmount) * 100, 100);
  const isCompleted = dream.currentAmount >= dream.targetAmount;
  const remaining = Math.max(dream.targetAmount - dream.currentAmount, 0);
  const prosNeeded = Math.ceil(remaining / 2);

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-elevated",
      isCompleted && "ring-2 ring-status-paid"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isCompleted 
                ? "bg-status-paid" 
                : "bg-gradient-to-br from-amber-400 to-orange-500"
            )}>
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <Sparkles className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{dream.title}</h3>
              <p className="text-xs text-muted-foreground">
                Criado em {format(dream.createdAt, "dd 'de' MMM, yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          {isCompleted && (
            <span className="px-2 py-1 bg-status-paid/10 text-status-paid text-xs font-medium rounded-full">
              Concluído!
            </span>
          )}
        </div>

        {/* Progress section */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold text-foreground">{progress.toFixed(0)}%</span>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {dream.currentAmount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                de R$ {dream.targetAmount.toFixed(2)}
              </p>
            </div>
            
            {!isCompleted && (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  Faltam R$ {remaining.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Target className="w-3 h-3" />
                  ~{prosNeeded} PROs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Celebration for completed dreams */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-status-paid/10 rounded-xl text-center">
            <p className="text-sm text-status-paid font-medium">
              🎉 Parabéns! Você alcançou esse sonho!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

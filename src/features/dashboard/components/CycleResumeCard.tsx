import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  RefreshCw, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface CycleResumeCardProps {
  totalPros: number;
  fifoPosition: number | null;
  totalInQueue: number;
  estimatedDays: number;
}

export function CycleResumeCard({ 
  totalPros, 
  fifoPosition, 
  totalInQueue,
  estimatedDays 
}: CycleResumeCardProps) {
  const navigate = useNavigate();

  // Calcula percentual relativo na fila
  const percentAhead = fifoPosition && totalInQueue > 0
    ? Math.round(((totalInQueue - fifoPosition) / totalInQueue) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Resumo do Seu Ciclo
          </div>
          <HelpTooltip 
            content="A fila é global e justa (FIFO). Suas indicações criam ondas de impacto, mas não quebram a ordem da fila."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PROs ativos */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PROs ativos</p>
              <p className="text-xl font-bold text-foreground">{totalPros}</p>
            </div>
          </div>
        </div>

        {/* Posição na fila */}
        {fifoPosition !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Posição na Fila FIFO</span>
              <span className="font-semibold">#{fifoPosition.toLocaleString('pt-BR')}</span>
            </div>
            <Progress value={percentAhead} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Você está à frente de <span className="font-semibold text-primary">{percentAhead}%</span> da fila
            </p>
          </div>
        )}

        {/* Tempo estimado */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tempo estimado do ciclo</p>
              <p className="text-sm font-medium">
                {estimatedDays > 0 ? `~${estimatedDays} dias` : 'Calculando...'}
              </p>
            </div>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>

        {/* Botão Ver Fila */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate('/fifo')}
        >
          Ver Fila FIFO
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

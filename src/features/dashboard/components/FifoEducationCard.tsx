import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  Users, 
  Waves,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FifoEducationCardProps {
  fifoPosition: number | null;
  totalInQueue: number;
  estimatedDays: number;
}

export function FifoEducationCard({ 
  fifoPosition, 
  totalInQueue,
  estimatedDays
}: FifoEducationCardProps) {
  const navigate = useNavigate();

  const percentAhead = fifoPosition && totalInQueue > 0
    ? Math.round(((totalInQueue - fifoPosition) / totalInQueue) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Waves className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                💡 Fila justa, ondas de impacto
                <HelpTooltip 
                  content="A fila FIFO é única e global. Quem ativou primeiro recebe primeiro. Suas indicações criam ondas de impacto, mas nunca alteram a ordem."
                  side="bottom"
                />
              </h3>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground">
          A fila FIFO é <span className="font-semibold text-foreground">única e global</span>. 
          Suas indicações criam{' '}
          <span className="font-semibold text-primary">ondas de impacto</span>, 
          mas nunca alteram a ordem da fila.
        </p>

        {/* Position indicator (if user has PROs) */}
        {fifoPosition !== null && (
          <motion.div 
            className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Posição #{fifoPosition.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  À frente de {percentAhead}% da fila
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">
                ~{estimatedDays} dias
              </p>
              <p className="text-xs text-muted-foreground">estimado</p>
            </div>
          </motion.div>
        )}

        {/* How it works - simplified */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Quando o adubo é vendido, quem está à frente recebe primeiro. 
            Simples e transparente.
          </p>
        </div>

        {/* View queue button */}
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

import React from 'react';
import { Link } from 'react-router-dom';
import { FifoQueue } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QueueIcon } from './icons/CycleIcons';
import { TrendingUp, ExternalLink } from 'lucide-react';

interface FifoQueueCardProps {
  queue: FifoQueue;
}

export const FifoQueueCard = ({ queue }: FifoQueueCardProps) => {
  const progressPercent = ((queue.totalInQueue - queue.position) / queue.totalInQueue) * 100;

  return (
    <Card className="overflow-hidden shadow-elevated">
      <CardHeader className="earth-gradient text-primary-foreground pb-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Sua posição na fila</CardTitle>
          <QueueIcon className="w-6 h-6" />
        </div>
      </CardHeader>
      <CardContent className="-mt-4 relative">
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
          {/* Position display */}
          <div className="text-center mb-6">
            <p className="text-5xl font-extrabold text-primary">{queue.position}</p>
            <p className="text-muted-foreground text-sm mt-1">de {queue.totalInQueue.toLocaleString()} na fila</p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full earth-gradient rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-2 p-3 bg-accent/20 rounded-lg mb-4">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
            <p className="font-semibold">
              Faltam <span className="text-secondary">{queue.salesUntilPayment} vendas</span> para seu pagamento
            </p>
          </div>

          {/* Link to full queue */}
          <Link to="/fifo">
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver fila completa
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

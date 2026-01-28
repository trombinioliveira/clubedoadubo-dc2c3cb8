import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QueueIcon } from './icons/CycleIcons';
import { ExternalLink, Package, Factory, Leaf, ShoppingBag, DollarSign } from 'lucide-react';
import { getStatusLabel } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProsQueueCardProps {
  pros: PRO[];
}

type ProStatus = 'processing' | 'ready' | 'sold' | 'paid';

const stageConfig = [
  { 
    id: 1, 
    label: 'Coleta', 
    status: 'collected' as const,
    icon: Package,
    color: 'bg-muted text-muted-foreground'
  },
  { 
    id: 2, 
    label: 'Processamento', 
    status: 'processing' as ProStatus,
    icon: Factory,
    color: 'bg-amber-500 text-white'
  },
  { 
    id: 3, 
    label: 'Produção', 
    status: 'ready' as ProStatus,
    icon: Leaf,
    color: 'bg-green-500 text-white'
  },
  { 
    id: 4, 
    label: 'Venda', 
    status: 'sold' as ProStatus,
    icon: ShoppingBag,
    color: 'bg-blue-500 text-white'
  },
  { 
    id: 'R$', 
    label: 'Pago', 
    status: 'paid' as ProStatus,
    icon: DollarSign,
    color: 'bg-emerald-600 text-white'
  },
];

const getStageFromStatus = (status: ProStatus): number => {
  const stages: Record<ProStatus, number> = {
    processing: 2,
    ready: 3,
    sold: 4,
    paid: 5
  };
  return stages[status] || 1;
};

export const UserProsQueueCard = ({ pros }: UserProsQueueCardProps) => {
  const [selectedPro, setSelectedPro] = useState<PRO | null>(null);

  // Group PROs by their current stage
  const groupedPros = stageConfig.reduce((acc, stage, index) => {
    const stageNumber = typeof stage.id === 'number' ? stage.id : 5;
    acc[stageNumber] = pros.filter(pro => getStageFromStatus(pro.status) === stageNumber);
    return acc;
  }, {} as Record<number, PRO[]>);

  const totalPros = pros.length;
  const paidCount = groupedPros[5]?.length || 0;
  const progressPercent = totalPros > 0 ? (paidCount / totalPros) * 100 : 0;

  return (
    <Card className="overflow-hidden shadow-elevated">
      <CardHeader className="earth-gradient text-primary-foreground pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Seus Resíduos na Fila</CardTitle>
          <QueueIcon className="w-6 h-6" />
        </div>
        <p className="text-sm opacity-90">
          {totalPros} PROs • {paidCount} pagos ({progressPercent.toFixed(0)}%)
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Mini columnar view */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {stageConfig.map((stage, index) => {
            const stageNumber = typeof stage.id === 'number' ? stage.id : 5;
            const stagePros = groupedPros[stageNumber] || [];
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="text-center">
                {/* Stage header */}
                <div className={`rounded-t-lg py-1 px-1 ${stage.color}`}>
                  <Icon className="w-3 h-3 mx-auto mb-0.5" />
                  <span className="text-[10px] font-medium block truncate">{stage.label}</span>
                </div>
                
                {/* PROs in this stage */}
                <div className="bg-muted/30 rounded-b-lg p-1 min-h-[60px] max-h-[100px] overflow-y-auto space-y-1">
                  {stagePros.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground py-2">-</div>
                  ) : (
                    stagePros.map((pro) => (
                      <button
                        key={pro.id}
                        onClick={() => setSelectedPro(pro)}
                        className="w-full text-[9px] font-mono bg-card border border-border rounded px-1 py-0.5 hover:bg-accent transition-colors truncate"
                        title={pro.code}
                      >
                        #{pro.fifoPosition}
                      </button>
                    ))
                  )}
                </div>
                
                {/* Count badge */}
                <div className="text-[10px] font-medium text-muted-foreground mt-1">
                  {stagePros.length}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full earth-gradient rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Progresso: {paidCount} de {totalPros} PROs pagos
          </p>
        </div>

        {/* Link to full queue */}
        <Link to="/fifo">
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver fila global completa
          </Button>
        </Link>
      </CardContent>

      {/* PRO Detail Modal */}
      <Dialog open={!!selectedPro} onOpenChange={() => setSelectedPro(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Detalhes do PRO
            </DialogTitle>
          </DialogHeader>
          
          {selectedPro && (
            <div className="space-y-4">
              {/* Code and position */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Código</p>
                <p className="text-lg font-mono font-bold text-primary">{selectedPro.code}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Posição na fila: <span className="font-bold">#{selectedPro.fifoPosition}</span>
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                <span className="text-sm font-medium">Status atual</span>
                <span className="text-sm font-bold text-primary">
                  {getStatusLabel(selectedPro.status)}
                </span>
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Peso</span>
                <span className="font-medium">{selectedPro.weight}g</span>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Histórico</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criado</span>
                    <span>{format(selectedPro.createdAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  {selectedPro.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processado</span>
                      <span>{format(selectedPro.processedAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  )}
                  {selectedPro.soldAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendido</span>
                      <span>{format(selectedPro.soldAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  )}
                  {selectedPro.paidAt && (
                    <div className="flex justify-between text-primary font-medium">
                      <span>Pago</span>
                      <span>{format(selectedPro.paidAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
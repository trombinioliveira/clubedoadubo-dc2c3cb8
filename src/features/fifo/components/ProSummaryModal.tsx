import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ListOrdered, Scale, User, Calendar, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProStatus = 'pending' | 'processing' | 'ready' | 'sold' | 'paid';

interface FifoQueuePublic {
  queue_id: string;
  queue_position: number;
  queue_status: ProStatus;
  queue_created_at: string;
  queue_paid_at: string | null;
  pro_id: string;
  pro_code: string;
  pro_weight_grams: number;
  pro_status: ProStatus;
  pro_created_at: string;
  pro_user_id: string | null;
  user_name: string;
}

interface ProSummaryModalProps {
  entry: FifoQueuePublic | null;
  onClose: () => void;
}

const stageConfig = [
  { key: 'pending', label: '1', title: 'Coleta' },
  { key: 'processing', label: '2', title: 'Processamento' },
  { key: 'ready', label: '3', title: 'Produção' },
  { key: 'sold', label: '4', title: 'Venda' },
  { key: 'paid', label: 'R$', title: 'Pago' },
];

const getStatusLabel = (status: ProStatus) => {
  const labels: Record<ProStatus, string> = {
    pending: 'Aguardando Coleta',
    processing: 'Em Processamento',
    ready: 'Pronto (Adubo)',
    sold: 'Vendido',
    paid: 'Pago'
  };
  return labels[status];
};

const getStageIndex = (status: ProStatus): number => {
  const stages: Record<ProStatus, number> = {
    pending: 1,
    processing: 2,
    ready: 3,
    sold: 4,
    paid: 5
  };
  return stages[status];
};

export function ProSummaryModal({ entry, onClose }: ProSummaryModalProps) {
  if (!entry) return null;

  const currentStage = getStageIndex(entry.queue_status);

  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Resumo do PRO
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code display */}
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Código único</p>
            <p className="text-2xl font-bold font-mono text-primary">
              {entry.pro_code}
            </p>
          </div>

          {/* Stage progress */}
          <div className="flex items-center justify-center gap-1">
            {stageConfig.map((stage, idx) => {
              const stageNum = idx + 1;
              const isActive = stageNum <= currentStage;
              const isPaid = stage.key === 'paid' && entry.queue_status === 'paid';

              return (
                <React.Fragment key={stage.key}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    isPaid
                      ? 'bg-emerald-500 text-white'
                      : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {stage.label}
                  </div>
                  {idx < stageConfig.length - 1 && (
                    <div className={`h-0.5 w-3 ${
                      stageNum < currentStage ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ListOrdered className="w-4 h-4" />
                <span className="text-xs">Posição na Fila</span>
              </div>
              <p className="text-xl font-bold">{entry.queue_position}º</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Scale className="w-4 h-4" />
                <span className="text-xs">Peso</span>
              </div>
              <p className="text-xl font-bold">{entry.pro_weight_grams}g</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs">Participante</span>
              </div>
              <p className="text-sm font-medium truncate">
                {entry.user_name || 'Participante'}
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Data de Entrada</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(entry.queue_created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Current status */}
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Status Atual</p>
            <Badge variant="default" className={`text-sm ${
              entry.queue_status === 'paid' ? 'bg-emerald-500' : ''
            }`}>
              {getStatusLabel(entry.queue_status)}
            </Badge>
            {entry.queue_status === 'paid' && entry.queue_paid_at && (
              <p className="text-xs text-emerald-600 mt-2">
                Pago em {format(new Date(entry.queue_paid_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            )}
          </div>

          {/* Value on completion */}
          <div className="text-center p-3 border border-dashed border-primary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Valor ao completar o ciclo
            </p>
            <p className="text-2xl font-bold text-emerald-600">R$ 2,00</p>
          </div>

          {/* Educational note */}
          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              💡 Este PRO só gera valor quando o ciclo é concluído.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              O PRO entra na fila. O Real do Ciclo move a fila.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown } from 'lucide-react';

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

interface FifoQueueColumnsProps {
  queue: FifoQueuePublic[];
  userId: string | undefined;
  onSelectEntry: (entry: FifoQueuePublic) => void;
  isLoading: boolean;
}

const stageConfig = [
  { key: 'pending', label: '1', title: 'Coleta', icon: '📍', statuses: ['pending'] as ProStatus[] },
  { key: 'processing', label: '2', title: 'Processamento', icon: '🏭', statuses: ['processing'] as ProStatus[] },
  { key: 'ready', label: '3', title: 'Produção', icon: '🌾', statuses: ['ready'] as ProStatus[] },
  { key: 'sold', label: '4', title: 'Venda', icon: '📦', statuses: ['sold'] as ProStatus[] },
  { key: 'paid', label: 'R$', title: 'Pago', icon: '💰', statuses: ['paid'] as ProStatus[] },
];

export function FifoQueueColumns({ queue, userId, onSelectEntry, isLoading }: FifoQueueColumnsProps) {
  const getEntriesByStatus = (statuses: ProStatus[]) => {
    return queue.filter(entry => statuses.includes(entry.queue_status));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2 md:gap-4">
      {stageConfig.map((stage, stageIdx) => {
        const entries = getEntriesByStatus(stage.statuses);
        const count = entries.length;
        const isPaidColumn = stage.key === 'paid';
        const isPendingColumn = stage.key === 'pending';

        return (
          <div key={stage.key} className="flex flex-col">
            {/* Column Header */}
            <Card className={`mb-2 ${
              isPaidColumn 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : isPendingColumn
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-primary/5 border-primary/20'
            }`}>
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-1 ${
                  isPaidColumn 
                    ? 'bg-emerald-500 text-white' 
                    : isPendingColumn
                      ? 'bg-amber-500 text-white'
                      : 'bg-primary text-primary-foreground'
                }`}>
                  {stage.label}
                </div>
                <p className="text-xs font-medium text-foreground">{stage.icon} {stage.title}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {count}
                </Badge>
              </CardContent>
            </Card>

            {stageIdx < 4 && (
              <div className="flex justify-center mb-2">
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 space-y-1 min-h-[200px]">
              {entries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-xs">Nenhum PRO</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {entries
                    .sort((a, b) => a.queue_position - b.queue_position)
                    .map((entry) => {
                    const isUserPro = userId && entry.pro_user_id === userId;

                    return (
                      <button
                        key={entry.queue_id}
                        onClick={() => onSelectEntry(entry)}
                        className={`w-full p-2 rounded-lg text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                          isUserPro 
                            ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/20' 
                            : isPaidColumn
                              ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : isPendingColumn
                                ? 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-card border border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-primary truncate">
                            PRO #{entry.queue_position}
                          </span>
                          {isUserPro && (
                            <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
                              Seu
                            </Badge>
                          )}
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground truncate mt-0.5">
                          {entry.pro_code}
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          {entry.user_name?.split(' ')[0] || 'Participante'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

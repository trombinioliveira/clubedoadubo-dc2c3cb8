import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ListOrdered, 
  Search,
  User,
  Calendar,
  Scale,
  Leaf,
  ArrowDown,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProStatus = 'pending' | 'processing' | 'ready' | 'sold' | 'paid';

// Uses the secure get_fifo_queue_public RPC function that hides sensitive user data
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
  pro_user_id: string | null; // null for other users' PROs (privacy)
  user_name: string; // 'Participante' for other users' PROs
}

const stageConfig = [
  { key: 'pending', label: '1', title: 'Coleta', icon: '📍', statuses: ['pending'] as ProStatus[] },
  { key: 'processing', label: '2', title: 'Processamento', icon: '🏭', statuses: ['processing'] as ProStatus[] },
  { key: 'ready', label: '3', title: 'Produção', icon: '🌾', statuses: ['ready'] as ProStatus[] },
  { key: 'sold', label: '4', title: 'Venda', icon: '📦', statuses: ['sold'] as ProStatus[] },
  { key: 'paid', label: 'R$', title: 'Pago', icon: '💰', statuses: ['paid'] as ProStatus[] },
];

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoQueuePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FifoQueuePublic | null>(null);
  const [stats, setStats] = useState({
    totalInQueue: 0,
    pending: 0,
    processing: 0,
    ready: 0,
    sold: 0,
    paid: 0
  });

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const fetchQueue = async () => {
    setIsLoading(true);

    // Use the secure RPC function that hides sensitive user data
    const { data: queueData, error: queueError } = await supabase
      .rpc('get_fifo_queue_public');

    if (queueError) {
      console.error('Error fetching queue:', queueError);
      setIsLoading(false);
      return;
    }

    const typedQueue = (queueData || []) as unknown as FifoQueuePublic[];

    const pending = typedQueue.filter(q => q.queue_status === 'pending').length;
    const processing = typedQueue.filter(q => q.queue_status === 'processing').length;
    const ready = typedQueue.filter(q => q.queue_status === 'ready').length;
    const sold = typedQueue.filter(q => q.queue_status === 'sold').length;
    const paid = typedQueue.filter(q => q.queue_status === 'paid').length;

    setQueue(typedQueue);
    setStats({
      totalInQueue: typedQueue.length,
      pending,
      processing,
      ready,
      sold,
      paid
    });
    setIsLoading(false);
  };

  const filteredQueue = queue.filter(entry => {
    const matchesSearch = 
      entry.pro_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMineFilter = !showOnlyMine || (user && entry.pro_user_id === user.id);
    
    return matchesSearch && matchesMineFilter;
  });

  // Group entries by status for column display
  const getEntriesByStatus = (statuses: ProStatus[]) => {
    return filteredQueue.filter(entry => statuses.includes(entry.queue_status));
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-primary-foreground" />
            </div>
            Fila FIFO
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe os resíduos passando por cada etapa. Clique em um PRO para ver detalhes.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showOnlyMine ? "default" : "outline"}
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            className="gap-2"
            disabled={!user}
          >
            <Filter className="w-4 h-4" />
            Meus PROs
          </Button>
        </div>

        {/* Column-based Queue Visualization */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
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

                  {/* Arrow indicator */}
                  {stageIdx < 4 && (
                    <div className="flex justify-center mb-2">
                      <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Column Content - PRO items */}
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
                          const isUserPro = user && entry.pro_user_id === user.id;

                          return (
                            <button
                              key={entry.queue_id}
                              onClick={() => setSelectedEntry(entry)}
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
                                  {entry.pro_code?.slice(-6)}
                                </span>
                                {isUserPro && (
                                  <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
                                    Seu
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                                {entry.user_name?.split(' ')[0] || 'Participante'}
                              </p>
                              <p className="text-[8px] text-muted-foreground">
                                #{entry.queue_position}
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
        )}

        {/* Footer Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Primeiro a entrar na fila, primeiro a receber. Cada PRO = 100g de resíduo = R$ 2,00 ao final do ciclo.
        </p>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Resumo do PRO
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              {/* PRO Code */}
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Código</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {selectedEntry.pro_code}
                </p>
              </div>

              {/* Status Visual */}
              <div className="flex items-center justify-center gap-1">
                {stageConfig.slice(1).map((stage, idx) => {
                  const stageNum = idx + 2;
                  const currentStage = getStageIndex(selectedEntry.queue_status);
                  const isActive = stageNum <= currentStage;
                  const isPaid = stage.key === 'paid' && selectedEntry.queue_status === 'paid';

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
                      {idx < 3 && (
                        <div className={`h-0.5 w-3 ${
                          stageNum < currentStage ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ListOrdered className="w-4 h-4" />
                    <span className="text-xs">Posição na Fila</span>
                  </div>
                  <p className="text-xl font-bold">{selectedEntry.queue_position}º</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Scale className="w-4 h-4" />
                    <span className="text-xs">Peso</span>
                  </div>
                  <p className="text-xl font-bold">{selectedEntry.pro_weight_grams}g</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Participante</span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {selectedEntry.user_name || 'Participante'}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Data de Entrada</span>
                  </div>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedEntry.queue_created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Status Atual</p>
                <Badge variant="default" className={`text-sm ${
                  selectedEntry.queue_status === 'paid' ? 'bg-emerald-500' : ''
                }`}>
                  {getStatusLabel(selectedEntry.queue_status)}
                </Badge>
                {selectedEntry.queue_status === 'paid' && selectedEntry.queue_paid_at && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Pago em {format(new Date(selectedEntry.queue_paid_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>

              {/* Value Info */}
              <div className="text-center p-3 border border-dashed border-primary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Valor ao completar o ciclo
                </p>
                <p className="text-2xl font-bold text-emerald-600">R$ 2,00</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

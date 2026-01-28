import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ListOrdered, 
  Search,
  ChevronRight,
  User,
  Calendar,
  Scale,
  Leaf,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProStatus = 'processing' | 'ready' | 'sold' | 'paid';

interface FifoEntry {
  id: string;
  position: number;
  status: ProStatus;
  created_at: string;
  paid_at: string | null;
  pro: {
    id: string;
    code: string;
    user_id: string;
    status: ProStatus;
    weight_grams: number;
    created_at: string;
    processed_at: string | null;
    sold_at: string | null;
    paid_at: string | null;
  };
}

interface Profile {
  user_id: string;
  full_name: string;
  referral_code: string | null;
}

// Map status to stage index (1-4, 5 = result)
const getStageIndex = (status: ProStatus): number => {
  const stages: Record<ProStatus, number> = {
    processing: 2,
    ready: 3,
    sold: 4,
    paid: 5
  };
  return stages[status];
};

const stageLabels = ['1', '2', '3', '4', 'R$'];
const stageDescriptions = ['Coleta', 'Processamento', 'Produção', 'Venda', 'Pago'];

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<FifoEntry | null>(null);
  const [stats, setStats] = useState({
    totalInQueue: 0,
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

    const { data: queueData, error: queueError } = await supabase
      .from('fifo_queue')
      .select(`
        *,
        pro:pros(*)
      `)
      .order('position', { ascending: true });

    if (queueError) {
      console.error('Error fetching queue:', queueError);
      setIsLoading(false);
      return;
    }

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, referral_code');

    const profilesMap: Record<string, Profile> = {};
    profilesData?.forEach((p: Profile) => {
      profilesMap[p.user_id] = p;
    });

    const typedQueue = (queueData || []) as FifoEntry[];

    const processing = typedQueue.filter(q => q.status === 'processing').length;
    const ready = typedQueue.filter(q => q.status === 'ready').length;
    const sold = typedQueue.filter(q => q.status === 'sold').length;
    const paid = typedQueue.filter(q => q.status === 'paid').length;

    setQueue(typedQueue);
    setProfiles(profilesMap);
    setStats({
      totalInQueue: typedQueue.length,
      processing,
      ready,
      sold,
      paid
    });
    setIsLoading(false);
  };

  const filteredQueue = queue.filter(entry => {
    const profile = profiles[entry.pro?.user_id];
    const matchesSearch = 
      entry.pro?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.referral_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusLabel = (status: ProStatus) => {
    const labels: Record<ProStatus, string> = {
      processing: 'Em Processamento',
      ready: 'Pronto (Adubo)',
      sold: 'Vendido',
      paid: 'Pago'
    };
    return labels[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-primary-foreground" />
            </div>
            Fila FIFO
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe cada resíduo percorrendo as etapas. Clique no número para ver detalhes.
          </p>
        </div>

        {/* Stage Legend - Compact */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-1 sm:gap-4">
              {stageLabels.map((label, idx) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      idx === 4 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {label}
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {stageDescriptions[idx]}
                    </span>
                  </div>
                  {idx < 4 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { label: 'Total', value: stats.totalInQueue, color: 'bg-muted' },
            { label: 'Etapa 2', value: stats.processing, color: 'bg-primary/20' },
            { label: 'Etapa 3', value: stats.ready, color: 'bg-primary/40' },
            { label: 'Etapa 4', value: stats.sold, color: 'bg-primary/60' },
            { label: 'Pagos', value: stats.paid, color: 'bg-emerald-500/20' },
          ].map((stat) => (
            <Card key={stat.label} className={stat.color}>
              <CardContent className="py-3 px-2 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Queue Visual - Compact Grid */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 bg-muted/50">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Fila de Processamento</span>
              <Badge variant="outline">{filteredQueue.length} PROs</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="py-12 text-center">
                <ListOrdered className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">
                  {searchTerm ? 'Nenhum PRO encontrado' : 'Nenhum PRO na fila ainda'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredQueue.map((entry) => {
                  const profile = profiles[entry.pro?.user_id];
                  const isUserPro = user && entry.pro?.user_id === user.id;
                  const currentStage = getStageIndex(entry.status);

                  return (
                    <div 
                      key={entry.id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted/50 ${
                        isUserPro ? 'bg-primary/5 border-l-4 border-l-primary' : 'bg-background border border-border'
                      }`}
                    >
                      {/* Position */}
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
                        {entry.position}
                      </div>

                      {/* Stage Progress */}
                      <div className="flex items-center gap-1 flex-1">
                        {stageLabels.map((label, idx) => {
                          const stageNum = idx + 1;
                          const isActive = stageNum <= currentStage;
                          const isCurrent = stageNum === currentStage;
                          const isPaid = idx === 4 && entry.status === 'paid';

                          return (
                            <React.Fragment key={label}>
                              <button
                                onClick={() => setSelectedEntry(entry)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all cursor-pointer hover:scale-110 ${
                                  isPaid
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : isActive
                                      ? isCurrent
                                        ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                                        : 'bg-primary/80 text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                                title={`Clique para ver detalhes - ${entry.pro?.code}`}
                              >
                                {label}
                              </button>
                              {idx < 4 && (
                                <div className={`h-0.5 w-2 sm:w-4 ${
                                  stageNum < currentStage ? 'bg-primary' : 'bg-muted'
                                }`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* PRO Info */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-mono text-primary font-semibold">
                            {entry.pro?.code}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {profile?.full_name?.split(' ')[0] || 'Participante'}
                          </p>
                        </div>
                        {isUserPro && (
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            Seu
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
                  {selectedEntry.pro?.code}
                </p>
              </div>

              {/* Status Visual */}
              <div className="flex items-center justify-center gap-1">
                {stageLabels.map((label, idx) => {
                  const stageNum = idx + 1;
                  const currentStage = getStageIndex(selectedEntry.status);
                  const isActive = stageNum <= currentStage;
                  const isPaid = idx === 4 && selectedEntry.status === 'paid';

                  return (
                    <React.Fragment key={label}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        isPaid
                          ? 'bg-emerald-500 text-white'
                          : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {label}
                      </div>
                      {idx < 4 && (
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
                  <p className="text-xl font-bold">{selectedEntry.position}º</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Scale className="w-4 h-4" />
                    <span className="text-xs">Peso</span>
                  </div>
                  <p className="text-xl font-bold">{selectedEntry.pro?.weight_grams}g</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Participante</span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {profiles[selectedEntry.pro?.user_id]?.full_name || 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Data de Entrada</span>
                  </div>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedEntry.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Status Atual</p>
                <Badge variant="default" className={`text-sm ${
                  selectedEntry.status === 'paid' ? 'bg-emerald-500' : ''
                }`}>
                  {getStatusLabel(selectedEntry.status)}
                </Badge>
                {selectedEntry.status === 'paid' && selectedEntry.paid_at && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Pago em {format(new Date(selectedEntry.paid_at), "dd/MM/yyyy", { locale: ptBR })}
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

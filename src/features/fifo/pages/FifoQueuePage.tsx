import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ListOrdered, 
  Search,
  Truck,
  Factory,
  Leaf,
  Package,
  DollarSign,
  Check,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  };
}

interface Profile {
  user_id: string;
  full_name: string;
  referral_code: string | null;
}

// Define stage progression - which stages are complete for each status
const statusStages = {
  processing: { coleta: true, processamento: true, producao: false, venda: false, pago: false },
  ready: { coleta: true, processamento: true, producao: true, venda: false, pago: false },
  sold: { coleta: true, processamento: true, producao: true, venda: true, pago: false },
  paid: { coleta: true, processamento: true, producao: true, venda: true, pago: true }
};

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const StageIcon = ({ completed, icon: Icon, label }: { completed: boolean; icon: React.ElementType; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        completed 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>
      <span className={`text-[10px] font-medium ${completed ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-primary-foreground" />
            </div>
            Fila FIFO - Visão Simplificada
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o fluxo completo de cada resíduo: da coleta ao pagamento. Primeiro a entrar, primeiro a receber.
          </p>
        </div>

        {/* Stats Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>Processamento de Resíduo Orgânico</span>
              <Badge variant="secondary" className="ml-auto">
                {stats.totalInQueue} PROs na fila
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stage Legend */}
            <div className="flex items-center justify-between gap-2 p-4 bg-muted/50 rounded-lg flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">📍 Etapa 1</p>
                  <p className="text-xs text-muted-foreground">Coleta do resíduo</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">📍 Etapa 2</p>
                  <p className="text-xs text-muted-foreground">Processamento</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">📍 Etapa 3</p>
                  <p className="text-xs text-muted-foreground">Produção do adubo</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">📍 Etapa 4</p>
                  <p className="text-xs text-muted-foreground">Vendido</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-600">🔄 Resultado</p>
                  <p className="text-xs text-muted-foreground">Pago R$ 2,00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Nº PRO, ID ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Queue Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
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
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px] text-center font-bold">Posição</TableHead>
                    <TableHead className="font-bold">Nº PRO</TableHead>
                    <TableHead className="font-bold">ID PRO</TableHead>
                    <TableHead className="font-bold">Participante</TableHead>
                    <TableHead className="text-center font-bold w-[100px]">
                      <div className="flex flex-col items-center">
                        <Truck className="w-4 h-4 mb-1" />
                        <span className="text-xs">Coleta</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold w-[100px]">
                      <div className="flex flex-col items-center">
                        <Factory className="w-4 h-4 mb-1" />
                        <span className="text-xs">Processamento</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold w-[100px]">
                      <div className="flex flex-col items-center">
                        <Leaf className="w-4 h-4 mb-1" />
                        <span className="text-xs">100% Pronto</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold w-[100px]">
                      <div className="flex flex-col items-center">
                        <Package className="w-4 h-4 mb-1" />
                        <span className="text-xs">Vendido</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold w-[100px]">
                      <div className="flex flex-col items-center">
                        <DollarSign className="w-4 h-4 mb-1 text-emerald-600" />
                        <span className="text-xs text-emerald-600">Pago</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((entry) => {
                    const profile = profiles[entry.pro?.user_id];
                    const isUserPro = user && entry.pro?.user_id === user.id;
                    const stages = statusStages[entry.status];

                    return (
                      <TableRow 
                        key={entry.id}
                        className={isUserPro ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
                      >
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-foreground">{entry.position}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{entry.pro?.code}</span>
                            {isUserPro && (
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                Seu
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {entry.pro?.id?.substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {profile?.full_name || 'Participante'}
                              </p>
                              {profile?.referral_code && (
                                <p className="text-xs text-muted-foreground">
                                  ID: {profile.referral_code}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        {/* Stage Columns */}
                        <TableCell className="text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            stages.coleta ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {stages.coleta ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            stages.processamento ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {stages.processamento ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            stages.producao ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {stages.producao ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            stages.venda ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {stages.venda ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            stages.pago ? 'bg-emerald-500 text-white' : 'bg-muted'
                          }`}>
                            {stages.pago ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">
                              {format(new Date(entry.created_at), "dd/MM/yy", { locale: ptBR })}
                            </span>
                            {entry.paid_at && (
                              <span className="text-xs text-emerald-600">
                                Pago: {format(new Date(entry.paid_at), "dd/MM/yy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Legend Footer */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-muted-foreground">Etapa concluída</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Aguardando</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-muted-foreground">R$ 2,00 liberado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Clock, ListOrdered, Recycle, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
}

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInQueue: 0,
    processing: 0,
    ready: 0,
    sold: 0,
    paid: 0,
    userPosition: null as number | null
  });

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const fetchQueue = async () => {
    setIsLoading(true);

    // Fetch FIFO queue with PRO details
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

    // Fetch profiles for names
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name');

    const profilesMap: Record<string, string> = {};
    profilesData?.forEach((p: Profile) => {
      profilesMap[p.user_id] = p.full_name;
    });

    const typedQueue = (queueData || []) as FifoEntry[];

    // Calculate stats
    const processing = typedQueue.filter(q => q.status === 'processing').length;
    const ready = typedQueue.filter(q => q.status === 'ready').length;
    const sold = typedQueue.filter(q => q.status === 'sold').length;
    const paid = typedQueue.filter(q => q.status === 'paid').length;
    
    let userPosition = null;
    if (user) {
      const userEntry = typedQueue.find(q => q.pro?.user_id === user.id && q.status !== 'paid');
      if (userEntry) {
        userPosition = userEntry.position;
      }
    }

    setQueue(typedQueue);
    setProfiles(profilesMap);
    setStats({
      totalInQueue: typedQueue.length,
      processing,
      ready,
      sold,
      paid,
      userPosition
    });
    setIsLoading(false);
  };

  const getStatusBadge = (status: ProStatus) => {
    const configs = {
      processing: { label: 'Processando', className: 'bg-accent text-accent-foreground' },
      ready: { label: 'Pronto', className: 'bg-primary text-primary-foreground' },
      sold: { label: 'Vendido', className: 'bg-secondary text-secondary-foreground' },
      paid: { label: 'Pago', className: 'bg-emerald-500 text-white' }
    };
    const config = configs[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusLabel = (status: ProStatus) => {
    const labels = {
      processing: 'Em processamento',
      ready: 'Virou adubo',
      sold: 'Adubo vendido',
      paid: 'Pagamento liberado'
    };
    return labels[status];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ListOrdered className="w-8 h-8 text-primary" />
            Fila Global FIFO
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a posição de todos os PROs na fila de pagamento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total na Fila</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInQueue}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Recycle className="w-4 h-4" />
                Processando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.processing}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prontos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.ready}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.sold}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{stats.paid}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Position Highlight */}
        {stats.userPosition && (
          <Card className="mb-8 border-2 border-primary bg-primary/5">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sua posição na fila</p>
                    <p className="text-3xl font-bold text-primary">#{stats.userPosition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">PROs até receber</p>
                  <p className="text-xl font-semibold">{stats.userPosition - 1} vendas</p>
                </div>
              </div>
              <Progress 
                value={((stats.totalInQueue - stats.userPosition + 1) / stats.totalInQueue) * 100} 
                className="mt-4 h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* Process Flow */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ciclo do Resíduo</CardTitle>
            <CardDescription>Entenda as etapas do processo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium">Processando</p>
                  <p className="text-xs text-muted-foreground">Resíduo em compostagem</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium">Pronto</p>
                  <p className="text-xs text-muted-foreground">Virou adubo</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-secondary-foreground font-bold">$</span>
                </div>
                <div>
                  <p className="font-medium">Vendido</p>
                  <p className="text-xs text-muted-foreground">Adubo comercializado</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Pago</p>
                  <p className="text-xs text-muted-foreground">R$ 2,00 liberado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fila Completa</CardTitle>
            <CardDescription>
              Ordenada por posição - primeiro a entrar, primeiro a receber
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListOrdered className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Nenhum PRO na fila ainda
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Posição</TableHead>
                      <TableHead>Código PRO</TableHead>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Etapa Atual</TableHead>
                      <TableHead>Data de Entrada</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((entry) => {
                      const isUserPro = user && entry.pro?.user_id === user.id;
                      return (
                        <TableRow 
                          key={entry.id}
                          className={isUserPro ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                        >
                          <TableCell className="font-bold text-lg">
                            #{entry.position}
                          </TableCell>
                          <TableCell className="font-mono">
                            {entry.pro?.code || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isUserPro && (
                                <Badge variant="outline" className="text-xs">Você</Badge>
                              )}
                              {profiles[entry.pro?.user_id] || 'Desconhecido'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(entry.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getStatusLabel(entry.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3" />
                              {format(new Date(entry.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {entry.paid_at ? (
                              <span className="text-emerald-600 font-medium">
                                {format(new Date(entry.paid_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

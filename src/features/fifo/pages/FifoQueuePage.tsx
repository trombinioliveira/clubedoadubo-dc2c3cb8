import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Clock, 
  ListOrdered, 
  Recycle, 
  DollarSign, 
  User, 
  Search,
  Filter,
  Leaf,
  Package,
  CheckCircle2,
  Banknote,
  ChevronRight
} from 'lucide-react';
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

const statusConfig = {
  processing: { 
    label: 'Processando', 
    shortLabel: 'Processando',
    icon: Recycle,
    description: 'Resíduo em compostagem',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
    badgeClass: 'bg-amber-500 text-white'
  },
  ready: { 
    label: 'Pronto', 
    shortLabel: 'Adubo',
    icon: Leaf,
    description: 'Virou adubo orgânico',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary',
    textClass: 'text-primary',
    badgeClass: 'bg-primary text-primary-foreground'
  },
  sold: { 
    label: 'Vendido', 
    shortLabel: 'Vendido',
    icon: Package,
    description: 'Adubo foi comercializado',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
    badgeClass: 'bg-blue-500 text-white'
  },
  paid: { 
    label: 'Pago', 
    shortLabel: 'Pago',
    icon: Banknote,
    description: 'R$ 2,00 liberado',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-500 text-white'
  }
};

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | ProStatus>('all');
  const [stats, setStats] = useState({
    totalInQueue: 0,
    processing: 0,
    ready: 0,
    sold: 0,
    paid: 0,
    userPosition: null as number | null,
    userProsCount: 0
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
      .select('user_id, full_name');

    const profilesMap: Record<string, string> = {};
    profilesData?.forEach((p: Profile) => {
      profilesMap[p.user_id] = p.full_name;
    });

    const typedQueue = (queueData || []) as FifoEntry[];

    const processing = typedQueue.filter(q => q.status === 'processing').length;
    const ready = typedQueue.filter(q => q.status === 'ready').length;
    const sold = typedQueue.filter(q => q.status === 'sold').length;
    const paid = typedQueue.filter(q => q.status === 'paid').length;
    
    let userPosition = null;
    let userProsCount = 0;
    if (user) {
      const userEntries = typedQueue.filter(q => q.pro?.user_id === user.id);
      userProsCount = userEntries.length;
      const unpaidEntry = userEntries.find(q => q.status !== 'paid');
      if (unpaidEntry) {
        userPosition = unpaidEntry.position;
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
      userPosition,
      userProsCount
    });
    setIsLoading(false);
  };

  const filteredQueue = queue.filter(entry => {
    const matchesSearch = 
      entry.pro?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profiles[entry.pro?.user_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || entry.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getStepNumber = (status: ProStatus) => {
    const steps = { processing: 1, ready: 2, sold: 3, paid: 4 };
    return steps[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-primary-foreground" />
            </div>
            Fila Global FIFO
          </h1>
          <p className="text-muted-foreground mt-2">
            Primeiro a entrar, primeiro a receber. Acompanhe todos os resíduos e seu caminho até o pagamento.
          </p>
        </div>

        {/* Journey Visual */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-lg">Jornada do Resíduo até o Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-muted mx-16" />
              
              {(['processing', 'ready', 'sold', 'paid'] as ProStatus[]).map((status, index) => {
                const config = statusConfig[status];
                const Icon = config.icon;
                const count = stats[status];
                
                return (
                  <React.Fragment key={status}>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full ${config.bgClass} border-2 ${config.borderClass} flex items-center justify-center mb-2`}>
                        <Icon className={`w-6 h-6 ${config.textClass}`} />
                      </div>
                      <p className="font-semibold text-sm">{config.shortLabel}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {count} PROs
                      </Badge>
                    </div>
                    {index < 3 && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground relative z-10 -mt-8" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Position Highlight */}
        {user && stats.userProsCount > 0 && (
          <Card className="mb-8 border-2 border-primary overflow-hidden">
            <div className="earth-gradient p-1" />
            <CardContent className="py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seus PROs na fila</p>
                    <p className="text-3xl font-bold text-primary">{stats.userProsCount}</p>
                  </div>
                </div>
                {stats.userPosition && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Próximo pagamento</p>
                    <p className="text-xl font-bold">Posição #{stats.userPosition}</p>
                    <p className="text-sm text-secondary font-medium">
                      {stats.userPosition - 1} vendas para receber
                    </p>
                  </div>
                )}
              </div>
              {stats.userPosition && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso na fila</span>
                    <span>{Math.round(((stats.totalInQueue - stats.userPosition + 1) / stats.totalInQueue) * 100)}%</span>
                  </div>
                  <Progress 
                    value={((stats.totalInQueue - stats.userPosition + 1) / stats.totalInQueue) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código PRO ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                  <TabsTrigger value="all" className="text-xs">
                    Todos ({stats.totalInQueue})
                  </TabsTrigger>
                  <TabsTrigger value="processing" className="text-xs">
                    <Recycle className="w-3 h-3 mr-1" />
                    {stats.processing}
                  </TabsTrigger>
                  <TabsTrigger value="ready" className="text-xs">
                    <Leaf className="w-3 h-3 mr-1" />
                    {stats.ready}
                  </TabsTrigger>
                  <TabsTrigger value="sold" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    {stats.sold}
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="text-xs">
                    <Banknote className="w-3 h-3 mr-1" />
                    {stats.paid}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Queue Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredQueue.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ListOrdered className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'Nenhum PRO encontrado' : 'Nenhum PRO na fila ainda'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Tente buscar por outro código ou nome' : 'Os PROs aparecerão aqui quando forem registrados'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQueue.map((entry) => {
              const config = statusConfig[entry.status];
              const Icon = config.icon;
              const isUserPro = user && entry.pro?.user_id === user.id;
              const stepNumber = getStepNumber(entry.status);

              return (
                <Card 
                  key={entry.id}
                  className={`relative overflow-hidden transition-all hover:shadow-md ${
                    isUserPro ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  {/* Status stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${config.badgeClass}`} />
                  
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.bgClass} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config.textClass}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-sm">{entry.pro?.code}</p>
                            {isUserPro && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Seu
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {profiles[entry.pro?.user_id] || 'Usuário'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">#{entry.position}</p>
                        <p className="text-[10px] text-muted-foreground">na fila</p>
                      </div>
                    </div>

                    {/* Progress steps */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            step <= stepNumber 
                              ? config.badgeClass
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={config.badgeClass}>
                        {config.label}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(entry.created_at), "dd/MM/yy", { locale: ptBR })}
                      </div>
                    </div>

                    {entry.status === 'paid' && entry.paid_at && (
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Pago em</span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {format(new Date(entry.paid_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}

                    {entry.status !== 'paid' && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground text-center">
                          Próximo passo: <span className="font-medium text-foreground">{
                            entry.status === 'processing' ? 'Virar adubo' :
                            entry.status === 'ready' ? 'Ser vendido' :
                            'Receber R$ 2,00'
                          }</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <Card className="mt-8">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Como funciona:</strong> Cada 100g de resíduo = 1 PRO • 
              Quando o adubo é vendido, o próximo PRO da fila recebe <strong>R$ 2,00</strong> • 
              A fila é global e transparente para todos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

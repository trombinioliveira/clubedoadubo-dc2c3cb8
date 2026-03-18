import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye, ArrowRight, Compass, Heart, Sparkles, Footprints, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ProSummaryModal,
  MyPositionModal,
} from '../components';

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

const STATUS_LABELS: Record<ProStatus, { label: string; className: string }> = {
  pending: { label: 'Aguardando', className: 'bg-muted text-muted-foreground' },
  processing: { label: 'Em andamento', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ready: { label: 'Pronto', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  sold: { label: 'Vendido', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  paid: { label: 'Pago', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoQueuePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<FifoQueuePublic | null>(null);
  const [showMyPosition, setShowMyPosition] = useState(false);
  const [stats, setStats] = useState({ totalInQueue: 0, pending: 0, processing: 0, ready: 0, sold: 0, paid: 0 });
  const [userStats, setUserStats] = useState({ pending: 0, processing: 0, ready: 0, sold: 0, paid: 0 });

  useEffect(() => {
    fetchQueue();
    markFifoViewed();
  }, [user]);

  const markFifoViewed = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ has_viewed_fifo: true }).eq('user_id', user.id).eq('has_viewed_fifo', false);
  };

  const fetchQueue = async () => {
    setIsLoading(true);
    const { data: queueData, error } = await supabase.rpc('get_fifo_queue_public');
    if (error) { setIsLoading(false); return; }
    const typedQueue = (queueData || []) as unknown as FifoQueuePublic[];

    const countByStatus = (s: ProStatus) => typedQueue.filter(q => q.queue_status === s).length;
    setStats({
      totalInQueue: typedQueue.length,
      pending: countByStatus('pending'),
      processing: countByStatus('processing'),
      ready: countByStatus('ready'),
      sold: countByStatus('sold'),
      paid: countByStatus('paid'),
    });

    if (user) {
      const uq = typedQueue.filter(q => q.pro_user_id === user.id);
      setUserStats({
        pending: uq.filter(q => q.queue_status === 'pending').length,
        processing: uq.filter(q => q.queue_status === 'processing').length,
        ready: uq.filter(q => q.queue_status === 'ready').length,
        sold: uq.filter(q => q.queue_status === 'sold').length,
        paid: uq.filter(q => q.queue_status === 'paid').length,
      });
    }

    setQueue(typedQueue);
    setIsLoading(false);
  };

  const filteredQueue = queue.filter(entry => {
    const matchesSearch = entry.pro_code?.toLowerCase().includes(searchTerm.toLowerCase()) || entry.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMine = !showOnlyMine || (user && entry.pro_user_id === user.id);
    return matchesSearch && matchesMine;
  });

  const userPros = queue.filter(entry => user && entry.pro_user_id === user.id);
  const userFirstPosition = userPros.length > 0 ? Math.min(...userPros.map(p => p.queue_position)) : null;
  const prosAhead = userFirstPosition ? queue.filter(p => p.queue_position < userFirstPosition && p.queue_status !== 'paid').length : 0;

  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
  const myTotal = userStats.pending + userStats.processing + userStats.ready + userStats.sold + userStats.paid;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
      {/* ========== HEADER ========== */}
      <motion.div {...fadeIn} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Minha participação no ciclo</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Acompanhe onde sua participação está, como ela avança e por que a ordem do sistema funciona de forma justa.
        </p>
      </motion.div>

      {/* ========== BLOCO 1 — Contexto ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="mb-8">
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aqui você vê sua situação atual no ciclo e acompanha, com mais clareza, como sua participação está em movimento.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== BLOCO 2 — O que está acontecendo agora ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-1">O que está acontecendo agora</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Este é o retrato do momento atual da sua participação: o que já avançou, o que ainda está em andamento e o que você pode acompanhar agora.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            { label: 'Aguardando', value: userStats.pending, color: 'text-muted-foreground' },
            { label: 'Em andamento', value: userStats.processing, color: 'text-blue-600' },
            { label: 'Pronto', value: userStats.ready, color: 'text-amber-600' },
            { label: 'Vendido', value: userStats.sold, color: 'text-emerald-600' },
            { label: 'Pago', value: userStats.paid, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-3 text-center space-y-0.5">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Button size="sm" variant="outline" onClick={() => setShowMyPosition(true)} className="gap-1.5" disabled={!user || myTotal === 0}>
            <Eye className="w-4 h-4" /> Ver minha posição detalhada
          </Button>
        </div>
      </motion.div>

      {/* ========== BLOCO 3 — Por que a ordem é justa ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Por que a ordem é justa</h2>
        <Card className="border-primary/15 bg-primary/5">
          <CardContent className="p-5 sm:p-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              No Clube do Adubo, a ordem do ciclo é respeitada de forma real. Ninguém passa na frente. O valor entra no sistema a partir do movimento real do adubo, e a participação avança dentro dessa lógica com transparência.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== BLOCO 4 — Acompanhar minha posição ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-1">Acompanhar minha posição</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Aqui você pode ver com mais detalhe onde sua participação está e como o ciclo anda à sua frente e ao seu redor.
        </p>

        {/* Busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant={showOnlyMine ? "default" : "outline"} onClick={() => setShowOnlyMine(!showOnlyMine)} className="gap-1.5" disabled={!user}>
            <Filter className="w-4 h-4" />
            {showOnlyMine ? 'Minhas' : 'Todas'}
          </Button>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredQueue.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">
                {showOnlyMine && myTotal === 0
                  ? 'Você ainda não tem participações no ciclo.'
                  : 'Nenhum resultado encontrado.'}
              </p>
              {myTotal === 0 && (
                <Link to="/planos#inicio">
                  <Button className="earth-gradient gap-1.5 mt-3">
                    <ArrowRight className="w-4 h-4" /> Dar meu primeiro passo
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto rounded-xl border border-border p-2">
            {filteredQueue.slice(0, 100).map((entry) => {
              const sl = STATUS_LABELS[entry.queue_status];
              const isMine = user && entry.pro_user_id === user.id;
              return (
                <div
                  key={entry.queue_id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    isMine ? 'border-primary/30 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="text-center min-w-[40px]">
                    <p className="text-xs text-muted-foreground">#</p>
                    <p className="font-bold text-foreground text-sm">{entry.queue_position}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-foreground truncate">{entry.pro_code}</p>
                    {isMine && <p className="text-[11px] text-primary font-medium">Sua participação</p>}
                  </div>
                  <Badge className={`${sl.className} text-[10px] px-2`}>{sl.label}</Badge>
                </div>
              );
            })}
            {filteredQueue.length > 100 && (
              <p className="text-center text-xs text-muted-foreground py-2">
                Mostrando 100 de {filteredQueue.length} posições
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ========== BLOCO 5 — Entender o movimento ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Entender o movimento do ciclo</h2>
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua participação faz parte de um sistema maior, que transforma resíduo, produz adubo e mantém uma ordem clara de andamento. Este movimento maior ajuda a explicar o que acontece com você por aqui.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.totalInQueue}</p>
                <p className="text-[11px] text-muted-foreground">Total no ciclo</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{stats.paid}</p>
                <p className="text-[11px] text-muted-foreground">Já pagos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{stats.processing + stats.ready}</p>
                <p className="text-[11px] text-muted-foreground">Em andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== BLOCO 6 — Continue acompanhando ========== */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-semibold text-foreground mb-4">Continue acompanhando</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Minha Jornada', link: '/jornada', icon: Compass },
            { title: 'Meus Sonhos', link: '/dreams', icon: Heart },
            { title: 'Painel Público', link: '/painel-publico#inicio', icon: Eye },
            { title: 'Passo a passo', link: '/ciclo', icon: Footprints },
          ].map(({ title, link, icon: Icon }) => (
            <Link key={link} to={link}>
              <Card className="hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-3 text-center space-y-1">
                  <Icon className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-xs font-medium text-foreground">{title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Modais */}
      <ProSummaryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      <MyPositionModal
        isOpen={showMyPosition}
        onClose={() => setShowMyPosition(false)}
        userPros={userPros}
        prosAhead={prosAhead}
        paidCount={stats.paid}
        userFirstPosition={userFirstPosition}
      />
    </div>
  );
}

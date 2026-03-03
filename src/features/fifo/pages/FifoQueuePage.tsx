import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Eye } from 'lucide-react';
import {
  FifoHeroSection,
  FifoFluxogramaSection,
  FifoExplanationBlock,
  CycleStagesBlock,
  RealDoCicloBlock,
  FifoDivider,
  ProSummaryModal,
  MyPositionModal,
  FifoQueueColumns,
  FifoFooter
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

export default function FifoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<FifoQueuePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FifoQueuePublic | null>(null);
  const [showMyPosition, setShowMyPosition] = useState(false);
  const [stats, setStats] = useState({
    totalInQueue: 0,
    pending: 0,
    processing: 0,
    ready: 0,
    sold: 0,
    paid: 0
  });
  const [userStats, setUserStats] = useState({
    pending: 0,
    processing: 0,
    ready: 0,
    sold: 0,
    paid: 0
  });

  useEffect(() => {
    fetchQueue();
    markFifoViewed();
  }, [user]);

  const markFifoViewed = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ has_viewed_fifo: true })
      .eq('user_id', user.id)
      .eq('has_viewed_fifo', false);
  };

  const fetchQueue = async () => {
    setIsLoading(true);

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

    // Calculate user stats
    if (user) {
      const userQueue = typedQueue.filter(q => q.pro_user_id === user.id);
      setUserStats({
        pending: userQueue.filter(q => q.queue_status === 'pending').length,
        processing: userQueue.filter(q => q.queue_status === 'processing').length,
        ready: userQueue.filter(q => q.queue_status === 'ready').length,
        sold: userQueue.filter(q => q.queue_status === 'sold').length,
        paid: userQueue.filter(q => q.queue_status === 'paid').length
      });
    }

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

  // Get user's position info
  const userPros = queue.filter(entry => user && entry.pro_user_id === user.id);
  const userFirstPosition = userPros.length > 0 
    ? Math.min(...userPros.map(p => p.queue_position)) 
    : null;
  const prosAhead = userFirstPosition 
    ? queue.filter(p => p.queue_position < userFirstPosition && p.queue_status !== 'paid').length 
    : 0;
  const paidCount = stats.paid;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-emerald-50/30 to-amber-50/20">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        
        {/* ========================================= */}
        {/* ZONA 1 — EDUCAÇÃO & CONTEXTO             */}
        {/* ========================================= */}
        
        {/* BLOCO 1 — Hero / Explicação Simples */}
        <FifoHeroSection />
        
        {/* BLOCO 2 — Fluxograma Oficial do Ciclo */}
        <FifoFluxogramaSection />
        
        {/* BLOCO 3 — Por que a Fila é Justa */}
        <FifoExplanationBlock />

        {/* BLOCO 4 — Como o Dinheiro Entra (Real do Ciclo) */}
        <RealDoCicloBlock />

        {/* CTA — Ver Minha Posição */}
        <div className="text-center mb-6">
          <Button 
            size="lg" 
            onClick={() => setShowMyPosition(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg gap-2"
            disabled={!user}
          >
           <Eye className="w-5 h-5" />
            Ver meus PROs na Fila
          </Button>
        </div>

        {/* ========================================= */}
        {/* DIVISOR - MARCO ABSOLUTO                 */}
        {/* ========================================= */}
        <FifoDivider />

        {/* ========================================= */}
        {/* ZONA 2 — FILA FIFO ATIVA (INTOCÁVEL)    */}
        {/* ========================================= */}

        {/* BLOCO 5 — Etapas do Ciclo (Clicáveis) */}
        <CycleStagesBlock 
          stats={stats} 
          userStats={user ? userStats : undefined} 
        />

        {/* Busca e Filtros */}
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

        {/* Visualização em Colunas */}
        <FifoQueueColumns 
          queue={filteredQueue}
          userId={user?.id}
          onSelectEntry={setSelectedEntry}
          isLoading={isLoading}
        />

        {/* Rodapé Educativo */}
        <FifoFooter />
      </div>

      {/* BLOCO 4 — Modal: Resumo do PRO */}
      <ProSummaryModal 
        entry={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
      />

      {/* Modal: Minha Posição */}
      <MyPositionModal 
        isOpen={showMyPosition}
        onClose={() => setShowMyPosition(false)}
        userPros={userPros}
        prosAhead={prosAhead}
        paidCount={paidCount}
        userFirstPosition={userFirstPosition}
      />
    </div>
  );
}

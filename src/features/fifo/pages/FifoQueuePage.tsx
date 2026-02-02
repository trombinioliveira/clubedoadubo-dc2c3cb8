import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared';
import { 
  ListOrdered, 
  Search,
  User,
  Calendar,
  Scale,
  Leaf,
  ArrowDown,
  ArrowRight,
  Filter,
  Recycle,
  DollarSign,
  Target,
  Waves,
  Eye,
  TrendingUp
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

const stageConfig = [
  { key: 'pending', label: '1', title: 'Coleta', icon: '📍', statuses: ['pending'] as ProStatus[] },
  { key: 'processing', label: '2', title: 'Processamento', icon: '🏭', statuses: ['processing'] as ProStatus[] },
  { key: 'ready', label: '3', title: 'Produção', icon: '🌾', statuses: ['ready'] as ProStatus[] },
  { key: 'sold', label: '4', title: 'Venda', icon: '📦', statuses: ['sold'] as ProStatus[] },
  { key: 'paid', label: 'R$', title: 'Pago', icon: '💰', statuses: ['paid'] as ProStatus[] },
];

export default function FifoQueuePage() {
  const { user, profile } = useAuth();
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

  useEffect(() => {
    fetchQueue();
  }, [user]);

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* ======================== HERO / TOPO ======================== */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-4 shadow-lg">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Fila FIFO da Economia Circular
          </h1>
          <p className="text-lg text-emerald-700 font-medium mb-2">
            Aqui, o resíduo entra em ordem, o impacto cresce em rede e o valor retorna com justiça.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A Fila FIFO (First In, First Out) organiza quem recebe primeiro
            com base na ordem real de ativação dos PROs,
            sem atalhos e sem hierarquias.
          </p>
        </div>

        {/* ======================== SEÇÕES EDUCATIVAS ======================== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          
          {/* SEÇÃO 1 — O que é um PRO */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                <Leaf className="w-5 h-5" />
                O que é um PRO
                <HelpTooltip content="PRO significa Processamento de Resíduo Orgânico. É a unidade básica do nosso sistema de economia circular." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900/80 space-y-2">
              <p className="font-medium">PRO é a unidade do Processamento de Resíduo Orgânico.</p>
              <ul className="space-y-1 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span><strong>1 PRO = 100g</strong> de resíduo orgânico urbano</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>Cada PRO entra na Fila FIFO global</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>O resíduo é rastreável do início ao fim</span>
                </li>
              </ul>
              <p className="text-xs text-emerald-700 font-medium pt-2 border-t border-emerald-200">
                ✨ O PRO conecta impacto ambiental com valor real.
              </p>
            </CardContent>
          </Card>

          {/* SEÇÃO 2 — Como o dinheiro entra */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <DollarSign className="w-5 h-5" />
                Como o dinheiro entra
                <HelpTooltip content="O valor do sistema vem exclusivamente da venda real de adubo produzido, nunca da entrada de novos participantes." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-900/80 space-y-2">
              <p className="font-medium">O dinheiro NÃO vem da entrada de novas pessoas.</p>
              <p>Ele entra quando:</p>
              <ul className="space-y-1 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>O resíduo é compostado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>O adubo é produzido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>O adubo é vendido</span>
                </li>
              </ul>
              <p className="text-xs text-amber-700 font-medium pt-2 border-t border-amber-200">
                💰 Cada venda gera <strong>R$ 2,00</strong>, pagos seguindo a ordem da Fila FIFO.
              </p>
            </CardContent>
          </Card>

          {/* SEÇÃO 3 — O que é a Fila FIFO */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <ListOrdered className="w-5 h-5" />
                O que é a Fila FIFO
                <HelpTooltip content="FIFO = First In, First Out. A fila garante que quem entrou primeiro, recebe primeiro. Simples assim." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900/80 space-y-2">
              <p className="font-medium">FIFO significa First In, First Out.</p>
              <ul className="space-y-1 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Quem entra primeiro, recebe primeiro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>A fila é <strong>única e global</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>A ordem é cronológica e transparente</span>
                </li>
              </ul>
              <p className="text-xs text-blue-700 font-medium pt-2 border-t border-blue-200">
                🔒 Nada fura a fila. Nada acelera a fila.
              </p>
            </CardContent>
          </Card>

          {/* SEÇÃO 4 — PRO Direto x PRO Global (lado a lado) */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                <TrendingUp className="w-5 h-5" />
                PRO Direto x PRO Global
                <HelpTooltip content="PRO Direto vai para quem indicou. PRO Global vai para o primeiro da fila FIFO, garantindo justiça." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* PRO Direto */}
                <div className="p-3 bg-purple-100/50 rounded-lg border border-purple-200">
                  <p className="font-bold text-purple-800 mb-2">🎯 PRO Direto</p>
                  <ul className="text-xs text-purple-900/80 space-y-1">
                    <li>• Vai para quem indicou</li>
                    <li>• Mede engajamento</li>
                    <li>• Não altera a fila</li>
                  </ul>
                </div>
                {/* PRO Global */}
                <div className="p-3 bg-emerald-100/50 rounded-lg border border-emerald-200">
                  <p className="font-bold text-emerald-800 mb-2">🌍 PRO Global</p>
                  <ul className="text-xs text-emerald-900/80 space-y-1">
                    <li>• Vai para o 1º da fila</li>
                    <li>• Independe de indicação</li>
                    <li>• Garante justiça</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-purple-700 font-medium pt-2 border-t border-purple-200">
                ⚖️ O PRO Global respeita 100% a ordem da fila.
              </p>
            </CardContent>
          </Card>

          {/* SEÇÃO 5 — Fila x Ondas de Impacto */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <Waves className="w-5 h-5" />
                Fila x Ondas de Impacto
                <HelpTooltip content="A fila define a ordem de pagamento. As ondas de impacto mostram seu engajamento e rede de indicações." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-orange-900/80 space-y-2">
              <p className="font-medium">Existe UMA fila de pagamento.</p>
              <p>E VÁRIAS ondas de impacto.</p>
              <div className="flex items-center gap-3 py-2">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  💰 Fila FIFO = dinheiro
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  🌊 Ondas = impacto
                </Badge>
              </div>
              <p className="text-xs text-orange-700 font-medium pt-2 border-t border-orange-200">
                📢 Ondas mostram impacto, mas nunca mudam a ordem de pagamento.
              </p>
            </CardContent>
          </Card>

          {/* SEÇÃO 6 — Metas da Fila Global */}
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-teal-800">
                <Target className="w-5 h-5" />
                Metas da Fila Global
                <HelpTooltip content="Ao atingir sua meta de PROs Globais, você recebe reconhecimento, vai para o final da fila e inicia uma nova meta dobrada." />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-teal-900/80 space-y-2">
              <p className="font-medium">A Fila FIFO funciona com metas progressivas.</p>
              <ul className="space-y-1 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">•</span>
                  <span>Metas começam em <strong>2 PROs</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">•</span>
                  <span>Dobram: 2 → 4 → 8 → 16 → 32 → …</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">•</span>
                  <span>Ao concluir: reconhecimento + final da fila + nova meta</span>
                </li>
              </ul>
              <p className="text-xs text-teal-700 font-medium pt-2 border-t border-teal-200">
                🔄 Objetivo: Manter o ciclo vivo, justo e contínuo.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ======================== SEÇÃO VISUAL / FLUXO ======================== */}
        <Card className="mb-10 border-2 border-dashed border-emerald-300 bg-gradient-to-r from-emerald-50 via-yellow-50 to-orange-50">
          <CardContent className="py-6">
            <h3 className="text-center font-bold text-lg text-foreground mb-4">
              🔄 Fluxo da Economia Circular
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-sm">
              {[
                { icon: '🗑️', label: 'Resíduo (100g)' },
                { icon: '🌱', label: 'PRO ativado' },
                { icon: '📋', label: 'Entrada na Fila' },
                { icon: '🏭', label: 'Compostagem' },
                { icon: '🌾', label: 'Adubo pronto' },
                { icon: '📦', label: 'Venda' },
                { icon: '💰', label: 'R$ 2,00 pago' },
                { icon: '➡️', label: 'Próximo avança' },
              ].map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center p-2 bg-white/80 rounded-lg shadow-sm min-w-[80px]">
                    <span className="text-2xl mb-1">{step.icon}</span>
                    <span className="text-xs text-center text-muted-foreground">{step.label}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-emerald-500 hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              O valor só se move quando o ciclo acontece.
            </p>
          </CardContent>
        </Card>

        {/* ======================== CTA — VER MINHA POSIÇÃO ======================== */}
        <div className="text-center mb-10">
          <Button 
            size="lg" 
            onClick={() => setShowMyPosition(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg gap-2"
            disabled={!user}
          >
            <Eye className="w-5 h-5" />
            Ver minha posição na Fila FIFO
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            A fila se move com impacto real, não com promessas.
          </p>
        </div>

        {/* ======================== BUSCA E FILTROS ======================== */}
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

        {/* ======================== VISUALIZAÇÃO EM COLUNAS ======================== */}
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

        {/* ======================== RODAPÉ ======================== */}
        <div className="mt-10 text-center p-6 bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 rounded-2xl">
          <p className="text-lg font-medium text-emerald-900">
            No Clube do Adubo,
          </p>
          <p className="text-emerald-800">
            o resíduo é a base,
          </p>
          <p className="text-emerald-800">
            o impacto é coletivo,
          </p>
          <p className="text-emerald-700 font-semibold">
            e o retorno é consequência da vida gerada.
          </p>
        </div>
      </div>

      {/* ======================== MODAL — DETALHES DO PRO ======================== */}
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
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Código</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {selectedEntry.pro_code}
                </p>
              </div>

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

      {/* ======================== MODAL — MINHA POSIÇÃO ======================== */}
      <Dialog open={showMyPosition} onOpenChange={setShowMyPosition}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              Sua Posição na Fila FIFO
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {userPros.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Você ainda não possui PROs na fila.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adquira PROs para entrar na economia circular!
                </p>
              </div>
            ) : (
              <>
                <div className="text-center p-4 bg-emerald-100 rounded-lg">
                  <p className="text-xs text-emerald-700 mb-1">Sua melhor posição</p>
                  <p className="text-4xl font-bold text-emerald-700">
                    {userFirstPosition}º
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">PROs à frente</p>
                    <p className="text-2xl font-bold text-orange-600">{prosAhead}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Já avançaram</p>
                    <p className="text-2xl font-bold text-emerald-600">{paidCount}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Seus PROs na fila:</p>
                  <div className="flex flex-wrap gap-1">
                    {userPros.slice(0, 10).map(pro => (
                      <Badge key={pro.queue_id} variant="outline" className="text-xs">
                        #{pro.queue_position}
                      </Badge>
                    ))}
                    {userPros.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{userPros.length - 10} mais
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-center p-3 border border-dashed border-emerald-300 rounded-lg bg-emerald-50/50">
                  <p className="text-xs text-muted-foreground">
                    Como o avanço ocorre?
                  </p>
                  <p className="text-sm text-emerald-700 font-medium mt-1">
                    Cada venda real de adubo paga o próximo da fila!
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

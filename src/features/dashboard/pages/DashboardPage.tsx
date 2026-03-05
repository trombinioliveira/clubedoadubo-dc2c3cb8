import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Sprout, ShoppingCart, CheckCircle2, Wallet, 
  TrendingUp, ChevronDown, Target, Sparkles,
  ArrowRight, Eye, Settings, Rocket
} from 'lucide-react';
import { AddProsPixModal } from '@/features/dreams/components/AddProsPixModal';
import { QrCodeModal } from '../components/QrCodeModal';
import { ImpactMissionsSection } from '../components/ImpactMissionsSection';
import { calculateLevelInfo } from '@/features/dreams/constants/levels';
import { motion } from 'framer-motion';

interface DashboardSummary {
  pros_in_cycle: number;
  pros_sold: number;
  pros_paid: number;
  total_received: number;
  today_sales_count: number;
  today_pros_paid: number;
  month_sales_count: number;
  month_pros_paid: number;
  active_dreams_count: number;
  completed_dreams_count: number;
  has_active_subscription: boolean;
  active_plan_key: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  plano_semente: 'Plano Semente',
  plano_muda: 'Plano Muda',
  plano_arvore: 'Plano Árvore',
  anual_semente: 'Semente Anual',
  anual_muda: 'Muda Anual',
  anual_arvore: 'Árvore Anual',
  assinatura_pros_semente: 'PROs Semente',
  assinatura_pros_muda: 'PROs Muda',
  assinatura_pros_arvore: 'PROs Árvore',
  assinatura_granulado: 'Adubo Granulado',
  assinatura_liquido: 'Adubo Líquido',
  assinatura_combo: 'Combo Adubo',
};

export function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);

  const userName = profile?.full_name?.split(' ')[0] || 'Participante';
  const referralCode = profile?.referral_code || 'CODIGO';
  const pixKey = profile?.pix_key || null;
  const hasPixKey = !!pixKey;

  // Main RPC query
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc('get_user_dashboard_summary', {
        p_user_id: user.id,
      });
      if (error) throw error;
      return data as unknown as DashboardSummary;
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });

  // Missions enabled check
  const { data: missionsEnabled = true } = useQuery({
    queryKey: ['site-settings', 'missions_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'missions_enabled')
        .single();
      if (error) return true;
      return (data?.value as any)?.enabled ?? true;
    },
  });

  const totalPros = (summary?.pros_in_cycle ?? 0) + (summary?.pros_sold ?? 0) + (summary?.pros_paid ?? 0);
  const isNewUser = totalPros === 0;
  const levelInfo = calculateLevelInfo(totalPros);

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/5 px-4 py-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Olá, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isNewUser 
              ? 'Comece sua jornada no ciclo.' 
              : 'Você já entrou no ciclo. Acompanhe sua posição e o movimento.'}
          </p>
        </div>
      </div>

      {/* Modals */}
      {hasPixKey ? (
        <AddProsPixModal open={pixModalOpen} onOpenChange={setPixModalOpen} pixKey={pixKey!} userName={userName} />
      ) : null}
      <QrCodeModal open={qrCodeModalOpen} onOpenChange={setQrCodeModalOpen} referralCode={referralCode} userName={userName} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5">

        {/* ONBOARDING */}
        {isNewUser && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 space-y-3 text-center">
                <Rocket className="w-10 h-10 mx-auto text-primary" />
                <p className="text-lg font-semibold text-foreground">Comece sua jornada no ciclo.</p>
                <p className="text-sm text-muted-foreground">Ative seu primeiro PRO para participar da economia circular urbana.</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  {hasPixKey ? (
                    <Button size="lg" className="gap-2" onClick={() => setPixModalOpen(true)}>
                      <Sprout className="w-5 h-5" /> Ativar primeiro PRO
                    </Button>
                  ) : (
                    <Button size="lg" className="gap-2" onClick={() => navigate('/perfil')}>
                      Cadastrar chave Pix
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => navigate('/ciclo')}>
                    Entender o ciclo <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* BLOCO 1 — Seus PROs no ciclo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              Seus PROs no ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Em ciclo" value={summary?.pros_in_cycle ?? 0} icon={<Sprout className="w-4 h-4 text-blue-500" />} />
              <StatBox label="Vendidos" value={summary?.pros_sold ?? 0} icon={<ShoppingCart className="w-4 h-4 text-amber-500" />} />
              <StatBox label="Pagos" value={summary?.pros_paid ?? 0} icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} />
              <StatBox label="Recebido" value={formatBRL(summary?.total_received ?? 0)} icon={<Wallet className="w-4 h-4 text-emerald-600" />} />
            </div>

            {/* Level inline */}
            {totalPros > 0 && (
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {levelInfo.currentLevel}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Nível {levelInfo.currentLevel} de 21
                    {levelInfo.prosToNextLevel > 0 && (
                      <span> • faltam <span className="font-semibold text-foreground">{levelInfo.prosToNextLevel}</span> PROs</span>
                    )}
                  </p>
                  <Progress value={levelInfo.levels.find(l => l.level === levelInfo.currentLevel)?.progress ?? 0} className="h-1.5 mt-1" />
                </div>
              </div>
            )}

            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate('/fifo')}>
              <Eye className="w-3.5 h-3.5 mr-1" /> Ver detalhes da fila
            </Button>
          </CardContent>
        </Card>

        {/* CTA DOMINANTE */}
        {hasPixKey ? (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="w-full gap-2 text-base py-6 shadow-lg"
              onClick={() => setPixModalOpen(true)}
            >
              <Sprout className="w-5 h-5" /> Ativar mais PROs
            </Button>
          </motion.div>
        ) : (
          <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Chave Pix não cadastrada</p>
                <p className="text-xs text-muted-foreground">Cadastre sua chave Pix para ativar PROs.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/perfil')}>
                Ir para perfil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 2 — Movimento global */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Movimento do ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hoje</span>
              <span className="text-foreground">
                {summary?.today_sales_count ?? 0} vendas • {summary?.today_pros_paid ?? 0} PROs pagos
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mês</span>
              <span className="text-foreground">
                {summary?.month_sales_count ?? 0} vendas • {summary?.month_pros_paid ?? 0} PROs pagos
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate('/painel-publico')}>
              Ver painel público <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* BLOCO 3 — Sonhos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Sonhos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span><span className="font-semibold text-foreground">{summary?.active_dreams_count ?? 0}</span> ativos</span>
              <span><span className="font-semibold text-foreground">{summary?.completed_dreams_count ?? 0}</span> concluídos</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dreams')}>
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        {/* BLOCO 4 — Assinatura */}
        {summary?.has_active_subscription ? (
          <Card className="border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-1">Assinante</Badge>
                <p className="text-sm font-medium text-foreground">
                  {PLAN_LABELS[summary.active_plan_key ?? ''] ?? summary.active_plan_key}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/assinatura')}>
                  <Settings className="w-4 h-4 mr-1" /> Gerenciar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-primary/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Automatize com um plano mensal</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/planos#plano-muda')}>
                Ver planos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 5 — Missões (colapsável) */}
        {missionsEnabled && (
          <Collapsible open={missionsOpen} onOpenChange={setMissionsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">🌱 Missões de impacto</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${missionsOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ImpactMissionsSection
                    onOpenPix={() => setPixModalOpen(true)}
                    referralCode={referralCode}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Link discreto para ciclo */}
        {totalPros > 0 && (
          <div className="text-center">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate('/ciclo')}>
              Ver passo a passo do ciclo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center space-y-1">
      <div className="flex justify-center">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

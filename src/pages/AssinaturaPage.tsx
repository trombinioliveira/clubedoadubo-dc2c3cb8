import React from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, ArrowRight, MessageCircle } from 'lucide-react';

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

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Ativa', variant: 'default' },
  paused: { label: 'Pausada', variant: 'secondary' },
  canceled: { label: 'Cancelada', variant: 'destructive' },
};

export default function AssinaturaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['my-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Assinatura</h1>
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Você ainda não possui uma assinatura ativa.</p>
            <Button onClick={() => navigate('/planos')}>
              Ver planos disponíveis <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[subscription.status] || STATUS_LABELS.active;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Minha Assinatura</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{PLAN_LABELS[subscription.plan_key] ?? subscription.plan_key}</span>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Plano" value={subscription.plan_key} />
          <InfoRow label="Status" value={statusInfo.label} />
          <InfoRow label="Início" value={new Date(subscription.started_at).toLocaleDateString('pt-BR')} />
          {subscription.next_billing_at && (
            <InfoRow label="Próx. cobrança" value={new Date(subscription.next_billing_at).toLocaleDateString('pt-BR')} />
          )}
          {subscription.last_payment_id && (
            <InfoRow label="Último pagamento" value={subscription.last_payment_id.slice(0, 8) + '...'} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => navigate('/planos')}>
          <ArrowRight className="w-4 h-4 mr-1" /> Ver planos
        </Button>
        <Button variant="outline" onClick={() => navigate('/contato')}>
          <MessageCircle className="w-4 h-4 mr-1" /> Alterar / Cancelar (suporte)
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2, Users, Target, Repeat, Globe, CreditCard } from 'lucide-react';

interface ReferralOverviewData {
  total_users_with_links: number;
  users_with_referrals: number;
  total_direct_pros: number;
  total_recurring_pros: number;
  total_global_pros: number;
  active_subscriptions: number;
}

export function ReferralsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['referral-overview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_referral_overview');
      if (error) throw error;
      return data?.[0] as ReferralOverviewData | undefined;
    },
  });

  const cards = [
    {
      title: 'Links Ativos',
      value: data?.total_users_with_links ?? 0,
      icon: Link2,
      description: 'Usuários com código de indicação',
    },
    {
      title: 'Com Indicados',
      value: data?.users_with_referrals ?? 0,
      icon: Users,
      description: 'Usuários que já indicaram alguém',
    },
    {
      title: 'PROs Diretos',
      value: data?.total_direct_pros ?? 0,
      icon: Target,
      description: 'Gerados por compra via link',
    },
    {
      title: 'PROs Recorrentes',
      value: data?.total_recurring_pros ?? 0,
      icon: Repeat,
      description: 'De assinaturas ativas',
    },
    {
      title: 'PROs Globais',
      value: data?.total_global_pros ?? 0,
      icon: Globe,
      description: 'Distribuídos via FIFO',
    },
    {
      title: 'Assinaturas Ativas',
      value: data?.active_subscriptions ?? 0,
      icon: CreditCard,
      description: 'Gerando impacto recorrente',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{card.value.toLocaleString('pt-BR')}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

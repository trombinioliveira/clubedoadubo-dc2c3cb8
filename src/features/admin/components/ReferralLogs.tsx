import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tables, Json } from '@/integrations/supabase/types';

type ReferralLog = Tables<'referral_logs'>;

const eventTypeLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pro_direct_generated: { label: 'PRO Direto', variant: 'default' },
  pro_recurring_generated: { label: 'PRO Recorrente', variant: 'secondary' },
  pro_global_generated: { label: 'PRO Global', variant: 'outline' },
  fifo_position_changed: { label: 'Posição FIFO', variant: 'secondary' },
  meta_completed: { label: 'Meta Concluída', variant: 'default' },
  level_changed: { label: 'Nível Alterado', variant: 'secondary' },
  admin_manual_change: { label: 'Alteração Manual', variant: 'destructive' },
};

export function ReferralLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['referral-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name');
      if (error) throw error;
      return new Map(data?.map(p => [p.user_id, p.full_name]));
    },
  });

  const formatDetails = (details: Json | null): string => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      const obj = details as Record<string, unknown>;
      const parts: string[] = [];
      if (obj.amount) parts.push(`Valor: R$ ${obj.amount}`);
      if (obj.pro_code) parts.push(`PRO: ${obj.pro_code}`);
      if (obj.old_position !== undefined) parts.push(`Pos: ${obj.old_position} → ${obj.new_position}`);
      if (obj.old_level !== undefined) parts.push(`Nível: ${obj.old_level} → ${obj.new_level}`);
      if (obj.reason) parts.push(`Motivo: ${obj.reason}`);
      return parts.length > 0 ? parts.join(' | ') : JSON.stringify(details);
    }
    return String(details);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Histórico de Eventos</h3>
      
      {logs?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum evento registrado ainda
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => {
                const eventInfo = eventTypeLabels[log.event_type] || {
                  label: log.event_type,
                  variant: 'outline' as const,
                };
                const userName = profiles?.get(log.user_id) || 'Usuário';
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{userName}</TableCell>
                    <TableCell>
                      <Badge variant={eventInfo.variant}>{eventInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                      {formatDetails(log.details)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

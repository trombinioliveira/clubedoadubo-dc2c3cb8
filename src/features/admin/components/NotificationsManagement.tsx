import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Bell, RefreshCw, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TEMPLATE_LABELS: Record<string, string> = {
  purchase_confirmed: 'Compra aprovada',
  pro_credited: 'PRO creditado',
  pro_paid: 'PRO pago',
  fifo_moved: 'Fila avançou',
  dream_milestone: 'Marco do sonho',
};

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-gray-100 text-gray-600',
};

export function NotificationsManagement() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-notifications', statusFilter, templateFilter],
    queryFn: async () => {
      let query = supabase
        .from('notification_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (templateFilter !== 'all') query = query.eq('template', templateFilter);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const processQueue = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        method: 'POST',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Fila processada',
        description: `Enviados: ${data.sent || 0} | Falhas: ${data.failed || 0}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' });
    },
  });

  const retryNotification = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('notification_events')
        .update({ status: 'queued', error_message: null, retry_count: 0 })
        .eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Notificação reenfileirada' });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <Button
            onClick={() => processQueue.mutate()}
            disabled={processQueue.isPending}
            size="sm"
          >
            {processQueue.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Processar Fila
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="queued">Na fila</SelectItem>
                <SelectItem value="sent">Enviados</SelectItem>
                <SelectItem value="failed">Falhas</SelectItem>
                <SelectItem value="skipped">Ignorados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="purchase_confirmed">Compra</SelectItem>
                <SelectItem value="pro_credited">PRO creditado</SelectItem>
                <SelectItem value="pro_paid">PRO pago</SelectItem>
                <SelectItem value="fifo_moved">Fila</SelectItem>
                <SelectItem value="dream_milestone">Sonho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm">
                      {format(new Date(event.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{TEMPLATE_LABELS[event.template] || event.template}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[event.status] || ''}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {event.error_message || '—'}
                    </TableCell>
                    <TableCell>
                      {event.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryNotification.mutate(event.id)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reenviar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!events || events.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma notificação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

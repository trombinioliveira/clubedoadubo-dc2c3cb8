import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Bell, RefreshCw, Send, Loader2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TEMPLATE_LABELS: Record<string, string> = {
  signup_confirmation: 'Confirmação de cadastro',
  password_recovery: 'Recuperação de senha',
  welcome: 'Boas-vindas',
  first_cycle_entry: 'Entrada no ciclo',
  purchase_confirmed: 'Pagamento aprovado',
  payment_approved: 'Pagamento aprovado',
  payment_pending: 'Pagamento pendente',
  payment_failed: 'Pagamento não concluído',
  subscription_confirmed: 'Assinatura confirmada',
  contact_received: 'Contato recebido',
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

  // Stats
  const queuedCount = events?.filter(e => e.status === 'queued').length ?? 0;
  const sentCount = events?.filter(e => e.status === 'sent').length ?? 0;
  const failedCount = events?.filter(e => e.status === 'failed').length ?? 0;

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
      {/* Help text */}
      <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
        <span className="font-bold">ℹ️</span>
        <span>
          <strong>Notificações</strong> — Log operacional de todos os eventos de mensageria do sistema. 
          <strong> queued</strong> = aguardando envio, <strong>sent</strong> = enviado com sucesso, 
          <strong>failed</strong> = erro no envio (pode ser reenviado). O processamento automático roda a cada 2 minutos via pg_cron. 
          Use "Processar Fila" para forçar envio manual dos itens pendentes.
        </span>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{queuedCount}</p>
            <p className="text-xs text-muted-foreground">Na fila</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{sentCount}</p>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Falhas</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit info */}
      <Card className="border-primary/15 bg-primary/[0.02]">
        <CardContent className="p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Todos os e-mails enviados são copiados automaticamente para <strong>clubedoadubo@gmail.com</strong> como camada de auditoria.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription>Eventos de mensageria do sistema</CardDescription>
          </div>
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
          <div className="flex gap-4 mb-4 flex-wrap">
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
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="welcome">Boas-vindas</SelectItem>
                <SelectItem value="signup_confirmation">Confirmação cadastro</SelectItem>
                <SelectItem value="password_recovery">Recuperação senha</SelectItem>
                <SelectItem value="first_cycle_entry">Entrada no ciclo</SelectItem>
                <SelectItem value="purchase_confirmed">Pagamento aprovado</SelectItem>
                <SelectItem value="payment_pending">Pagamento pendente</SelectItem>
                <SelectItem value="payment_failed">Pagamento falhou</SelectItem>
                <SelectItem value="subscription_confirmed">Assinatura</SelectItem>
                <SelectItem value="contact_received">Contato</SelectItem>
                <SelectItem value="pro_credited">PRO creditado</SelectItem>
                <SelectItem value="pro_paid">PRO pago</SelectItem>
                <SelectItem value="fifo_moved">Fila avançou</SelectItem>
                <SelectItem value="dream_milestone">Marco sonho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm whitespace-nowrap">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

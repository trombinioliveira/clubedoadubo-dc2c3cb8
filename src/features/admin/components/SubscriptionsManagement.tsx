import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, CreditCard, ChevronLeft, ChevronRight, Copy, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_OPTIONS = [
  { value: 'plano_semente', label: 'Plano Semente' },
  { value: 'plano_muda', label: 'Plano Muda' },
  { value: 'plano_arvore', label: 'Plano Árvore' },
  { value: 'anual_semente', label: 'Anual Semente' },
  { value: 'anual_muda', label: 'Anual Muda' },
  { value: 'anual_arvore', label: 'Anual Árvore' },
  { value: 'assinatura_pros_semente', label: 'Assinatura PROs Semente' },
  { value: 'assinatura_pros_muda', label: 'Assinatura PROs Muda' },
  { value: 'assinatura_pros_arvore', label: 'Assinatura PROs Árvore' },
  { value: 'assinatura_granulado', label: 'Assinatura Granulado' },
  { value: 'assinatura_liquido', label: 'Assinatura Líquido' },
  { value: 'assinatura_combo', label: 'Assinatura Combo' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'canceled', label: 'Cancelado' },
];

const PAGE_SIZE = 25;

function getPlanLabel(key: string) {
  return PLAN_OPTIONS.find(p => p.value === key)?.label || key;
}

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  const label = opt?.label || status;
  const variant =
    status === 'active' ? 'default'
    : status === 'paused' ? 'secondary'
    : status === 'canceled' ? 'destructive'
    : 'secondary';
  return <Badge variant={variant}>{label}</Badge>;
}

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_key: string;
  status: string;
  started_at: string;
  last_payment_id: string | null;
  updated_at: string;
  profiles: { full_name: string; email: string } | null;
};

type LogRow = {
  id: string;
  changed_at: string;
  old_plan_key: string | null;
  new_plan_key: string | null;
  old_status: string | null;
  new_status: string | null;
  reason: string | null;
  admin_user_id: string;
  admin: { full_name: string; email: string } | null;
};

export function SubscriptionsManagement() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [page, setPage] = useState(0);

  // Modal
  const [editingSub, setEditingSub] = useState<SubscriptionRow | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Fetch subscriptions + profiles (no FK, so fetch separately)
  const { data: subsData, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', search, filterStatus, filterPlan, page],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filterStatus !== 'all') query = query.eq('status', filterStatus);
      if (filterPlan !== 'all') query = query.eq('plan_key', filterPlan);

      const { data, error, count } = await query;
      if (error) throw error;

      // Fetch profiles for user_ids
      const userIds = (data || []).map((s: any) => s.user_id).filter(Boolean);
      let profilesMap: Record<string, { full_name: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        if (profiles) {
          for (const p of profiles) {
            profilesMap[p.user_id] = { full_name: p.full_name, email: p.email };
          }
        }
      }

      const rows = (data || []).map((s: any) => ({
        ...s,
        profiles: profilesMap[s.user_id] || null,
      })) as unknown as SubscriptionRow[];

      // Client-side search filter on profile name/email
      let filtered = rows;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = rows.filter(r =>
          r.profiles?.full_name?.toLowerCase().includes(q) ||
          r.profiles?.email?.toLowerCase().includes(q)
        );
      }

      return { rows: filtered, count: count || 0 };
    },
  });

  // Fetch logs + admin profiles (no FK, fetch separately)
  const { data: logs } = useQuery({
    queryKey: ['subscription-logs', editingSub?.id],
    enabled: !!editingSub,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_logs')
        .select('*')
        .eq('subscription_id', editingSub!.id)
        .order('changed_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      // Fetch admin profiles
      const adminIds = [...new Set((data || []).map((l: any) => l.admin_user_id).filter(Boolean))];
      let adminMap: Record<string, { full_name: string; email: string }> = {};
      if (adminIds.length > 0) {
        const { data: admins } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', adminIds);
        if (admins) {
          for (const a of admins) {
            adminMap[a.user_id] = { full_name: a.full_name, email: a.email };
          }
        }
      }

      return (data || []).map((l: any) => ({
        ...l,
        admin: adminMap[l.admin_user_id] || null,
      })) as unknown as LogRow[];
    },
  });

  // Mutation (admin only)
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingSub) throw new Error('No subscription');
      const oldPlan = editingSub.plan_key;
      const oldStatus = editingSub.status;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error: updateErr } = await supabase
        .from('subscriptions')
        .update({ plan_key: editPlan, status: editStatus, updated_at: new Date().toISOString() })
        .eq('id', editingSub.id);
      if (updateErr) throw updateErr;

      const { error: logErr } = await supabase
        .from('subscription_logs')
        .insert({
          subscription_id: editingSub.id,
          admin_user_id: user.id,
          old_plan_key: oldPlan,
          new_plan_key: editPlan,
          old_status: oldStatus,
          new_status: editStatus,
          reason: editReason || null,
        });
      if (logErr) throw logErr;
    },
    onSuccess: () => {
      toast.success('Assinatura atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-logs'] });
      setEditingSub(null);
      setConfirmCancel(false);
    },
    onError: (err: Error) => toast.error(`Erro: ${err.message}`),
  });

  const openEdit = (sub: SubscriptionRow) => {
    setEditingSub(sub);
    setEditPlan(sub.plan_key);
    setEditStatus(sub.status);
    setEditReason('');
    setConfirmCancel(false);
  };

  const handleSave = () => {
    if (editStatus === 'canceled' && editingSub?.status !== 'canceled' && !confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    updateMutation.mutate();
  };

  function getAdminLabel(log: LogRow) {
    if (log.admin?.full_name) return log.admin.full_name;
    if (log.admin?.email) return log.admin.email;
    return log.admin_user_id?.slice(0, 8) + '…';
  }

  const rows = subsData?.rows || [];
  const totalCount = subsData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Assinaturas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(0); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPlan} onValueChange={v => { setFilterPlan(v); setPage(0); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Plano" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos planos</SelectItem>
              {PLAN_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma assinatura encontrada.</p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Último Pgto</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.profiles?.full_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sub.profiles?.email || '—'}</TableCell>
                      <TableCell>{getPlanLabel(sub.plan_key)}</TableCell>
                      <TableCell><StatusBadge status={sub.status} /></TableCell>
                      <TableCell className="text-sm">{format(new Date(sub.started_at), 'dd/MM/yy', { locale: ptBR })}</TableCell>
                      <TableCell>
                        {sub.last_payment_id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs font-mono"
                            onClick={() => { navigator.clipboard.writeText(sub.last_payment_id!); toast.info('ID copiado'); }}
                          >
                            {sub.last_payment_id.slice(0, 8)}… <Copy className="w-3 h-3 ml-1" />
                          </Button>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">{format(new Date(sub.updated_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(sub)}
                        >
                          {isAdmin ? 'Editar' : 'Ver'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">{totalCount} assinatura(s)</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">{page + 1} / {totalPages || 1}</span>
                <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Edit / View Modal */}
        <Dialog open={!!editingSub} onOpenChange={open => { if (!open) { setEditingSub(null); setConfirmCancel(false); } }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isAdmin ? 'Editar' : 'Detalhes da'} Assinatura</DialogTitle>
            </DialogHeader>

            {editingSub && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{editingSub.profiles?.full_name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{editingSub.profiles?.email || '—'}</p>
                </div>

                {/* Plan */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Plano</label>
                  <Select value={editPlan} onValueChange={setEditPlan} disabled={!isAdmin}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editStatus} onValueChange={v => { setEditStatus(v); setConfirmCancel(false); }} disabled={!isAdmin}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason (admin only) */}
                {isAdmin && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Motivo (opcional)</label>
                    <Textarea value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Motivo da alteração..." rows={2} />
                  </div>
                )}

                {/* Cancel confirmation */}
                {confirmCancel && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Tem certeza que deseja cancelar esta assinatura?</p>
                      <p className="text-xs text-muted-foreground">Esta ação será registrada no histórico.</p>
                    </div>
                  </div>
                )}

                {/* Footer – admin only */}
                {isAdmin && (
                  <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => { setEditingSub(null); setConfirmCancel(false); }}>Voltar</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                      {confirmCancel ? 'Confirmar cancelamento' : 'Salvar'}
                    </Button>
                  </DialogFooter>
                )}

                {/* History */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-2">Histórico de alterações</h4>
                  {!logs || logs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma alteração manual registrada.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {logs.map((log: LogRow) => (
                        <div key={log.id} className="text-xs border rounded p-2 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground">{format(new Date(log.changed_at), "dd/MM/yy HH:mm", { locale: ptBR })}</p>
                            <p className="text-muted-foreground font-medium">{getAdminLabel(log)}</p>
                          </div>
                          {(log.old_plan_key !== log.new_plan_key) && (
                            <p>Plano: <span className="line-through">{getPlanLabel(log.old_plan_key || '')}</span> → <span className="font-medium">{getPlanLabel(log.new_plan_key || '')}</span></p>
                          )}
                          {(log.old_status !== log.new_status) && (
                            <p>Status: <span className="line-through">{log.old_status}</span> → <span className="font-medium">{log.new_status}</span></p>
                          )}
                          {log.reason && <p className="italic text-muted-foreground">"{log.reason}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

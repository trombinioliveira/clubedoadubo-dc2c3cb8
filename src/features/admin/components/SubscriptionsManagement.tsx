import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, CreditCard, ChevronLeft, ChevronRight, Copy, AlertTriangle, Info, Package } from 'lucide-react';
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
  mp_preapproval_id: string | null;
  current_cycle: number;
  pros_per_cycle: number;
  next_billing_at: string | null;
  cancelled_at: string | null;
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

type CreditRow = {
  id: string;
  product_key: string | null;
  quantity_total: number;
  quantity_remaining: number;
  source: string;
  created_at: string;
};

export function SubscriptionsManagement() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [page, setPage] = useState(0);
  const [editingSub, setEditingSub] = useState<SubscriptionRow | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: subsData, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', search, filterStatus, filterPlan, page],
    queryFn: async () => {
      let query = supabase.from('subscriptions').select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (filterStatus !== 'all') query = query.eq('status', filterStatus);
      if (filterPlan !== 'all') query = query.eq('plan_key', filterPlan);
      const { data, error, count } = await query;
      if (error) throw error;
      const userIds = (data || []).map((s: any) => s.user_id).filter(Boolean);
      let profilesMap: Record<string, { full_name: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, email').in('user_id', userIds);
        if (profiles) for (const p of profiles) profilesMap[p.user_id] = { full_name: p.full_name, email: p.email };
      }
      const rows = (data || []).map((s: any) => ({ ...s, profiles: profilesMap[s.user_id] || null })) as unknown as SubscriptionRow[];
      let filtered = rows;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = rows.filter(r => r.profiles?.full_name?.toLowerCase().includes(q) || r.profiles?.email?.toLowerCase().includes(q));
      }
      return { rows: filtered, count: count || 0 };
    },
  });

  const { data: logs } = useQuery({
    queryKey: ['subscription-logs', editingSub?.id],
    enabled: !!editingSub,
    queryFn: async () => {
      const { data, error } = await supabase.from('subscription_logs').select('*')
        .eq('subscription_id', editingSub!.id).order('changed_at', { ascending: false }).limit(50);
      if (error) throw error;
      const adminIds = [...new Set((data || []).map((l: any) => l.admin_user_id).filter(Boolean))];
      let adminMap: Record<string, { full_name: string; email: string }> = {};
      if (adminIds.length > 0) {
        const { data: admins } = await supabase.from('profiles').select('user_id, full_name, email').in('user_id', adminIds);
        if (admins) for (const a of admins) adminMap[a.user_id] = { full_name: a.full_name, email: a.email };
      }
      return (data || []).map((l: any) => ({ ...l, admin: adminMap[l.admin_user_id] || null })) as unknown as LogRow[];
    },
  });

  // Credits for this subscription's user
  const { data: credits } = useQuery({
    queryKey: ['subscription-credits', editingSub?.user_id],
    enabled: !!editingSub,
    queryFn: async () => {
      const { data, error } = await supabase.from('pro_credits')
        .select('id, product_key, quantity_total, quantity_remaining, source, created_at')
        .eq('user_id', editingSub!.user_id)
        .order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []) as CreditRow[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingSub) throw new Error('No subscription');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error: updateErr } = await supabase.from('subscriptions')
        .update({ plan_key: editPlan, status: editStatus, updated_at: new Date().toISOString() }).eq('id', editingSub.id);
      if (updateErr) throw updateErr;
      const { error: logErr } = await supabase.from('subscription_logs').insert({
        subscription_id: editingSub.id, admin_user_id: user.id,
        old_plan_key: editingSub.plan_key, new_plan_key: editPlan,
        old_status: editingSub.status, new_status: editStatus, reason: editReason || null,
      });
      if (logErr) throw logErr;
    },
    onSuccess: () => {
      toast.success('Assinatura atualizada');
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-logs'] });
      setEditingSub(null); setConfirmCancel(false);
    },
    onError: (err: Error) => toast.error(`Erro: ${err.message}`),
  });

  const openEdit = (sub: SubscriptionRow) => {
    setEditingSub(sub); setEditPlan(sub.plan_key); setEditStatus(sub.status); setEditReason(''); setConfirmCancel(false);
  };

  const handleSave = () => {
    if (editStatus === 'canceled' && editingSub?.status !== 'canceled' && !confirmCancel) { setConfirmCancel(true); return; }
    updateMutation.mutate();
  };

  const rows = subsData?.rows || [];
  const totalCount = subsData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Assinaturas</strong> — Gestão completa das assinaturas recorrentes. Cada assinatura gera créditos (pro_credits) que são 
          convertidos automaticamente em PROs pela Edge Function <code>convert-pro-credits</code> a cada 5 minutos.
          <ul className="mt-1 ml-4 list-disc text-xs space-y-0.5">
            <li><strong>Ativa</strong>: cobrança recorrente em andamento</li>
            <li><strong>Pausada</strong>: cobrança suspensa temporariamente</li>
            <li><strong>Cancelada</strong>: assinatura encerrada definitivamente</li>
          </ul>
          Toda alteração é registrada em <code>subscription_logs</code> com o admin responsável.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Assinaturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
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

          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma assinatura encontrada.</p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ciclo</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(sub => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{sub.profiles?.full_name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{sub.profiles?.email || '—'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanLabel(sub.plan_key)}</TableCell>
                        <TableCell><StatusBadge status={sub.status} /></TableCell>
                        <TableCell className="text-sm">#{sub.current_cycle}</TableCell>
                        <TableCell className="text-sm">{format(new Date(sub.started_at), 'dd/MM/yy', { locale: ptBR })}</TableCell>
                        <TableCell className="text-sm">{format(new Date(sub.updated_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openEdit(sub)}>
                            {isAdmin ? 'Detalhes' : 'Ver'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">{totalCount} assinatura(s)</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-sm">{page + 1} / {totalPages || 1}</span>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
          )}

          {/* Detailed Modal */}
          <Dialog open={!!editingSub} onOpenChange={open => { if (!open) { setEditingSub(null); setConfirmCancel(false); } }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isAdmin ? 'Detalhes e Edição' : 'Detalhes da'} Assinatura</DialogTitle>
              </DialogHeader>
              {editingSub && (
                <div className="space-y-5">
                  {/* User info */}
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">{editingSub.profiles?.full_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{editingSub.profiles?.email || '—'}</p>
                  </div>

                  {/* Subscription details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Referência MP</p>
                      <p className="font-mono text-xs">{editingSub.mp_preapproval_id || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ciclo atual</p>
                      <p className="font-bold">#{editingSub.current_cycle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PROs por ciclo</p>
                      <p className="font-bold">{editingSub.pros_per_cycle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Próxima cobrança</p>
                      <p className="text-xs">{editingSub.next_billing_at ? format(new Date(editingSub.next_billing_at), 'dd/MM/yy HH:mm', { locale: ptBR }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Último pagamento</p>
                      <p className="font-mono text-xs">
                        {editingSub.last_payment_id ? (
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-mono"
                            onClick={() => { navigator.clipboard.writeText(editingSub.last_payment_id!); toast.info('ID copiado'); }}>
                            {editingSub.last_payment_id.slice(0, 12)}… <Copy className="w-3 h-3 ml-1" />
                          </Button>
                        ) : '—'}
                      </p>
                    </div>
                    {editingSub.cancelled_at && (
                      <div>
                        <p className="text-xs text-muted-foreground">Cancelada em</p>
                        <p className="text-xs text-destructive">{format(new Date(editingSub.cancelled_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</p>
                      </div>
                    )}
                  </div>

                  {/* Edit controls (admin only) */}
                  {isAdmin && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Plano</label>
                          <Select value={editPlan} onValueChange={setEditPlan}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{PLAN_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Status</label>
                          <Select value={editStatus} onValueChange={v => { setEditStatus(v); setConfirmCancel(false); }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Motivo (opcional)</label>
                        <Textarea value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Motivo da alteração..." rows={2} />
                      </div>
                      {confirmCancel && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30">
                          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-destructive">Tem certeza que deseja cancelar esta assinatura?</p>
                            <p className="text-xs text-muted-foreground">Esta ação será registrada no histórico.</p>
                          </div>
                        </div>
                      )}
                      <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => { setEditingSub(null); setConfirmCancel(false); }}>Voltar</Button>
                        <Button onClick={handleSave} disabled={updateMutation.isPending}>
                          {confirmCancel ? 'Confirmar cancelamento' : 'Salvar'}
                        </Button>
                      </DialogFooter>
                    </>
                  )}

                  {/* Credits */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Créditos gerados
                    </h4>
                    {!credits || credits.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum crédito encontrado para este usuário.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {credits.map(c => (
                          <div key={c.id} className="text-xs p-2 bg-muted/30 rounded flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{c.product_key || c.source}</Badge>
                              <span>{c.quantity_remaining}/{c.quantity_total} restantes</span>
                            </div>
                            <span className="text-muted-foreground">{format(new Date(c.created_at), 'dd/MM/yy', { locale: ptBR })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* History */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Histórico de alterações</h4>
                    {!logs || logs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhuma alteração registrada.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {logs.map((log: LogRow) => (
                          <div key={log.id} className="text-xs p-2 bg-muted/30 rounded space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{log.admin?.full_name || log.admin_user_id?.slice(0, 8)}</span>
                              <span className="text-muted-foreground">{format(new Date(log.changed_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {log.old_status !== log.new_status && (
                                <span>{log.old_status} → <strong>{log.new_status}</strong></span>
                              )}
                              {log.old_plan_key !== log.new_plan_key && (
                                <span>{getPlanLabel(log.old_plan_key || '')} → <strong>{getPlanLabel(log.new_plan_key || '')}</strong></span>
                              )}
                            </div>
                            {log.reason && <p className="text-muted-foreground italic">"{log.reason}"</p>}
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
    </div>
  );
}

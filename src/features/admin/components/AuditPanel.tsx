import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, Plus, CheckCircle2, AlertTriangle, Clock, Eye, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ROUTES = [
  { route: '/', name: 'Home / Landing' },
  { route: '/planos', name: 'Planos & Compra' },
  { route: '/faq', name: 'FAQ' },
  { route: '/transparencia', name: 'Transparência' },
  { route: '/contato', name: 'Contato' },
  { route: '/economia-circular', name: 'Economia Circular' },
  { route: '/termos', name: 'Termos de Uso' },
  { route: '/politica-de-privacidade', name: 'Política de Privacidade' },
  { route: '/politica-de-riscos', name: 'Política de Riscos' },
  { route: '/natureza-do-pro', name: 'Natureza do PRO' },
  { route: '/painel-publico', name: 'Painel Público' },
  { route: '/compra/sucesso', name: 'Checkout Sucesso' },
  { route: '/compra/pendente', name: 'Checkout Pendente' },
  { route: '/compra/erro', name: 'Checkout Erro' },
  { route: '/auth', name: 'Login / Cadastro' },
  { route: '/alterar-senha', name: 'Alterar Senha' },
  { route: '/u/:codigo', name: 'Perfil Público' },
  { route: '/ponto/:slug', name: 'Ponto de Coleta' },
  { route: '/jornada', name: 'Minha Jornada' },
  { route: '/ciclo', name: 'Ciclo' },
  { route: '/dreams', name: 'Sonhos' },
  { route: '/assinatura', name: 'Assinatura' },
  { route: '/fifo', name: 'Minha Participação' },
  { route: '/indicacoes', name: 'Indicações' },
  { route: '/perfil', name: 'Meu Perfil' },
  { route: '/admin', name: 'Painel Admin' },
];

type AuditStatus = 'not_reviewed' | 'in_review' | 'approved' | 'needs_fix';

interface AuditReview {
  id: string;
  route: string;
  route_name: string;
  status: string;
  notes: string;
  updated_at: string;
}

interface AuditIssue {
  id: string;
  route: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<AuditStatus, { label: string; color: string; icon: React.ReactNode }> = {
  not_reviewed: { label: 'Não revisada', color: 'bg-muted text-muted-foreground', icon: <Clock className="w-3 h-3" /> },
  in_review: { label: 'Em revisão', color: 'bg-yellow-100 text-yellow-800', icon: <Eye className="w-3 h-3" /> },
  approved: { label: 'Aprovada', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
  needs_fix: { label: 'Precisa ajuste', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> },
};

export function AuditPanel() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<AuditReview[]>([]);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [issueDialog, setIssueDialog] = useState<string | null>(null);
  const [newIssue, setNewIssue] = useState({ description: '', severity: 'medium' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [reviewsRes, issuesRes] = await Promise.all([
      supabase.from('audit_reviews').select('*').order('route'),
      supabase.from('audit_issues').select('*').order('created_at', { ascending: false }),
    ]);
    setReviews((reviewsRes.data as AuditReview[] | null) ?? []);
    setIssues((issuesRes.data as AuditIssue[] | null) ?? []);
    setLoading(false);
  }

  async function upsertReview(route: string, routeName: string, status: AuditStatus, notes?: string) {
    const existing = reviews.find(r => r.route === route);
    if (existing) {
      const updateData: Record<string, unknown> = { status, updated_by: user?.id };
      if (notes !== undefined) updateData.notes = notes;
      await supabase.from('audit_reviews').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('audit_reviews').insert({
        route, route_name: routeName, status, notes: notes || '', updated_by: user?.id,
      });
    }
    await loadData();
    toast({ title: 'Status atualizado' });
  }

  async function saveNotes(route: string, routeName: string, notes: string) {
    const existing = reviews.find(r => r.route === route);
    if (existing) {
      await supabase.from('audit_reviews').update({ notes, updated_by: user?.id }).eq('id', existing.id);
    } else {
      await supabase.from('audit_reviews').insert({ route, route_name: routeName, notes, updated_by: user?.id });
    }
    await loadData();
    toast({ title: 'Notas salvas' });
  }

  async function createIssue(route: string) {
    if (!newIssue.description.trim()) return;
    await supabase.from('audit_issues').insert({
      route, description: newIssue.description, severity: newIssue.severity, created_by: user?.id,
    });
    setNewIssue({ description: '', severity: 'medium' });
    setIssueDialog(null);
    await loadData();
    toast({ title: 'Issue registrada' });
  }

  async function resolveIssue(issueId: string) {
    await supabase.from('audit_issues').update({
      status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: user?.id,
    }).eq('id', issueId);
    await loadData();
    toast({ title: 'Issue resolvida' });
  }

  const getReview = (route: string) => reviews.find(r => r.route === route);
  const getIssues = (route: string) => issues.filter(i => i.route === route && i.status === 'open');

  const stats = {
    total: ROUTES.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    needsFix: reviews.filter(r => r.status === 'needs_fix').length,
    inReview: reviews.filter(r => r.status === 'in_review').length,
    notReviewed: ROUTES.length - reviews.length + reviews.filter(r => r.status === 'not_reviewed').length,
    openIssues: issues.filter(i => i.status === 'open').length,
  };

  const filteredRoutes = ROUTES.filter(r => {
    const review = getReview(r.route);
    const status = review?.status || 'not_reviewed';
    if (filter !== 'all' && status !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.route.includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.approved}</p><p className="text-xs text-muted-foreground">Aprovadas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.needsFix}</p><p className="text-xs text-muted-foreground">Ajustes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.inReview}</p><p className="text-xs text-muted-foreground">Em revisão</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-muted-foreground">{stats.notReviewed}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{stats.openIssues}</p><p className="text-xs text-muted-foreground">Issues</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar rota…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="not_reviewed">Não revisadas</SelectItem>
            <SelectItem value="in_review">Em revisão</SelectItem>
            <SelectItem value="approved">Aprovadas</SelectItem>
            <SelectItem value="needs_fix">Precisa ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Route list */}
      <div className="space-y-3">
        {filteredRoutes.map(({ route, name }) => {
          const review = getReview(route);
          const status = (review?.status || 'not_reviewed') as AuditStatus;
          const routeIssues = getIssues(route);
          const cfg = statusConfig[status];

          return (
            <Card key={route} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Route info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">{name}</h3>
                      <Badge variant="outline" className="font-mono text-xs">{route}</Badge>
                      <Badge className={`${cfg.color} gap-1`}>{cfg.icon}{cfg.label}</Badge>
                      {routeIssues.length > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />{routeIssues.length} issue{routeIssues.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select value={status} onValueChange={(v) => upsertReview(route, name, v as AuditStatus)}>
                      <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_reviewed">Não revisada</SelectItem>
                        <SelectItem value="in_review">Em revisão</SelectItem>
                        <SelectItem value="approved">Aprovada</SelectItem>
                        <SelectItem value="needs_fix">Precisa ajuste</SelectItem>
                      </SelectContent>
                    </Select>

                    <a href={route.includes(':') ? '#' : route} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" disabled={route.includes(':')}><ExternalLink className="w-3 h-3" /></Button>
                    </a>

                    <Dialog open={issueDialog === route} onOpenChange={(o) => setIssueDialog(o ? route : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><Plus className="w-3 h-3" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Registrar issue — {name}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <Textarea placeholder="Descreva o problema…" value={newIssue.description} onChange={e => setNewIssue(p => ({ ...p, description: e.target.value }))} />
                          <Select value={newIssue.severity} onValueChange={v => setNewIssue(p => ({ ...p, severity: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="critical">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={() => createIssue(route)} className="w-full">Registrar issue</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  <Textarea
                    placeholder="Notas de auditoria…"
                    className="text-sm min-h-[60px]"
                    defaultValue={review?.notes || ''}
                    onBlur={e => {
                      const val = e.target.value;
                      if (val !== (review?.notes || '')) saveNotes(route, name, val);
                    }}
                  />
                </div>

                {/* Issues */}
                {routeIssues.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {routeIssues.map(issue => (
                      <div key={issue.id} className="flex items-start gap-2 p-2 bg-destructive/5 rounded text-sm">
                        <Badge variant={issue.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs shrink-0">
                          {issue.severity}
                        </Badge>
                        <p className="flex-1 text-foreground">{issue.description}</p>
                        <Button variant="ghost" size="sm" onClick={() => resolveIssue(issue.id)} className="text-xs shrink-0">
                          Resolver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

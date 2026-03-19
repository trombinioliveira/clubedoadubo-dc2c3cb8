import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Loader2, CheckCircle2, ExternalLink, ShieldAlert, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ResetResult {
  success: boolean;
  message: string;
  counts: Record<string, { before: number }>;
  seeds: string[];
  preserved: string[];
}

export function ResetSandbox() {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState<ResetResult | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  const { data: envMode, isLoading: envLoading } = useQuery({
    queryKey: ['site-settings', 'env_mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'env_mode')
        .single();
      if (error) return 'unknown';
      const value = data?.value;
      const mode = value && typeof value === 'object' && 'mode' in value ? (value as { mode?: string }).mode : undefined;
      return mode || 'production';
    },
  });

  const isProduction = envMode === 'production';
  const canReset = check1 && check2 && check3 && confirmText === 'RESET' && !isProduction && !isResetting;

  const handleReset = async () => {
    if (!canReset) return;
    setIsResetting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada');
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/reset-sandbox`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            confirmation: 'RESET',
            idempotency_key: `reset_${Date.now()}`,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao executar reset');
        return;
      }

      setResult(data);
      setResultOpen(true);
      toast.success('Reset pré-go-live concluído!');
      setCheck1(false);
      setCheck2(false);
      setCheck3(false);
      setConfirmText('');
    } catch (err) {
      toast.error('Erro de conexão ao executar reset');
    } finally {
      setIsResetting(false);
    }
  };

  if (envLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Help block */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>O que esta área faz</AlertTitle>
        <AlertDescription className="space-y-1 text-sm">
          <p>Limpa <strong>todo o ambiente operacional</strong> (PROs, vendas, pesagens, sonhos, assinaturas, notificações, comissões, ledger, logs) deixando o sistema com zero quantidades para recomeço limpo.</p>
          <p><strong>Quando usar:</strong> Antes do go-live, para garantir que nenhum dado de teste contamine a operação real.</p>
          <p><strong>O que preserva:</strong> Usuários (profiles), roles, pontos de coleta, pontos de venda, missões, comissão levels e configurações do site.</p>
          <p><strong>O que desliga:</strong> A automação de geração de PROs é desativada automaticamente após o reset.</p>
        </AlertDescription>
      </Alert>

      {/* Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Zona de Perigo — Operação Excepcional</AlertTitle>
        <AlertDescription>
          Esta ação apagará <strong>todos os dados operacionais e econômicos</strong> do banco. Fila FIFO, PROs, vendas, distribuições, assinaturas, comissões, notificações e histórico transacional serão zerados permanentemente. Usuários e configurações estruturais serão mantidos.
        </AlertDescription>
      </Alert>

      {/* Environment check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Ambiente Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Modo:</span>
            <Badge variant={isProduction ? 'destructive' : 'secondary'}>
              {envMode || 'desconhecido'}
            </Badge>
          </div>
          {isProduction && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Reset <strong>bloqueado</strong> em modo produção. Altere o env_mode para "sandbox" na aba Site antes de continuar.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Scope */}
      <Card>
        <CardHeader>
          <CardTitle>Escopo da Limpeza</CardTitle>
          <CardDescription>O que será apagado e o que será preservado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-destructive mb-2">🗑️ Será apagado</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {[
                  'pros, fifo_queue (fila e participações)',
                  'pro_credits, pro_activations (créditos e ativações)',
                  'pro_generation_logs (logs de geração)',
                  'financial_entries (entradas financeiras)',
                  'sale_distributions, pro_payouts (distribuições e pagamentos)',
                  'subscriptions, subscription_logs (assinaturas)',
                  'referral_stats, referral_logs (indicações e comissões)',
                  'notification_events, notification_preferences',
                  'dreams (sonhos dos usuários)',
                  'weighings, batches, distributions (operação de campo)',
                  'system_ledger (trilha econômica)',
                  'audit_issues, audit_reviews',
                  'terms_acceptance, otp_codes, export_logs',
                  'auto_gen_config → desligada',
                  'profiles: saldos, créditos e contadores → zero',
                ].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2">✅ Será preservado</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {[
                  'profiles (identidade e acesso)',
                  'user_roles (papéis admin/staff/client)',
                  'commission_levels (regras de comissão)',
                  'collection_points (cadastro estrutural)',
                  'sales_points (cadastro estrutural)',
                  'impact_missions (configuração de missões)',
                  'site_settings (configuração do site)',
                  'reset_logs (histórico de resets)',
                ].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmations */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Pré-Go-Live</CardTitle>
          <CardDescription>
            Zera o ambiente operacional preservando usuários e configuração estrutural. A automação de PROs será desligada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="check1"
                checked={check1}
                onCheckedChange={(v) => setCheck1(!!v)}
                disabled={isProduction}
              />
              <label htmlFor="check1" className="text-sm leading-5 cursor-pointer">
                Entendo que isso <strong>apagará permanentemente</strong> todos os dados operacionais, econômicos e transacionais do sistema
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="check2"
                checked={check2}
                onCheckedChange={(v) => setCheck2(!!v)}
                disabled={isProduction}
              />
              <label htmlFor="check2" className="text-sm leading-5 cursor-pointer">
                Confirmo que estou em <strong>ambiente sandbox</strong> e que este reset é intencional para preparar o go-live
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="check3"
                checked={check3}
                onCheckedChange={(v) => setCheck3(!!v)}
                disabled={isProduction}
              />
              <label htmlFor="check3" className="text-sm leading-5 cursor-pointer">
                Entendo que a <strong>automação de PROs será desligada</strong> e precisará ser reativada manualmente após o reset
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Digite <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">RESET</code> para confirmar:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite RESET"
                className="max-w-xs font-mono"
                disabled={isProduction}
              />
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={!canReset}
            className="w-full sm:w-auto"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executando Reset Pré-Go-Live...
              </>
            ) : (
              'Executar Reset Pré-Go-Live'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Modal */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Reset Pré-Go-Live Concluído
            </DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-6">
              {/* Counts table */}
              <div>
                <h4 className="text-sm font-medium mb-2">Registros Apagados</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tabela</TableHead>
                        <TableHead className="text-right">Registros removidos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(result.counts)
                        .filter(([, v]) => v.before > 0)
                        .map(([table, v]) => (
                          <TableRow key={table}>
                            <TableCell className="font-mono text-xs">{table}</TableCell>
                            <TableCell className="text-right font-mono">{v.before}</TableCell>
                          </TableRow>
                        ))}
                      {Object.values(result.counts).every((v) => v.before === 0) && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            Ambiente já estava limpo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Preserved */}
              {result.preserved && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Preservado</h4>
                  <ul className="text-sm space-y-1">
                    {result.preserved.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Seeds */}
              <div>
                <h4 className="text-sm font-medium mb-2">Ações de Reinicialização</h4>
                <ul className="text-sm space-y-1">
                  {result.seeds.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Test checklist */}
              <div>
                <h4 className="text-sm font-medium mb-3">Próximos Passos — Smoke Test</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Abastecer a fila do ciclo com PROs iniciais (manual ou automação)</li>
                  <li>Criar compra de R$1 via <a href="/planos" className="text-primary underline inline-flex items-center gap-1">Planos <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Confirmar webhook registrou em financial_entries</li>
                  <li>Verificar sale_distributions e pro_payouts</li>
                  <li>Validar KPIs no <a href="/painel-publico" className="text-primary underline inline-flex items-center gap-1">Painel Público <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Validar fila em <a href="/fila" className="text-primary underline inline-flex items-center gap-1">/fila <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Reativar automação de PROs se necessário</li>
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

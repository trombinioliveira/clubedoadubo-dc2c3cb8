import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, Plus, Package, CheckCircle2, History, Info,
  Play, Square, AlertTriangle, Activity, RefreshCw, Server,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AutoGenConfig {
  active: boolean;
  quantity_per_cycle: number;
  interval_minutes: number;
  started_by: string | null;
  started_at: string | null;
  total_generated: number;
  last_execution: string | null;
  last_error: string | null;
}

const DEFAULT_CONFIG: AutoGenConfig = {
  active: false,
  quantity_per_cycle: 100,
  interval_minutes: 10,
  started_by: null,
  started_at: null,
  total_generated: 0,
  last_execution: null,
  last_error: null,
};

interface GenLog {
  id: string;
  execution_type: string;
  quantity_generated: number;
  quantity_requested: number;
  config_quantity_per_cycle: number | null;
  config_interval_minutes: number | null;
  executed_by: string | null;
  status: string;
  error_message: string | null;
  cumulative_total: number;
  created_at: string;
}

export function GenerateProsPanel() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [poolCount, setPoolCount] = useState(0);
  const [totalPros, setTotalPros] = useState(0);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [lastGeneration, setLastGeneration] = useState<{ count: number; codes: string[] } | null>(null);

  // Auto-generation state
  const [autoConfig, setAutoConfig] = useState<AutoGenConfig>(DEFAULT_CONFIG);
  const [autoQty, setAutoQty] = useState('100');
  const [autoInterval, setAutoInterval] = useState('10');
  const [isToggling, setIsToggling] = useState(false);

  // Logs
  const [logs, setLogs] = useState<GenLog[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [poolRes, totalRes, configRes, logsRes] = await Promise.all([
        supabase.from('pros').select('id', { count: 'exact', head: true })
          .eq('user_id', 'b22080a1-ca50-4770-974d-57c9d198a5dd').eq('status', 'pending'),
        supabase.from('pros').select('id', { count: 'exact', head: true }),
        supabase.from('site_settings').select('value').eq('key', 'auto_gen_config').single(),
        supabase.from('pro_generation_logs' as any).select('*').order('created_at', { ascending: false }).limit(30) as any,
      ]);

      setPoolCount(poolRes.count ?? 0);
      setTotalPros(totalRes.count ?? 0);
      
      if (configRes.data?.value) {
        const val = configRes.data.value as any;
        setAutoConfig({
          active: val.active ?? false,
          quantity_per_cycle: val.quantity_per_cycle ?? 100,
          interval_minutes: val.interval_minutes ?? 10,
          started_by: val.started_by ?? null,
          started_at: val.started_at ?? null,
          total_generated: val.total_generated ?? 0,
          last_execution: val.last_execution ?? null,
          last_error: val.last_error ?? null,
        });
        setAutoQty(String(val.quantity_per_cycle ?? 100));
        setAutoInterval(String(val.interval_minutes ?? 10));
      }

      setLogs((logsRes.data ?? []) as unknown as GenLog[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 30 seconds to show backend execution updates
  useEffect(() => {
    if (!autoConfig.active) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [autoConfig.active, loadData]);

  const toggleAutoGeneration = async (activate: boolean) => {
    if (!user) return;
    setIsToggling(true);

    try {
      const qty = parseInt(autoQty) || 100;
      const interval = parseInt(autoInterval) || 10;

      if (activate && (qty < 1 || qty > 10000)) {
        toast.error('Quantidade por ciclo deve ser entre 1 e 10.000');
        return;
      }
      if (activate && (interval < 1 || interval > 1440)) {
        toast.error('Intervalo deve ser entre 1 e 1440 minutos');
        return;
      }

      const newConfig: AutoGenConfig = {
        active: activate,
        quantity_per_cycle: qty,
        interval_minutes: interval,
        started_by: activate ? user.id : autoConfig.started_by,
        started_at: activate ? new Date().toISOString() : autoConfig.started_at,
        total_generated: activate ? 0 : autoConfig.total_generated,
        last_execution: activate ? null : autoConfig.last_execution,
        last_error: null,
      };

      // Upsert config
      const { error } = await supabase.from('site_settings').upsert({
        key: 'auto_gen_config',
        value: newConfig as any,
        updated_by: user.id,
      });

      if (error) throw error;

      setAutoConfig(newConfig);
      toast.success(activate 
        ? 'Geração automática ativada! O backend executará a cada ciclo, independente desta aba.' 
        : 'Geração automática parada. O backend não executará mais.');

      // Log
      await supabase.from('pro_generation_logs' as any).insert({
        execution_type: 'automatic',
        quantity_generated: 0,
        quantity_requested: 0,
        config_quantity_per_cycle: qty,
        config_interval_minutes: interval,
        executed_by: user.id,
        status: activate ? 'started' : 'stopped',
        cumulative_total: activate ? 0 : autoConfig.total_generated,
      });

      loadData();
    } catch (err: any) {
      toast.error('Erro: ' + err.message);
    } finally {
      setIsToggling(false);
    }
  };

  const handleManualGenerate = async () => {
    if (!user) return;
    const prosCount = parseInt(amount) || 0;
    if (prosCount < 1) { toast.error('Mínimo: 1'); return; }
    if (prosCount > 100000) { toast.error('Máximo: 100.000 por vez'); return; }

    setIsGenerating(true);
    setLastGeneration(null);
    setProgress({ current: 10, total: 100, phase: 'Gerando participações no banco...' });

    try {
      const { data, error } = await supabase.rpc('generate_pros_batch', {
        p_amount: prosCount,
        p_user_id: user.id,
      });

      if (error) throw error;
      const result = data?.[0];
      if (!result) throw new Error('Nenhum dado retornado');

      setProgress({ current: 100, total: 100, phase: 'Concluído!' });
      setLastGeneration({ count: result.total_generated, codes: result.sample_codes || [] });

      // Log
      await supabase.from('pro_generation_logs' as any).insert({
        execution_type: 'manual',
        quantity_generated: result.total_generated,
        quantity_requested: prosCount,
        first_position: result.first_position,
        last_position: result.last_position,
        executed_by: user.id,
        status: 'success',
        cumulative_total: totalPros + result.total_generated,
      });

      toast.success(`${result.total_generated.toLocaleString('pt-BR')} participações geradas!`);
      setAmount('');
      loadData();
    } catch (err: any) {
      toast.error('Erro: ' + err.message);
      await supabase.from('pro_generation_logs' as any).insert({
        execution_type: 'manual',
        quantity_generated: 0,
        quantity_requested: prosCount,
        executed_by: user?.id,
        status: 'error',
        error_message: err.message,
        cumulative_total: totalPros,
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress({ current: 0, total: 0, phase: '' }), 2000);
    }
  };

  const poolHealth = poolCount > 100 ? 'saudável' : poolCount > 0 ? 'baixo' : 'crítico';
  const poolColor = poolCount > 100 ? 'text-green-600' : poolCount > 0 ? 'text-amber-600' : 'text-destructive';

  const getNextExecution = () => {
    if (!autoConfig.active || !autoConfig.last_execution) return 'Em breve...';
    const last = new Date(autoConfig.last_execution);
    const next = new Date(last.getTime() + (autoConfig.interval_minutes || 10) * 60000);
    if (next < new Date()) return 'A qualquer momento...';
    return format(next, "dd/MM HH:mm:ss", { locale: ptBR });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Abastecer Fila do Ciclo</strong> — Controla o pool global de participações-base que alimenta todo o sistema.
          Quando um participante compra, PROs são retirados deste pool e atribuídos a ele. Se o pool esvaziar,
          nenhum novo participante receberá PROs.
          <ul className="mt-1 ml-4 list-disc text-xs space-y-0.5">
            <li><strong>Geração Manual</strong>: para injeções pontuais e controladas</li>
            <li><strong>Geração Automática</strong>: sustentada por backend real (Edge Function + pg_cron), funciona independente da aba aberta</li>
          </ul>
        </div>
      </div>

      {/* Pool Status */}
      <Card className={poolCount === 0 ? 'border-destructive/30' : poolCount <= 50 ? 'border-amber-500/30' : ''}>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Pool Global Disponível</p>
            <p className={`text-3xl font-bold ${poolColor}`}>{poolCount.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Nível: {poolHealth} • Total no sistema: {totalPros.toLocaleString('pt-BR')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData} className="gap-1">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </CardContent>
      </Card>

      {/* Manual Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5" />
            Geração Manual
          </CardTitle>
          <CardDescription>
            Gera uma quantidade específica de participações-base e as adiciona ao pool global. Use para abastecimentos pontuais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="number" min="1" max="100000" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 500" disabled={isGenerating} className="max-w-xs"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isGenerating || !amount || parseInt(amount) < 1} className="gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Gerar {parseInt(amount) > 0 ? `${parseInt(amount).toLocaleString('pt-BR')} PROs` : ''}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Geração Manual</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a gerar <strong>{parseInt(amount || '0').toLocaleString('pt-BR')} participações-base</strong> no pool global.
                    Elas ficarão disponíveis imediatamente para novos participantes. Esta ação é registrada no log.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleManualGenerate}>Confirmar Geração</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {progress.phase && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{progress.phase}</p>
              <Progress value={progress.current} className="h-2" />
            </div>
          )}

          {lastGeneration && (
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 text-sm">
                  {lastGeneration.count.toLocaleString('pt-BR')} PROs gerados!
                </span>
              </div>
              {lastGeneration.codes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {lastGeneration.codes.slice(0, 5).map(code => (
                    <Badge key={code} variant="outline" className="text-xs font-mono">{code}</Badge>
                  ))}
                  {lastGeneration.codes.length > 5 && (
                    <Badge variant="secondary" className="text-xs">+{lastGeneration.codes.length - 5}</Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Generation — Backend-sustained */}
      <Card className={autoConfig.active ? 'border-green-500/30' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="w-5 h-5" />
            Geração Automática — Backend
            {autoConfig.active ? (
              <Badge className="bg-green-500 text-white ml-2">Ativa</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">Desligada</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Sustentada por Edge Function + pg_cron. <strong>Funciona independente da aba aberta, do navegador e de sessão ativa.</strong>
            {' '}O backend verifica a cada minuto se deve gerar PROs conforme a configuração abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {autoConfig.last_error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Último erro: {autoConfig.last_error}
              </AlertDescription>
            </Alert>
          )}

          {!autoConfig.active ? (
            <>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-1">
                  <Label className="text-xs">Quantidade por ciclo</Label>
                  <Input type="number" min="1" max="10000" value={autoQty}
                    onChange={(e) => setAutoQty(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Intervalo (minutos)</Label>
                  <Input type="number" min="1" max="1440" value={autoInterval}
                    onChange={(e) => setAutoInterval(e.target.value)} />
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="gap-2" disabled={isToggling}>
                    {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Iniciar Geração Automática
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Ativação da Automação</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>A geração automática criará <strong>{parseInt(autoQty || '100')} participações</strong> a cada{' '}
                      <strong>{parseInt(autoInterval || '10')} minuto(s)</strong>.</p>
                      <p className="font-medium">⚠️ Esta automação é sustentada pelo backend (Edge Function + pg_cron) e continuará
                      funcionando mesmo que você feche esta aba ou o navegador.</p>
                      <p>Toda execução é registrada no log. Você poderá parar a qualquer momento.</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toggleAutoGeneration(true)}>Confirmar e Iniciar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-500/20 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">PROs por ciclo</p>
                    <p className="font-bold">{autoConfig.quantity_per_cycle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Intervalo</p>
                    <p className="font-bold">{autoConfig.interval_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total gerado</p>
                    <p className="font-bold">{(autoConfig.total_generated || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última execução</p>
                    <p className="font-bold text-xs">
                      {autoConfig.last_execution
                        ? format(new Date(autoConfig.last_execution), "dd/MM HH:mm:ss", { locale: ptBR })
                        : 'Aguardando...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Próxima execução</p>
                    <p className="font-bold text-xs">{getNextExecution()}</p>
                  </div>
                </div>
                {autoConfig.started_at && (
                  <p className="text-xs text-muted-foreground">
                    Ativa desde {format(new Date(autoConfig.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    {' • '}Backend independente — funciona com a aba fechada
                  </p>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={isToggling}>
                    {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                    Parar Geração Automática
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Parada</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>A geração automática será interrompida no backend. O pg_cron continuará verificando, mas não gerará PROs com active=false.</p>
                      <p>Total gerado nesta sessão:{' '}
                      <strong>{(autoConfig.total_generated || 0).toLocaleString('pt-BR')} PROs</strong>.</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter ativa</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toggleAutoGeneration(false)}>Confirmar e Parar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generation Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Log de Execuções
          </CardTitle>
          <CardDescription>Histórico completo — manuais e automáticas (backend). Registros gerados pelo servidor, não pelo navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma execução registrada.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-muted/30 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.execution_type === 'manual' ? 'outline' : 'secondary'} className="text-[10px]">
                        {log.execution_type === 'manual' ? 'Manual' : 'Automática'}
                      </Badge>
                      <Badge
                        variant={
                          log.status === 'success' ? 'default' 
                          : log.status === 'error' ? 'destructive' 
                          : log.status === 'started' ? 'default'
                          : log.status === 'stopped' ? 'secondary'
                          : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {log.quantity_generated > 0 && (
                      <span>Gerados: <strong className="text-foreground">{log.quantity_generated.toLocaleString('pt-BR')}</strong></span>
                    )}
                    {log.config_quantity_per_cycle && (
                      <span>Config: {log.config_quantity_per_cycle}/ciclo a cada {log.config_interval_minutes}min</span>
                    )}
                    {log.cumulative_total > 0 && (
                      <span>Acumulado: {log.cumulative_total.toLocaleString('pt-BR')}</span>
                    )}
                    {log.error_message && (
                      <span className="text-destructive">{log.error_message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Package, DollarSign, AlertCircle, CheckCircle2, History, Calendar, User, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface GenerationRecord {
  id: string;
  date: string;
  user_name: string;
  user_id: string;
  count: number;
  amount: number;
  first_position: number;
  last_position: number;
}

export function GenerateProsPanel() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [generationRecords, setGenerationRecords] = useState<GenerationRecord[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [lastGeneration, setLastGeneration] = useState<{
    count: number;
    amount: number;
    codes: string[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('pros')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get min/max positions to calculate the range
      const { data: statsData, error: statsError } = await supabase
        .from('pros')
        .select('user_id, created_at, fifo_position')
        .order('fifo_position', { ascending: false })
        .limit(1);

      const { data: minPosData } = await supabase
        .from('pros')
        .select('fifo_position')
        .order('fifo_position', { ascending: true })
        .limit(1);

      // Load profiles for user names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (profilesError) throw profilesError;

      if (statsData && statsData.length > 0 && minPosData && profilesData) {
        const latestPro = statsData[0];
        const profile = profilesData.find(p => p.user_id === latestPro.user_id);
        
        // Create a single record for the batch
        const record: GenerationRecord = {
          id: `${latestPro.user_id}-${latestPro.created_at.slice(0, 16)}`,
          date: latestPro.created_at,
          user_name: profile?.full_name || 'Usuário desconhecido',
          user_id: latestPro.user_id,
          count: totalCount || 0,
          amount: totalCount || 0,
          first_position: minPosData[0]?.fifo_position || 1,
          last_position: latestPro.fifo_position
        };

        setGenerationRecords([record]);
      } else {
        setGenerationRecords([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate number of PROs from R$ value (1 PRO = R$ 1,00)
  const calculateProsCount = (): number => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return 0;
    return Math.floor(numericAmount); // 1 PRO per R$ 1,00
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const prosCount = calculateProsCount();
    if (prosCount === 0) {
      toast.error('Valor mínimo: R$ 1,00');
      return;
    }

    // Limit to avoid excessive processing - database function can handle up to 100k efficiently
    if (prosCount > 100000) {
      toast.error('Limite máximo: 100.000 PROs por vez. Faça múltiplas gerações.');
      return;
    }

    setIsGenerating(true);
    setLastGeneration(null);
    setProgress({ current: 0, total: 100, phase: 'Iniciando geração...' });

    try {
      setProgress({ current: 10, total: 100, phase: 'Gerando PROs no banco de dados...' });
      
      // Call database function directly - much more efficient than Edge Function
      const { data, error } = await supabase.rpc('generate_pros_batch', {
        p_amount: prosCount,
        p_user_id: user.id
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nenhum dado retornado');

      const result = data[0];
      setProgress({ current: 100, total: 100, phase: 'Concluído!' });

      setLastGeneration({
        count: result.total_generated,
        amount: result.total_generated,
        codes: result.sample_codes || []
      });

      toast.success(`${result.total_generated.toLocaleString('pt-BR')} PROs gerados (R$ ${result.total_generated.toLocaleString('pt-BR')},00)`);
      
      await loadData();
      setAmount('');

    } catch (error: any) {
      console.error('Error generating PROs:', error);
      toast.error(`Erro ao gerar PROs: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0, phase: '' });
    }
  };

  const handleDeleteBatch = async (record: GenerationRecord) => {
    // Only allow deleting the most recent batch
    if (generationRecords[0]?.id !== record.id) {
      toast.error('Só é permitido excluir a última geração (LIFO)');
      return;
    }

    setIsDeleting(record.id);
    setProgress({ current: 0, total: 100, phase: 'Excluindo PROs...' });

    try {
      // Use Edge Function for bulk deletion
      setProgress({ current: 10, total: 100, phase: 'Processando exclusão no servidor...' });
      
      const { data, error } = await supabase.functions.invoke('delete-pros-batch', {
        body: { 
          userId: record.user_id,
          firstPosition: record.first_position,
          lastPosition: record.last_position
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProgress({ current: 100, total: 100, phase: 'Concluído!' });
      toast.success(`${record.count.toLocaleString('pt-BR')} PROs excluídos com sucesso`);
      await loadData();
      setLastGeneration(null);

    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(null);
      setProgress({ current: 0, total: 0, phase: '' });
    }
  };

  const prosCount = calculateProsCount();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Gerar Novos PROs
          </CardTitle>
          <CardDescription>
            Cada R$ 1,00 gera 1 PRO (100g de resíduo). Máximo: 100.000 por vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor em R$ (1 PRO = R$ 1,00)</Label>
            <div className="flex gap-3">
              <Input
                id="amount"
                type="number"
                min="1"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 200"
                disabled={isGenerating}
                className="max-w-xs"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || prosCount === 0}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Gerar {prosCount > 0 ? `${prosCount.toLocaleString('pt-BR')} PROs` : ''}
              </Button>
            </div>
          </div>

          {progress.phase && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{progress.phase}</p>
              <Progress value={progress.current} className="h-2" />
            </div>
          )}

          {lastGeneration && (
            <div className="p-4 rounded-lg border border-green-500/30 bg-green-50/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {lastGeneration.count.toLocaleString('pt-BR')} PROs gerados!
                </span>
              </div>
              {lastGeneration.codes.length > 0 && (
                <div className="flex flex-wrap gap-1">
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

      {/* Generation History - Read Only */}
      {generationRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              PROs no Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generationRecords.map((record) => (
                <div 
                  key={record.id}
                  className="p-4 rounded-lg border bg-muted/50 border-border"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{record.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Package className="w-3 h-3" />
                        {record.count.toLocaleString('pt-BR')} PROs
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="w-3 h-3" />
                        R$ {record.amount.toLocaleString('pt-BR')},00
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    <span className="text-muted-foreground/50">•</span>
                    <span>Posições {record.first_position} - {record.last_position}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

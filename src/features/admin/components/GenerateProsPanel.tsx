import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
      // Load PROs grouped by creation timestamp (batch)
      const { data: prosData, error: prosError } = await supabase
        .from('pros')
        .select('id, code, user_id, created_at, fifo_position, weight_grams')
        .order('fifo_position', { ascending: false })
        .limit(1000);

      if (prosError) throw prosError;

      // Load profiles for user names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (profilesError) throw profilesError;

      if (prosData && profilesData) {
        // Group PROs by batch (same user and creation minute)
        const grouped = new Map<string, GenerationRecord>();
        
        prosData.forEach(pro => {
          const dateKey = pro.created_at.slice(0, 16); // YYYY-MM-DDTHH:MM
          const key = `${pro.user_id}-${dateKey}`;
          const profile = profilesData.find(p => p.user_id === pro.user_id);
          
          if (!grouped.has(key)) {
            grouped.set(key, {
              id: key,
              date: pro.created_at,
              user_name: profile?.full_name || 'Usuário desconhecido',
              user_id: pro.user_id,
              count: 0,
              amount: 0,
              first_position: pro.fifo_position,
              last_position: pro.fifo_position
            });
          }
          
          const entry = grouped.get(key)!;
          entry.count++;
          entry.amount += 1; // R$ 1,00 per PRO
          entry.first_position = Math.min(entry.first_position, pro.fifo_position);
          entry.last_position = Math.max(entry.last_position, pro.fifo_position);
        });

        // Convert to array and sort by date descending
        const recordsArray = Array.from(grouped.values())
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20);

        setGenerationRecords(recordsArray);
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

    setIsGenerating(true);
    setLastGeneration(null);

    try {
      // Get starting position
      const { data: startPosition, error: posError } = await supabase.rpc('get_next_fifo_position');
      if (posError) throw posError;

      // Generate all codes at once
      const prosToInsert: {
        code: string;
        user_id: string;
        weight_grams: number;
        fifo_position: number;
        status: 'pending';
      }[] = [];
      
      const fifoToInsert: {
        pro_id?: string;
        position: number;
        status: 'pending';
      }[] = [];

      const generatedCodes: string[] = [];
      const usedCodes = new Set<string>();
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

      // Generate unique codes
      for (let i = 0; i < prosCount; i++) {
        let code: string;
        do {
          code = '';
          for (let j = 0; j < 8; j++) {
            code += chars[Math.floor(Math.random() * chars.length)];
          }
        } while (usedCodes.has(code));
        
        usedCodes.add(code);
        generatedCodes.push(code);

        prosToInsert.push({
          code,
          user_id: user.id,
          weight_grams: 100,
          fifo_position: (startPosition as number) + i,
          status: 'pending'
        });
      }

      // Insert PROs in batch
      const { data: insertedPros, error: prosError } = await supabase
        .from('pros')
        .insert(prosToInsert)
        .select('id, code, fifo_position');

      if (prosError) throw prosError;

      // Prepare FIFO entries
      if (insertedPros) {
        const fifoInserts = insertedPros.map(pro => ({
          pro_id: pro.id,
          position: pro.fifo_position,
          status: 'pending' as const
        }));

        const { error: fifoError } = await supabase
          .from('fifo_queue')
          .insert(fifoInserts);

        if (fifoError) throw fifoError;
      }

      setLastGeneration({
        count: prosCount,
        amount: prosCount,
        codes: generatedCodes
      });

      toast.success(`${prosCount} PROs gerados (R$ ${prosCount.toLocaleString('pt-BR')},00)`);
      
      await loadData();
      setAmount('');

    } catch (error: any) {
      console.error('Error generating PROs:', error);
      toast.error(`Erro ao gerar PROs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteBatch = async (record: GenerationRecord) => {
    // Only allow deleting the most recent batch
    if (generationRecords[0]?.id !== record.id) {
      toast.error('Só é permitido excluir a última geração (LIFO)');
      return;
    }

    setIsDeleting(record.id);

    try {
      // Get PROs from this batch
      const { data: prosToDelete, error: fetchError } = await supabase
        .from('pros')
        .select('id')
        .eq('user_id', record.user_id)
        .gte('fifo_position', record.first_position)
        .lte('fifo_position', record.last_position);

      if (fetchError) throw fetchError;

      if (prosToDelete && prosToDelete.length > 0) {
        const proIds = prosToDelete.map(p => p.id);

        // Delete FIFO entries first
        const { error: fifoError } = await supabase
          .from('fifo_queue')
          .delete()
          .in('pro_id', proIds);

        if (fifoError) throw fifoError;

        // Delete PROs
        const { error: prosError } = await supabase
          .from('pros')
          .delete()
          .in('id', proIds);

        if (prosError) throw prosError;
      }

      toast.success(`${record.count} PROs excluídos com sucesso`);
      await loadData();
      setLastGeneration(null);

    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(null);
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
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Gerar PROs
          </CardTitle>
          <CardDescription>
            Insira o valor em R$ para gerar PROs automaticamente. Cada R$ 1,00 = 1 PRO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor em Reais *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Ex: 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center px-4 bg-muted rounded-md text-sm font-medium">
                R$
              </div>
            </div>
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Prévia da Geração:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  R$ {prosCount.toLocaleString('pt-BR')},00
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Package className="w-3 h-3" />
                  {prosCount.toLocaleString('pt-BR')} PROs
                </Badge>
              </div>
              {prosCount === 0 && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  Valor mínimo: R$ 1,00
                </p>
              )}
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || prosCount === 0}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando PROs...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Gerar {prosCount > 0 ? `${prosCount.toLocaleString('pt-BR')} PROs` : 'PROs'}
              </>
            )}
          </Button>

          {/* Last Generation Result */}
          {lastGeneration && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">
                  {lastGeneration.count} PROs gerados (R$ {lastGeneration.amount.toLocaleString('pt-BR')},00)
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Códigos gerados:</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {lastGeneration.codes.slice(0, 20).map((code) => (
                    <Badge key={code} variant="outline" className="text-xs font-mono">
                      {code}
                    </Badge>
                  ))}
                  {lastGeneration.codes.length > 20 && (
                    <Badge variant="secondary" className="text-xs">
                      +{lastGeneration.codes.length - 20} mais
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation History */}
      {generationRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Histórico de Geração
            </CardTitle>
            <CardDescription>
              Clique em excluir para remover a última geração (LIFO - Last In, First Out)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generationRecords.map((record, idx) => (
                <div 
                  key={record.id}
                  className={`p-4 rounded-lg border ${idx === 0 ? 'bg-muted/50 border-border' : 'bg-background border-border/50'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{record.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Package className="w-3 h-3" />
                        {record.count} PROs
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="w-3 h-3" />
                        R$ {record.amount.toLocaleString('pt-BR')},00
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      <span className="text-muted-foreground/50">•</span>
                      <span>Posições {record.first_position} - {record.last_position}</span>
                    </div>
                    
                    {idx === 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting === record.id}
                          >
                            {isDeleting === record.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir geração de PROs?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso excluirá permanentemente {record.count} PROs (R$ {record.amount.toLocaleString('pt-BR')},00) 
                              e suas entradas na fila FIFO. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBatch(record)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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

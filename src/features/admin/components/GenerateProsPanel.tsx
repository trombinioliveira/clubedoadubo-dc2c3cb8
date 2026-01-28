import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Package, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

type WeightUnit = 'kg' | 'ton';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

export function GenerateProsPanel() {
  const { user } = useAuth();
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastGeneration, setLastGeneration] = useState<{
    count: number;
    codes: string[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email');

      if (error) throw error;
      if (data) setProfiles(data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert weight to grams
  const getWeightInGrams = (): number => {
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) return 0;
    
    if (unit === 'ton') {
      return numericWeight * 1000 * 1000; // 1 ton = 1000 kg = 1,000,000 grams
    }
    return numericWeight * 1000; // 1 kg = 1000 grams
  };

  // Calculate number of PROs (1 PRO = 100g = 0.1kg)
  const calculateProsCount = (): number => {
    const grams = getWeightInGrams();
    return Math.floor(grams / 100); // 100g per PRO
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!selectedUserId) {
      toast.error('Selecione um usuário');
      return;
    }

    const prosCount = calculateProsCount();
    if (prosCount === 0) {
      toast.error('Peso insuficiente para gerar PROs (mínimo 100g)');
      return;
    }

    setIsGenerating(true);
    setLastGeneration(null);

    try {
      const generatedCodes: string[] = [];

      // Generate PROs in batches to avoid timeout
      const batchSize = 50;
      for (let i = 0; i < prosCount; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, prosCount - i);
        const prosToInsert = [];

        for (let j = 0; j < currentBatchSize; j++) {
          // Get unique code and FIFO position
          const [codeRes, positionRes] = await Promise.all([
            supabase.rpc('generate_pro_code'),
            supabase.rpc('get_next_fifo_position')
          ]);

          if (codeRes.error) throw codeRes.error;
          if (positionRes.error) throw positionRes.error;

          const code = codeRes.data;
          const position = (positionRes.data as number) + j; // Offset for batch

          prosToInsert.push({
            code,
            user_id: selectedUserId,
            weight_grams: 100, // Each PRO = 100g
            fifo_position: position,
            status: 'processing' as const // Starts in "Coleta" (processing status maps to collection phase)
          });

          generatedCodes.push(code);
        }

        // Insert batch of PROs
        const { error: prosError } = await supabase
          .from('pros')
          .insert(prosToInsert);

        if (prosError) throw prosError;

        // Get the inserted PROs to get their IDs
        const { data: insertedPros, error: fetchError } = await supabase
          .from('pros')
          .select('id, code')
          .in('code', prosToInsert.map(p => p.code));

        if (fetchError) throw fetchError;

        if (insertedPros) {
          const fifoInserts = insertedPros.map(pro => ({
            pro_id: pro.id,
            position: prosToInsert.find(p => p.code === pro.code)?.fifo_position || 0,
            status: 'processing' as const
          }));

          const { error: fifoError } = await supabase
            .from('fifo_queue')
            .insert(fifoInserts);

          if (fifoError) throw fifoError;
        }
      }

      setLastGeneration({
        count: prosCount,
        codes: generatedCodes
      });

      toast.success(`${prosCount} PROs gerados com sucesso!`);
      
      // Reset form
      setWeight('');

    } catch (error: any) {
      console.error('Error generating PROs:', error);
      toast.error(`Erro ao gerar PROs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const prosCount = calculateProsCount();
  const weightInKg = getWeightInGrams() / 1000;

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
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Gerar PROs
        </CardTitle>
        <CardDescription>
          Insira o peso dos resíduos para gerar PROs automaticamente. Cada 100g = 1 PRO.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="space-y-2">
          <Label htmlFor="user">Usuário *</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o usuário" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.user_id} value={profile.user_id}>
                  {profile.full_name} ({profile.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="weight">Peso dos Resíduos *</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Ex: 10.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={unit} onValueChange={(v) => setUnit(v as WeightUnit)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="ton">Toneladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        {weight && parseFloat(weight) > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Prévia da Geração:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Scale className="w-3 h-3" />
                {weightInKg.toLocaleString('pt-BR')} kg
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Package className="w-3 h-3" />
                {prosCount.toLocaleString('pt-BR')} PROs
              </Badge>
            </div>
            {prosCount === 0 && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4" />
                Peso mínimo: 100g (0.1 kg)
              </p>
            )}
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || prosCount === 0 || !selectedUserId}
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
                {lastGeneration.count} PROs gerados com sucesso!
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Códigos gerados:</p>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {lastGeneration.codes.slice(0, 20).map((code) => (
                  <Badge key={code} variant="outline" className="text-xs">
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
  );
}

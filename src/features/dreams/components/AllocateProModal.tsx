import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Package, ArrowRight, Sparkles } from 'lucide-react';

type ProStatus = 'processing' | 'ready' | 'sold' | 'paid';

interface Pro {
  id: string;
  code: string;
  status: ProStatus;
  weight_grams: number;
  dream_id: string | null;
  created_at: string;
}

interface Dream {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface AllocateProModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dream: Dream;
  onSuccess: () => void;
}

export function AllocateProModal({ open, onOpenChange, dream, onSuccess }: AllocateProModalProps) {
  const { user } = useAuth();
  const [availablePros, setAvailablePros] = useState<Pro[]>([]);
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchAvailablePros();
    }
  }, [open, user]);

  const fetchAvailablePros = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('pros')
      .select('*')
      .eq('user_id', user.id)
      .is('dream_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar PROs disponíveis');
      console.error(error);
    } else {
      setAvailablePros(data as Pro[] || []);
    }
    
    setIsLoading(false);
  };

  const togglePro = (proId: string) => {
    setSelectedPros(prev => 
      prev.includes(proId) 
        ? prev.filter(id => id !== proId)
        : [...prev, proId]
    );
  };

  const allocatePros = async () => {
    if (selectedPros.length === 0) {
      toast.error('Selecione pelo menos um PRO');
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from('pros')
      .update({ dream_id: dream.id })
      .in('id', selectedPros);

    if (error) {
      toast.error('Erro ao alocar PROs');
      console.error(error);
    } else {
      toast.success(`${selectedPros.length} PRO(s) alocado(s) para o sonho!`);
      onSuccess();
      onOpenChange(false);
      setSelectedPros([]);
    }

    setIsSaving(false);
  };

  const potentialValue = selectedPros.length * 2;
  const remainingToGoal = dream.target_amount - dream.current_amount;
  const progressAfterAllocation = Math.min(100, ((dream.current_amount + potentialValue) / dream.target_amount) * 100);

  const getStatusLabel = (status: ProStatus) => {
    const labels = {
      processing: 'Processando',
      ready: 'Pronto',
      sold: 'Vendido',
      paid: 'Pago'
    };
    return labels[status];
  };

  const getStatusColor = (status: ProStatus) => {
    const colors = {
      processing: 'bg-accent text-accent-foreground',
      ready: 'bg-primary text-primary-foreground',
      sold: 'bg-secondary text-secondary-foreground',
      paid: 'bg-emerald-500 text-white'
    };
    return colors[status];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Alocar PROs para: {dream.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Dream Progress */}
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progresso do Sonho</span>
                <span className="font-medium">
                  R$ {dream.current_amount.toFixed(2)} / R$ {dream.target_amount.toFixed(2)}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(dream.current_amount / dream.target_amount) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Faltam R$ {remainingToGoal.toFixed(2)} para atingir a meta
              </p>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          {selectedPros.length > 0 && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedPros.length} PRO(s) selecionado(s)</p>
                    <p className="text-sm text-muted-foreground">
                      Valor potencial: R$ {potentialValue.toFixed(2)}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="text-right">
                    <p className="font-medium text-primary">{progressAfterAllocation.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">após alocação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available PROs */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              PROs Disponíveis
            </h4>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : availablePros.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum PRO disponível para alocação</p>
                <p className="text-sm">Compre mais PROs ou libere dos sonhos existentes</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availablePros.map((pro) => (
                  <Card 
                    key={pro.id}
                    className={`cursor-pointer transition-all ${
                      selectedPros.includes(pro.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => togglePro(pro.id)}
                  >
                    <CardContent className="py-3 flex items-center gap-4">
                      <Checkbox 
                        checked={selectedPros.includes(pro.id)}
                        onCheckedChange={() => togglePro(pro.id)}
                      />
                      <div className="flex-1">
                        <p className="font-mono font-medium">{pro.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {pro.weight_grams}g • Valor: R$ 2,00
                        </p>
                      </div>
                      <Badge className={getStatusColor(pro.status)}>
                        {getStatusLabel(pro.status)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 earth-gradient"
              onClick={allocatePros}
              disabled={selectedPros.length === 0 || isSaving}
            >
              {isSaving ? 'Alocando...' : `Alocar ${selectedPros.length} PRO(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

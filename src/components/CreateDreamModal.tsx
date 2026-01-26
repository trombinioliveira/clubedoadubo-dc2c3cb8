import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Target, CheckCircle } from 'lucide-react';

interface CreateDreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (title: string, targetAmount: number) => void;
}

const SUGGESTED_GOALS = [
  { title: 'Viagem de fim de semana', amount: 300 },
  { title: 'Presente especial', amount: 150 },
  { title: 'Curso ou workshop', amount: 500 },
  { title: 'Equipamento novo', amount: 800 },
];

export const CreateDreamModal = ({ open, onOpenChange, onConfirm }: CreateDreamModalProps) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(100);
  const [step, setStep] = useState<'create' | 'success'>('create');

  const handleConfirm = () => {
    if (!title.trim() || targetAmount <= 0) return;
    setStep('success');
    setTimeout(() => {
      onConfirm(title, targetAmount);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setStep('create');
    setTitle('');
    setTargetAmount(100);
    onOpenChange(false);
  };

  const handleSuggestionClick = (suggestion: typeof SUGGESTED_GOALS[0]) => {
    setTitle(suggestion.title);
    setTargetAmount(suggestion.amount);
  };

  const prosNeeded = Math.ceil(targetAmount / 2);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'create' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Criar novo sonho
              </DialogTitle>
              <DialogDescription>
                Defina uma meta e acompanhe seu progresso com os pagamentos dos PROs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Suggestions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Sugestões</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_GOALS.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 text-left rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">R$ {suggestion.amount.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom title */}
              <div className="space-y-2">
                <Label htmlFor="dream-title">Qual é o seu sonho?</Label>
                <Input
                  id="dream-title"
                  placeholder="Ex: Viagem para a praia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                />
              </div>

              {/* Target amount */}
              <div className="space-y-2">
                <Label htmlFor="target-amount">Meta (R$)</Label>
                <Input
                  id="target-amount"
                  type="number"
                  min={10}
                  max={10000}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>

              {/* Info card */}
              {targetAmount > 0 && (
                <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Você precisa de aproximadamente <span className="font-semibold text-foreground">{prosNeeded} PROs pagos</span> para alcançar essa meta
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirm} 
                variant="hero" 
                className="flex-1"
                disabled={!title.trim() || targetAmount <= 0}
              >
                Criar sonho
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">Sonho criado!</h3>
            <p className="text-muted-foreground">
              "{title}" foi adicionado aos seus sonhos
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

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
import { Minus, Plus, Leaf, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseProModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number) => void;
}

const QUICK_AMOUNTS = [1, 5, 10, 20, 50];
const PRICE_PER_PRO = 1;
const PAYMENT_PER_PRO = 2;

export const PurchaseProModal = ({ open, onOpenChange, onConfirm }: PurchaseProModalProps) => {
  const [quantity, setQuantity] = useState(5);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  const handleQuantityChange = (value: number) => {
    const newValue = Math.max(1, Math.min(1000, value));
    setQuantity(newValue);
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  const handleFinalConfirm = () => {
    setStep('success');
    setTimeout(() => {
      onConfirm(quantity);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep('select');
    setQuantity(5);
    onOpenChange(false);
  };

  const totalCost = quantity * PRICE_PER_PRO;
  const totalWeight = quantity * 100;
  const potentialPayment = quantity * PAYMENT_PER_PRO;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 rounded-xl earth-gradient flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                Ativar PROs
              </DialogTitle>
              <DialogDescription>
                Cada PRO representa 100g de resíduo orgânico que será transformado em adubo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Quantity selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quantidade de PROs</Label>
                
                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={quantity === amount ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuantity(amount)}
                      className={cn(
                        'min-w-[4rem]',
                        quantity === amount && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>

                {/* Manual input */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="text-center text-lg font-bold w-24"
                    min={1}
                    max={1000}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 1000}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Summary card */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Resíduo processado</span>
                  <span className="font-semibold">{(totalWeight / 1000).toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor por PRO</span>
                  <span className="font-semibold">R$ {PRICE_PER_PRO.toFixed(2)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total a pagar</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expected return info */}
              <div className="p-3 bg-status-paid/10 border border-status-paid/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  💡 Quando vendido, cada PRO gera{' '}
                  <span className="font-semibold text-foreground">R$ {PAYMENT_PER_PRO.toFixed(2)}</span>{' '}
                  (total potencial: R$ {potentialPayment.toFixed(2)})
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} variant="hero" className="flex-1">
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Confirmar ativação</DialogTitle>
              <DialogDescription>
                Revise os detalhes antes de confirmar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl earth-gradient flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {quantity} PROs
                </p>
                <p className="text-muted-foreground">
                  {(totalWeight / 1000).toFixed(1)} kg de resíduo orgânico
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Valor total</span>
                  <span className="font-semibold">R$ {totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Entra na fila FIFO</span>
                  <span className="font-semibold text-primary">Automático</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Ao confirmar, seus PROs entrarão na fila global e você poderá acompanhar o progresso no seu painel.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleFinalConfirm} variant="hero" className="flex-1">
                Confirmar R$ {totalCost.toFixed(2)}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-status-paid/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-status-paid flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-bold text-foreground">PROs Ativados!</h3>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            
            <p className="text-muted-foreground mb-4">
              Você ativou <span className="font-bold text-foreground">{quantity} PROs</span>
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm">
              <Leaf className="w-4 h-4" />
              {(totalWeight / 1000).toFixed(1)} kg de resíduo entrando no ciclo
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

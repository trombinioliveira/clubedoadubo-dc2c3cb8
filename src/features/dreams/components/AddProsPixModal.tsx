import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { toast } from 'sonner';
import { 
  Link2, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone,
  Zap,
  Coffee,
  ShoppingCart,
  Car
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddProsPixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixKey: string;
  userName: string;
}

const QUICK_VALUES = [1, 2, 5, 10];

// Mock histórico - em produção viria do banco
const MOCK_HISTORY = [
  { id: 1, value: 2, label: 'café', icon: Coffee, time: 'Hoje, 08:30' },
  { id: 2, value: 1, label: 'mercado', icon: ShoppingCart, time: 'Ontem, 19:45' },
  { id: 3, value: 3, label: 'transporte', icon: Car, time: 'Ontem, 07:15' },
];

export function AddProsPixModal({
  open,
  onOpenChange,
  pixKey,
  userName,
}: AddProsPixModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');

  const pixLink = `https://pix.clube.do.adubo/${pixKey}`;
  
  // Gera um QR Code placeholder (em produção usaria uma lib como qrcode.react)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixLink)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixLink);
      setCopied(true);
      toast.success('Link PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleValueSelect = (value: number) => {
    setSelectedValue(value);
    setCustomValue('');
    toast.info(`R$ ${value},00 = ${value} PRO${value > 1 ? 's' : ''}`);
  };

  const handleCustomValue = (value: string) => {
    const numValue = parseInt(value) || 0;
    setCustomValue(value);
    setSelectedValue(null);
    if (numValue > 0) {
      // Não mostrar toast para cada keystroke
    }
  };

  const currentValue = selectedValue || parseInt(customValue) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            Adicionar PROs via PIX
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Link PIX
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          {/* Tab: Link PIX */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Seu link PIX pessoal</span>
                <HelpTooltip content="Cada R$1 via PIX ativa 1 PRO automaticamente." />
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={pixLink}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Cole este link no app do seu banco.
              </p>
            </div>
          </TabsContent>

          {/* Tab: QR Code */}
          <TabsContent value="qrcode" className="space-y-4 mt-4">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-md">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Escaneie com o app do seu banco
                </span>
              </div>
              <HelpTooltip content="O QR Code já contém seu identificador." />
            </div>
          </TabsContent>
        </Tabs>

        {/* Valores Rápidos */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Valores rápidos</span>
            <HelpTooltip content="Valores pequenos e frequentes aceleram seus níveis." />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {QUICK_VALUES.map((value) => (
              <Button
                key={value}
                variant={selectedValue === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleValueSelect(value)}
                className={cn(
                  "h-12 flex flex-col",
                  selectedValue === value && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <span className="font-bold">R$ {value}</span>
                <span className="text-[10px] opacity-70">{value} PRO{value > 1 ? 's' : ''}</span>
              </Button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Outro valor"
              value={customValue}
              onChange={(e) => handleCustomValue(e.target.value)}
              className="flex-1"
              min={1}
            />
            {currentValue > 0 && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                = {currentValue} PRO{currentValue > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Histórico Diário */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Histórico recente</span>
            <HelpTooltip content="Esse histórico ajuda você a visualizar seus hábitos." />
          </div>

          <div className="space-y-2">
            {MOCK_HISTORY.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        +{item.value} PRO{item.value > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-center text-muted-foreground italic">
            "Pequenas ações constroem grandes níveis."
          </p>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-primary/5 rounded-lg text-center mt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">1 REAL = 1 PRO</span>
            <br />
            Cada PRO é rastreável e vinculado ao seu CPF.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

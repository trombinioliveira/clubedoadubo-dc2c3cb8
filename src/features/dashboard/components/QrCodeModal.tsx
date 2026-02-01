import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Smartphone,
  Share2,
  QrCode as QrCodeIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode: string;
  userName: string;
}

export function QrCodeModal({
  open,
  onOpenChange,
  referralCode,
  userName,
}: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(referralUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleShare = async () => {
    const shareText = `Faça parte do Clube do Adubo! Transforme resíduo em impacto real. Use meu código: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clube do Adubo',
          text: shareText,
          url: referralUrl,
        });
      } catch (err) {
        // Usuário cancelou
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <QrCodeIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            Seu QR Code Pessoal
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <img 
              src={qrCodeUrl} 
              alt="QR Code de indicação"
              className="w-56 h-56"
            />
          </div>

          {/* Instrução */}
          <div className="flex items-center gap-2 text-center">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Peça para escanear com a câmera do celular
            </span>
          </div>

          {/* Código */}
          <div className="w-full p-4 bg-muted/50 rounded-xl text-center">
            <p className="text-xs text-muted-foreground mb-1">Seu código de indicação</p>
            <p className="font-mono font-bold text-2xl text-primary">{referralCode}</p>
          </div>

          {/* Botões */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copiar link
            </Button>
            <Button 
              variant="default" 
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Quando alguém usa seu código, você cria{' '}
            <span className="font-semibold text-primary">ondas de impacto</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

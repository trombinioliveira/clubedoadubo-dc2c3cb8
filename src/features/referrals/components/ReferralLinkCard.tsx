import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Link2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralLinkCardProps {
  referralCode: string | null;
  referralLink: string | null;
}

export function ReferralLinkCard({ referralCode, referralLink }: ReferralLinkCardProps) {
  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado!', {
      description: 'Compartilhe e amplie sua onda de impacto.',
    });
  };

  const shareLink = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clube do Adubo - Junte-se ao ciclo!',
          text: 'Faça parte da economia circular urbana. Transforme resíduos em impacto real.',
          url: referralLink,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  if (!referralCode) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardContent className="p-6 text-center">
          <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Seu código de indicação será gerado automaticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Seu link de impacto</h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe e amplie sua onda de impacto
              </p>
            </div>
          </div>

          {/* Code display */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={referralLink || ''}
                readOnly
                className="font-mono text-sm bg-muted pr-10"
              />
              <code className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-secondary/20 px-2 py-0.5 rounded text-secondary font-bold">
                {referralCode}
              </code>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyLink} variant="secondary" size="icon" className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={shareLink} variant="outline" size="icon" className="shrink-0">
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Public page link */}
          <p className="text-xs text-muted-foreground">
            Sua página pública de impacto:{' '}
            <a 
              href={referralLink || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:underline"
            >
              {referralLink}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

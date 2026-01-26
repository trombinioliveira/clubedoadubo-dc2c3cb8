import React from 'react';
import { ImpactWave } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaveIcon } from './icons/CycleIcons';
import { Users, Leaf, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImpactWaveCardProps {
  wave: ImpactWave;
  referralCode: string;
}

export const ImpactWaveCard = ({ wave, referralCode }: ImpactWaveCardProps) => {
  const referralLink = `https://clubedoadubo.com/r/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado!', {
      description: 'Compartilhe com amigos e amplie sua onda de impacto.',
    });
  };

  return (
    <Card className="overflow-hidden shadow-elevated">
      <CardHeader className="warmth-gradient text-secondary-foreground pb-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Sua Onda de Impacto</CardTitle>
          <WaveIcon className="w-6 h-6" />
        </div>
      </CardHeader>
      <CardContent className="-mt-4 relative">
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{wave.totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Pessoas na onda</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Leaf className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{wave.totalPros}</p>
              <p className="text-xs text-muted-foreground">PROs ativados</p>
            </div>
          </div>

          {/* Impact metrics */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">Adubo gerado</span>
              <span className="font-bold text-primary">{wave.totalFertilizerKg} kg</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">CO₂ evitado</span>
              </div>
              <span className="font-bold text-primary">{wave.totalCO2Saved} kg</span>
            </div>
          </div>

          {/* Referral link */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">Seu link de indicação:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono text-muted-foreground"
              />
              <Button onClick={copyLink} variant="secondary" size="sm">
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

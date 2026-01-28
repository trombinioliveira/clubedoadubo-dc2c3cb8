import React from 'react';
import { ImpactWave, PRO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WaveIcon } from './icons/CycleIcons';
import { Users, Leaf, Wind, Link2, Calendar, ShoppingCart, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImpactWaveTabsCardProps {
  wave: ImpactWave;
  referralCode: string;
  pros: PRO[];
}

// Mock referral data - in production this would come from the database
const mockReferrals = [
  { 
    id: '1', 
    name: 'João Santos', 
    joinedAt: new Date('2024-02-10'), 
    prosCount: 15,
    hasPurchased: true 
  },
  { 
    id: '2', 
    name: 'Ana Oliveira', 
    joinedAt: new Date('2024-02-15'), 
    prosCount: 8,
    hasPurchased: true 
  },
  { 
    id: '3', 
    name: 'Carlos Lima', 
    joinedAt: new Date('2024-02-20'), 
    prosCount: 0,
    hasPurchased: false 
  },
  { 
    id: '4', 
    name: 'Paula Costa', 
    joinedAt: new Date('2024-03-01'), 
    prosCount: 22,
    hasPurchased: true 
  },
];

export const ImpactWaveTabsCard = ({ wave, referralCode, pros }: ImpactWaveTabsCardProps) => {
  const referralLink = `https://clubedoadubo.com/r/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado!', {
      description: 'Compartilhe com amigos e amplie sua onda de impacto.',
    });
  };

  // Calculate stats from PROs
  const totalWeight = pros.reduce((sum, pro) => sum + pro.weight, 0);
  const paidPros = pros.filter(p => p.status === 'paid').length;
  const pendingPros = pros.filter(p => p.status !== 'paid').length;

  return (
    <Card className="overflow-hidden shadow-elevated">
      <CardHeader className="warmth-gradient text-secondary-foreground pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Seu Impacto</CardTitle>
          <WaveIcon className="w-6 h-6" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="pros" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-auto -mt-2 mb-4">
            <TabsTrigger value="pros" className="text-xs py-2">
              <Leaf className="w-3 h-3 mr-1" />
              Meus PROs
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs py-2">
              <Share2 className="w-3 h-3 mr-1" />
              Meu Impacto
            </TabsTrigger>
          </TabsList>

          {/* Meus PROs Tab */}
          <TabsContent value="pros" className="mt-0 space-y-4">
            {/* PRO Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{pros.length}</p>
                <p className="text-xs text-muted-foreground">Total de PROs</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{(totalWeight / 1000).toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">Resíduo total</p>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded-lg">
                <span className="text-sm">Pagos</span>
                <span className="font-bold text-emerald-600">{paidPros}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-500/10 rounded-lg">
                <span className="text-sm">Na fila</span>
                <span className="font-bold text-amber-600">{pendingPros}</span>
              </div>
            </div>

            {/* Environmental impact */}
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Impacto Ambiental</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Adubo gerado</p>
                  <p className="font-bold text-primary">{(totalWeight * 0.6 / 1000).toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CO₂ evitado</p>
                  <p className="font-bold text-primary">{(totalWeight * 2.5 / 1000).toFixed(2)} kg</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Meu Impacto Tab */}
          <TabsContent value="impact" className="mt-0 space-y-4">
            {/* Referral stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 mx-auto text-secondary mb-1" />
                <p className="text-2xl font-bold text-foreground">{wave.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Indicados</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <ShoppingCart className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">{wave.totalPros}</p>
                <p className="text-xs text-muted-foreground">PROs da rede</p>
              </div>
            </div>

            {/* Referral list */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Pessoas que entraram pelo seu link
              </p>
              <div className="max-h-[120px] overflow-y-auto space-y-1">
                {mockReferrals.map((referral) => (
                  <div 
                    key={referral.id} 
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(referral.joinedAt, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      {referral.hasPurchased ? (
                        <span className="text-xs text-primary font-medium">
                          {referral.prosCount} PROs
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Ainda não comprou
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral link */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Seu link de indicação
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-2 py-1.5 bg-muted rounded-lg text-xs font-mono text-muted-foreground"
                />
                <Button onClick={copyLink} variant="secondary" size="sm">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Em breve: comissões por indicações na economia circular!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
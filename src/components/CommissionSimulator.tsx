import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { Calculator, Leaf, DollarSign, Package, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommissionSimulatorProps {
  currentLevel: number;
  currentRate: number;
  activeReferrals: number;
}

const commissionLevels = [
  { level: 1, label: 'Iniciante', minReferrals: 0, maxReferrals: 5, rate: 5 },
  { level: 2, label: 'Ativo', minReferrals: 6, maxReferrals: 15, rate: 7 },
  { level: 3, label: 'Embaixador', minReferrals: 16, maxReferrals: 30, rate: 10 },
  { level: 4, label: 'Líder', minReferrals: 31, maxReferrals: 999, rate: 15 },
];

const PRO_VALUE = 2; // R$ 2,00 por PRO quando pago

export const CommissionSimulator = ({
  currentLevel,
  currentRate,
  activeReferrals
}: CommissionSimulatorProps) => {
  const [salesAmount, setSalesAmount] = useState([500]); // R$ 500 inicial
  
  const currentLevelInfo = commissionLevels.find(l => l.level === currentLevel) || commissionLevels[0];
  
  const simulation = useMemo(() => {
    const sales = salesAmount[0];
    const commission = (sales * currentRate) / 100;
    
    return {
      pros: Math.floor(commission / PRO_VALUE),
      money: commission,
      fertilizer: commission / 15, // ~R$ 15/kg de adubo
      co2Saved: (Math.floor(commission / PRO_VALUE) * 100 * 2.5) / 1000, // kg CO2
    };
  }, [salesAmount, currentRate]);

  const nextLevel = commissionLevels.find(l => l.level === currentLevel + 1);
  const referralsToNextLevel = nextLevel ? nextLevel.minReferrals - activeReferrals : 0;

  return (
    <Card className="overflow-hidden shadow-elevated">
      <CardHeader className="gold-gradient text-accent-foreground pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Simulador de Comissões
            </CardTitle>
            <CardDescription className="text-accent-foreground/80 mt-1">
              Veja quanto você pode ganhar com suas indicações
            </CardDescription>
          </div>
          <HelpTooltip 
            content="Este simulador mostra estimativas baseadas no seu nível atual. Os valores reais dependem das vendas realizadas."
            className="bg-white/20 hover:bg-white/30"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Current Level */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full earth-gradient flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu nível</p>
              <p className="font-bold text-foreground">{currentLevelInfo.label}</p>
            </div>
          </div>
          <Badge className="text-lg px-3 py-1 earth-gradient text-white">
            {currentRate}%
          </Badge>
        </div>

        {/* Progress to next level */}
        {nextLevel && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Próximo nível: {nextLevel.label} ({nextLevel.rate}%)</span>
              <span className="font-medium text-primary">Faltam {referralsToNextLevel} indicados</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full earth-gradient"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(((activeReferrals - currentLevelInfo.minReferrals) / 
                    (nextLevel.minReferrals - currentLevelInfo.minReferrals)) * 100, 100)}%` 
                }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}

        {/* Sales Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Simular vendas de adubo:</p>
            <p className="text-xl font-bold text-primary">
              R$ {salesAmount[0].toLocaleString('pt-BR')}
            </p>
          </div>
          <Slider
            value={salesAmount}
            onValueChange={setSalesAmount}
            min={100}
            max={5000}
            step={100}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 100</span>
            <span>R$ 5.000</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Se você escolher receber em:
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {/* PROs Option */}
            <motion.div 
              className="p-4 rounded-xl earth-gradient text-white text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Leaf className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{simulation.pros}</p>
              <p className="text-xs text-white/80">PROs</p>
              <p className="text-xs text-white/60 mt-1">
                +{simulation.co2Saved.toFixed(1)}kg CO₂
              </p>
            </motion.div>
            
            {/* Money Option */}
            <motion.div 
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white text-center"
              whileHover={{ scale: 1.02 }}
            >
              <DollarSign className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                R$ {simulation.money.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-white/80">Saldo</p>
              <p className="text-xs text-white/60 mt-1">
                Resgate via PIX
              </p>
            </motion.div>
            
            {/* Fertilizer Option */}
            <motion.div 
              className="p-4 rounded-xl warmth-gradient text-white text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Package className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {simulation.fertilizer.toFixed(1)}kg
              </p>
              <p className="text-xs text-white/80">Adubo</p>
              <p className="text-xs text-white/60 mt-1">
                Crédito em produto
              </p>
            </motion.div>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-accent/10 rounded-lg text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">💡 Dica:</strong> Quanto mais indicados ativos, maior sua taxa de comissão. 
            Continue indicando para subir de nível!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

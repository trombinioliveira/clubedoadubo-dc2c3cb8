import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  Leaf, 
  Wind, 
  Sprout,
  ChevronRight,
  Recycle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnvironmentalImpactCardProps {
  totalPros: number;
}

export function EnvironmentalImpactCard({ totalPros }: EnvironmentalImpactCardProps) {
  const navigate = useNavigate();

  // Métricas de impacto baseadas no peso do resíduo
  // 1 PRO = 100g = 0.1kg
  const weightKg = (totalPros * 100) / 1000;
  const co2Avoided = weightKg * 2.5; // kg CO2 evitado
  const soilRegenerated = weightKg * 0.6; // kg de adubo gerado

  const metrics = [
    {
      id: 'waste',
      label: 'Resíduo processado',
      value: weightKg >= 1 ? `${weightKg.toFixed(1)} kg` : `${(weightKg * 1000).toFixed(0)} g`,
      icon: Recycle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'co2',
      label: 'CO₂ evitado',
      value: `${co2Avoided >= 1 ? co2Avoided.toFixed(1) : (co2Avoided * 1000).toFixed(0)} ${co2Avoided >= 1 ? 'kg' : 'g'}`,
      icon: Wind,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'soil',
      label: 'Adubo gerado',
      value: soilRegenerated >= 1 ? `${soilRegenerated.toFixed(1)} kg` : `${(soilRegenerated * 1000).toFixed(0)} g`,
      icon: Sprout,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            Impacto Ambiental Gerado
          </div>
          <HelpTooltip 
            content="Cada PRO representa resíduo que deixou de ir para o aterro e virou vida."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalPros === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-xl">
            <Leaf className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Adicione PROs para ver seu impacto ambiental
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={metric.id}
                  className="text-center p-3 bg-card rounded-xl border border-border"
                >
                  <div className={`w-10 h-10 rounded-full ${metric.bgColor} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <p className="text-lg font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Visualização metafórica */}
        {totalPros > 0 && (
          <div className="p-3 bg-emerald-500/10 rounded-xl text-center">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              🌱 Seu impacto já nutriu aproximadamente{' '}
              <span className="font-bold">{Math.max(1, Math.round(soilRegenerated * 10))} plantas</span>
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate('/fifo')}
        >
          Ver histórico de PROs
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

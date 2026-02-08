import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Recycle, Users, Award } from 'lucide-react';
import type { ReferralImpact } from '../hooks/useReferralData';

interface ImpactMetricsGridProps {
  impact: ReferralImpact;
  ownImpact: {
    totalPros: number;
    paidPros: number;
    totalWeightGrams: number;
    co2AvoidedKg: number;
    fertilizerKg: number;
  };
}

export function ImpactMetricsGrid({ impact, ownImpact }: ImpactMetricsGridProps) {
  const metrics = [
    {
      label: 'Meus PROs',
      value: ownImpact.totalPros,
      suffix: '',
      icon: Award,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      label: 'Pessoas Convidadas',
      value: impact.totalReferrals,
      suffix: '',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Resíduo Processado',
      value: ((ownImpact.totalWeightGrams + impact.totalWeightGrams) / 1000).toFixed(1),
      suffix: 'kg',
      icon: Recycle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/20',
    },
    {
      label: 'CO₂ Evitado',
      value: (ownImpact.co2AvoidedKg + impact.co2AvoidedKg).toFixed(1),
      suffix: 'kg',
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-600/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${metric.bgColor} flex items-center justify-center shrink-0`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground truncate">
                  {metric.value}
                  {metric.suffix && <span className="text-sm font-normal ml-1">{metric.suffix}</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

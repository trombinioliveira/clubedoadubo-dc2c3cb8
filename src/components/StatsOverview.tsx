import React from 'react';
import { PRO } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock, CheckCircle, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  pros: PRO[];
}

export const StatsOverview = ({ pros }: StatsOverviewProps) => {
  const totalPros = pros.length;
  const paidPros = pros.filter(p => p.status === 'paid').length;
  const inQueuePros = pros.filter(p => ['processing', 'ready', 'sold'].includes(p.status)).length;
  const totalEarned = paidPros * 2;

  const stats = [
    {
      label: 'PROs Ativados',
      value: totalPros,
      icon: Sparkles,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Na Fila',
      value: inQueuePros,
      icon: Clock,
      color: 'text-accent-foreground',
      bg: 'bg-accent/20',
    },
    {
      label: 'Pagos',
      value: paidPros,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Recebido',
      value: `R$ ${totalEarned}`,
      icon: Banknote,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="shadow-soft hover:shadow-elevated transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

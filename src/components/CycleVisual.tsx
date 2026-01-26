import React from 'react';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon, RecycleIcon } from './icons/CycleIcons';
import { ArrowRight, RotateCcw } from 'lucide-react';

const steps = [
  { icon: LeafIcon, label: 'Resíduo', sublabel: 'Orgânico' },
  { icon: CompostIcon, label: 'PRO', sublabel: 'Processamento' },
  { icon: FertilizerIcon, label: 'Adubo', sublabel: 'Natural' },
  { icon: MoneyIcon, label: 'Venda', sublabel: 'Valor gerado' },
];

export const CycleVisual = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="relative">
        {/* Mobile: vertical layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl earth-gradient flex items-center justify-center shadow-elevated">
                <step.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.sublabel}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
              )}
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <div className="w-16 h-16 rounded-2xl warmth-gradient flex items-center justify-center shadow-elevated">
              <RotateCcw className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-bold text-secondary">Novo Ciclo</p>
              <p className="text-sm text-muted-foreground">O ciclo se repete</p>
            </div>
          </div>
        </div>

        {/* Desktop: circular layout */}
        <div className="hidden md:flex items-center justify-between gap-4 relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 rounded-2xl earth-gradient flex items-center justify-center shadow-elevated group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.sublabel}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-8 h-8 text-primary animate-pulse-slow" />
              )}
            </React.Fragment>
          ))}
          <ArrowRight className="w-8 h-8 text-secondary animate-pulse-slow" />
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-20 h-20 rounded-2xl warmth-gradient flex items-center justify-center shadow-elevated group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <RotateCcw className="w-10 h-10 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-bold text-secondary">Novo Ciclo</p>
              <p className="text-sm text-muted-foreground">O ciclo se repete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

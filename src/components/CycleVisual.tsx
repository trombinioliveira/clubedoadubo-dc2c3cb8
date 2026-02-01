import React from 'react';
import { LeafIcon, CompostIcon, FertilizerIcon, MoneyIcon, RecycleIcon } from './icons/CycleIcons';
import { ArrowRight, ArrowDown, RotateCcw } from 'lucide-react';

const steps = [
  { icon: LeafIcon, label: 'Resíduo', sublabel: 'Orgânico' },
  { icon: CompostIcon, label: 'PRO', sublabel: 'Processamento' },
  { icon: FertilizerIcon, label: 'Adubo', sublabel: 'Natural' },
  { icon: MoneyIcon, label: 'Venda', sublabel: 'Valor gerado' },
];

export const CycleVisual = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
      <div className="relative">
        {/* Mobile: vertical layout with arrows */}
        <div className="flex flex-col gap-3 sm:gap-4 md:hidden">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 sm:gap-4 bg-card rounded-xl p-3 sm:p-4 border border-border">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl earth-gradient flex items-center justify-center shadow-elevated flex-shrink-0">
                  <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm sm:text-base">{step.label}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.sublabel}</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-bold text-muted-foreground flex-shrink-0">
                  {index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1 sm:py-2">
                  <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-bounce" />
                </div>
              )}
            </div>
          ))}
          
          {/* Novo Ciclo card */}
          <div className="mt-2 sm:mt-3 pt-3 sm:pt-4 border-t border-border">
            <div className="flex items-center gap-3 sm:gap-4 bg-secondary/10 rounded-xl p-3 sm:p-4 border border-secondary/30">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl warmth-gradient flex items-center justify-center shadow-elevated flex-shrink-0">
                <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-secondary text-sm sm:text-base">Novo Ciclo</p>
                <p className="text-xs sm:text-sm text-muted-foreground">O ciclo se repete</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tablet: compact horizontal layout */}
        <div className="hidden md:flex lg:hidden items-center justify-center gap-2 flex-wrap">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-xl earth-gradient flex items-center justify-center shadow-elevated group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.sublabel}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-primary animate-pulse-slow flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
          <ArrowRight className="w-5 h-5 text-secondary animate-pulse-slow flex-shrink-0" />
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-xl warmth-gradient flex items-center justify-center shadow-elevated group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
              <RotateCcw className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-bold text-secondary text-sm">Novo Ciclo</p>
              <p className="text-xs text-muted-foreground">O ciclo se repete</p>
            </div>
          </div>
        </div>

        {/* Desktop: full horizontal layout */}
        <div className="hidden lg:flex items-center justify-between gap-4 relative">
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

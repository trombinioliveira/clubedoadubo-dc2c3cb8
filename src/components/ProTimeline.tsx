import React from 'react';
import { PRO } from '@/types';
import { getStatusLabel } from '@/data/mockData';
import { Check, Clock, Package, Banknote, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProTimelineProps {
  pro: PRO;
}

const timelineSteps = [
  { status: 'created', label: 'PRO Ativado', icon: Sparkles },
  { status: 'processing', label: 'Em Processamento', icon: Clock },
  { status: 'ready', label: 'Virou Adubo', icon: Package },
  { status: 'sold', label: 'Adubo Vendido', icon: Check },
  { status: 'paid', label: 'Pagamento Liberado', icon: Banknote },
];

const getStepIndex = (status: PRO['status']) => {
  const statusOrder = { processing: 1, ready: 2, sold: 3, paid: 4 };
  return statusOrder[status];
};

export const ProTimeline = ({ pro }: ProTimelineProps) => {
  const currentStep = getStepIndex(pro.status);

  return (
    <div className="w-full p-4">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
        
        {/* Progress bar filled */}
        <div 
          className="absolute top-6 left-0 h-1 earth-gradient rounded-full transition-all duration-700"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.status} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                    isCompleted 
                      ? "earth-gradient shadow-elevated" 
                      : "bg-muted",
                    isCurrent && "ring-4 ring-primary/30 shadow-glow"
                  )}
                >
                  <StepIcon 
                    className={cn(
                      "w-5 h-5",
                      isCompleted ? "text-primary-foreground" : "text-muted-foreground"
                    )} 
                  />
                </div>
                <p 
                  className={cn(
                    "mt-3 text-xs font-medium text-center max-w-[70px]",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

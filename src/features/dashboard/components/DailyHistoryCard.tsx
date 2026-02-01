import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  History, 
  Coffee, 
  ShoppingCart, 
  Car,
  Plus,
  Sparkles,
  Gift
} from 'lucide-react';

interface HistoryItem {
  id: string;
  value: number;
  label: string;
  icon: 'coffee' | 'shopping' | 'transport' | 'gift' | 'other';
  time: string;
}

interface DailyHistoryCardProps {
  history: HistoryItem[];
  onRegisterAction: () => void;
}

const ICON_MAP = {
  coffee: Coffee,
  shopping: ShoppingCart,
  transport: Car,
  gift: Gift,
  other: Sparkles,
};

export function DailyHistoryCard({ history, onRegisterAction }: DailyHistoryCardProps) {
  // Mock data para quando não houver histórico real
  const displayHistory = history.length > 0 ? history : [
    { id: '1', value: 2, label: 'café', icon: 'coffee' as const, time: 'Hoje, 08:30' },
    { id: '2', value: 1, label: 'mercado', icon: 'shopping' as const, time: 'Ontem, 19:45' },
    { id: '3', value: 3, label: 'transporte', icon: 'transport' as const, time: 'Ontem, 07:15' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico Diário
          </div>
          <HelpTooltip 
            content="Esse histórico ajuda você a visualizar seus hábitos."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayHistory.slice(0, 5).map((item) => {
          const Icon = ICON_MAP[item.icon] || Sparkles;
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">
                    +{item.value} PRO{item.value > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    — {item.label}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {item.time}
              </span>
            </div>
          );
        })}

        {/* Frase motivacional */}
        <p className="text-xs text-center text-muted-foreground italic pt-2">
          "Pequenas ações constroem grandes níveis."
        </p>

        {/* Botão registrar */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={onRegisterAction}
        >
          <Plus className="w-4 h-4" />
          Registrar gasto do dia com PROs
        </Button>
      </CardContent>
    </Card>
  );
}

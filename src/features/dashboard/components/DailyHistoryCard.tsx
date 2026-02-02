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
  Gift,
  UtensilsCrossed,
  Footprints,
  Leaf,
  Recycle,
  Link2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  value: number;
  label: string;
  emoji: string;
  time: string;
  date: string;
}

interface DailyHistoryCardProps {
  history: HistoryItem[];
  onRegisterAction: () => void;
}

export function DailyHistoryCard({ history, onRegisterAction }: DailyHistoryCardProps) {
  // Mock data para demonstração
  const displayHistory: HistoryItem[] = history.length > 0 ? history : [
    { id: '1', value: 1, label: 'Café consciente', emoji: '☕', time: '08:30', date: 'Hoje' },
    { id: '2', value: 2, label: 'Compra local', emoji: '🛒', time: '14:15', date: 'Hoje' },
    { id: '3', value: 1, label: 'Mobilidade urbana', emoji: '🚶', time: '07:45', date: 'Ontem' },
    { id: '4', value: 3, label: 'Resíduo ativado', emoji: '🌱', time: '19:00', date: 'Ontem' },
    { id: '5', value: 2, label: 'Refeição urbana', emoji: '🍽', time: '12:30', date: 'Há 2 dias' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Diário de Impacto
          </div>
          <HelpTooltip 
            content="Acompanhe suas ações diárias transformadas em PROs. Pequenos hábitos constroem grandes impactos."
          />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Suas ações recentes no ciclo
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayHistory.slice(0, 5).map((item, index) => (
          <motion.div 
            key={item.id}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.emoji}</span>
              <div>
                <span className="text-sm font-semibold text-primary">
                  +{item.value} PRO{item.value > 1 ? 's' : ''}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  — {item.label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {item.date}, {item.time}
              </p>
            </div>
          </motion.div>
        ))}

        {displayHistory.length === 0 && (
          <div className="text-center py-8 bg-muted/20 rounded-xl">
            <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Seu histórico aparecerá aqui
            </p>
          </div>
        )}

        {/* Motivational quote */}
        <p className="text-xs text-center text-muted-foreground italic pt-3 border-t border-border">
          "Pequenas ações constroem grandes níveis."
        </p>

        {/* Register action button */}
        <Button 
          variant="outline" 
          className="w-full gap-2 mt-2"
          onClick={onRegisterAction}
        >
          <Plus className="w-4 h-4" />
          Registrar ação do dia
        </Button>
      </CardContent>
    </Card>
  );
}

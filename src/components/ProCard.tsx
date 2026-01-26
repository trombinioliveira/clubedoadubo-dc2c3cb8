import React from 'react';
import { PRO } from '@/types';
import { getStatusLabel, getStatusColor } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProTimeline } from './ProTimeline';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProCardProps {
  pro: PRO;
  expanded?: boolean;
  onClick?: () => void;
}

export const ProCard = ({ pro, expanded = false, onClick }: ProCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer",
        expanded && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-sm text-muted-foreground">{pro.code}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ativado em {format(pro.createdAt, "dd 'de' MMM, yyyy", { locale: ptBR })}
            </p>
          </div>
          <Badge 
            className={cn(
              "font-semibold",
              pro.status === 'processing' && "bg-accent text-accent-foreground",
              pro.status === 'ready' && "bg-primary text-primary-foreground",
              pro.status === 'sold' && "bg-secondary text-secondary-foreground",
              pro.status === 'paid' && "bg-emerald-500 text-white"
            )}
          >
            {getStatusLabel(pro.status)}
          </Badge>
        </div>

        {expanded && (
          <div className="mt-4 animate-fade-in">
            <ProTimeline pro={pro} />
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posição na fila</span>
                <span className="font-semibold">{pro.fifoPosition}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Peso do resíduo</span>
                <span className="font-semibold">{pro.weight}g</span>
              </div>
              {pro.status === 'paid' && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Valor recebido</span>
                  <span className="font-semibold text-emerald-600">R$ 2,00</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!expanded && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Posição: #{pro.fifoPosition}</span>
            <span className="text-xs text-primary font-medium">Ver detalhes →</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

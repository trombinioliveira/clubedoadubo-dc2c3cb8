import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProStatus = 'pending' | 'processing' | 'ready' | 'sold' | 'paid';

interface StageInfo {
  key: string;
  title: string;
  icon: string;
  statuses: ProStatus[];
  description: string;
  whatHappens: string;
  whyImportant: string;
  whatAdvances: string;
  curiosity: string;
  color: string;
}

const stagesInfo: StageInfo[] = [
  {
    key: 'pending',
    title: 'Coleta',
    icon: '📍',
    statuses: ['pending'],
    description: 'O resíduo foi ativado e aguarda coleta física.',
    whatHappens: 'O PRO foi comprado e entra na fila. O resíduo está pronto para ser coletado no ponto de coleta.',
    whyImportant: 'É a entrada oficial no sistema. Sem coleta, não há processamento.',
    whatAdvances: 'Quando o resíduo é pesado e registrado no ponto de coleta.',
    curiosity: 'Essa etapa depende de logística real. Quanto mais pontos de coleta, mais rápido o ciclo começa.',
    color: 'amber'
  },
  {
    key: 'processing',
    title: 'Processamento',
    icon: '🏭',
    statuses: ['processing'],
    description: 'O resíduo está sendo compostado.',
    whatHappens: 'A compostagem transforma resíduos orgânicos em adubo natural através de processos biológicos.',
    whyImportant: 'É o coração do ciclo. Aqui o resíduo vira recurso.',
    whatAdvances: 'Quando a compostagem atinge a maturação ideal (45-90 dias, dependendo do processo).',
    curiosity: 'Essa etapa leva tempo biológico. Não pode ser acelerada artificialmente.',
    color: 'blue'
  },
  {
    key: 'ready',
    title: 'Produção',
    icon: '🌾',
    statuses: ['ready'],
    description: 'O adubo está pronto e disponível para venda.',
    whatHappens: 'O composto passou por cura e está pronto. É ensacado e distribuído para pontos de venda.',
    whyImportant: 'O valor foi gerado fisicamente. Agora precisa ser comercializado.',
    whatAdvances: 'Quando o adubo é vendido a um comprador real.',
    curiosity: 'Cada 100g de resíduo processado gera cerca de 30g de adubo concentrado.',
    color: 'green'
  },
  {
    key: 'sold',
    title: 'Venda',
    icon: '📦',
    statuses: ['sold'],
    description: 'O adubo foi vendido. O dinheiro entrou.',
    whatHappens: 'Um comprador pagou pelo adubo. O valor é registrado no Fundo de Retorno Circular.',
    whyImportant: 'É aqui que o dinheiro entra no sistema — através de vendas reais.',
    whatAdvances: 'Quando o pagamento é processado para o primeiro da fila FIFO.',
    curiosity: 'Essa etapa só acontece quando há compra real. O dinheiro vem da venda, não de novas pessoas.',
    color: 'purple'
  },
  {
    key: 'paid',
    title: 'Pago',
    icon: '💰',
    statuses: ['paid'],
    description: 'O ciclo foi concluído. O valor foi distribuído.',
    whatHappens: 'O Real do Ciclo foi transferido para quem estava na primeira posição da fila FIFO.',
    whyImportant: 'Fecha o ciclo da economia circular. O impacto gerou valor real.',
    whatAdvances: 'Este é o estágio final. O PRO cumpriu seu ciclo completo.',
    curiosity: 'Cada PRO pago libera a posição para o próximo da fila avançar.',
    color: 'emerald'
  }
];

interface CycleStagesBlockProps {
  stats: {
    pending: number;
    processing: number;
    ready: number;
    sold: number;
    paid: number;
  };
  userStats?: {
    pending: number;
    processing: number;
    ready: number;
    sold: number;
    paid: number;
  };
}

export function CycleStagesBlock({ stats, userStats }: CycleStagesBlockProps) {
  const [selectedStage, setSelectedStage] = useState<StageInfo | null>(null);
  const [expanded, setExpanded] = useState(false);

  const getStageCount = (key: string) => {
    return stats[key as keyof typeof stats] || 0;
  };

  const getUserStageCount = (key: string) => {
    if (!userStats) return 0;
    return userStats[key as keyof typeof userStats] || 0;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
      green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', badge: 'bg-green-100 text-green-800' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' }
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">
          Etapas do Ciclo
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-1 text-muted-foreground"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Recolher' : 'Expandir'}
        </Button>
      </div>

      {/* Desktop: Horizontal flow */}
      <div className="hidden md:flex items-stretch gap-2">
        {stagesInfo.map((stage, idx) => {
          const colors = getColorClasses(stage.color);
          const globalCount = getStageCount(stage.key);
          const userCount = getUserStageCount(stage.key);

          return (
            <React.Fragment key={stage.key}>
              <button
                onClick={() => setSelectedStage(stage)}
                className={`flex-1 p-4 rounded-xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block">{stage.icon}</span>
                  <p className={`font-semibold ${colors.text}`}>{stage.title}</p>
                  <div className="mt-2 space-y-1">
                    <Badge className={`${colors.badge} border-0`}>
                      🌍 {globalCount}
                    </Badge>
                    {userCount > 0 && (
                      <Badge variant="outline" className="block text-xs">
                        👤 {userCount} seus
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-4 h-4 mx-auto text-muted-foreground" />
                  </div>
                </div>
              </button>
              {idx < stagesInfo.length - 1 && (
                <div className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: Vertical flow */}
      <div className="md:hidden space-y-3">
        {stagesInfo.map((stage, idx) => {
          const colors = getColorClasses(stage.color);
          const globalCount = getStageCount(stage.key);
          const userCount = getUserStageCount(stage.key);

          return (
            <button
              key={stage.key}
              onClick={() => setSelectedStage(stage)}
              className={`w-full p-4 rounded-xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{stage.icon}</span>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${colors.text}`}>
                    {idx + 1}. {stage.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`${colors.badge} border-0`}>
                    🌍 {globalCount}
                  </Badge>
                  {userCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      👤 {userCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded descriptions */}
      {expanded && (
        <div className="mt-6 grid md:grid-cols-5 gap-3">
          {stagesInfo.map((stage) => {
            const colors = getColorClasses(stage.color);
            return (
              <Card key={stage.key} className={`${colors.bg} ${colors.border}`}>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stage detail modal */}
      <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedStage?.icon}</span>
              {selectedStage?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedStage && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${getColorClasses(selectedStage.color).bg}`}>
                <p className="text-sm font-medium">{selectedStage.description}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    O que acontece aqui?
                  </p>
                  <p className="text-sm">{selectedStage.whatHappens}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Por que é importante?
                  </p>
                  <p className="text-sm">{selectedStage.whyImportant}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    O que faz avançar?
                  </p>
                  <p className="text-sm">{selectedStage.whatAdvances}</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    💡 Curiosidade
                  </p>
                  <p className="text-sm text-muted-foreground italic">{selectedStage.curiosity}</p>
                </div>
              </div>

              <div className="text-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  O valor só se move quando o ciclo acontece.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Leaf, 
  ShoppingBag,
  Recycle,
  Check,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpTooltip } from '@/components/shared/HelpTooltip';

export function CloseCycleSection() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'subscription',
      icon: Leaf,
      emoji: '🌿',
      title: 'Assinatura Circular',
      subtitle: 'Receba adubo em casa',
      description: 'Mantenha o impacto ativo todo mês',
      benefits: [
        'Impacto contínuo',
        'Ciclo automático',
        'Recorrência consciente',
      ],
      cta: 'Ativar assinatura',
      action: () => navigate('/planos?tab=assinatura'),
      gradient: 'from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      priority: true,
    },
    {
      id: 'single-purchase',
      icon: ShoppingBag,
      emoji: '🪴',
      title: 'Adubo Sustentável',
      subtitle: 'Produzido na sua cidade',
      description: 'A partir dos resíduos urbanos',
      benefits: [
        'Impacto imediato',
      ],
      cta: 'Comprar adubo',
      action: () => navigate('/planos?tab=avulsa'),
      gradient: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      priority: false,
    },
    {
      id: 'complete',
      icon: Recycle,
      emoji: '♻️',
      title: 'Fechamento Completo',
      subtitle: 'Ative resíduo + receba adubo',
      description: 'O ciclo se completa em você',
      benefits: [
        'Impacto + retorno físico',
        'Modelo completo',
      ],
      cta: 'Fechar o ciclo agora',
      action: () => navigate('/planos?tab=ciclo'),
      gradient: 'from-purple-500/10 to-indigo-500/10',
      borderColor: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
      priority: false,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">
              Feche o Ciclo ♻️
            </h2>
            <HelpTooltip 
              content="Quando o adubo circula, o sistema se mantém vivo. O impacto volta para você em forma de adubo."
            />
          </div>
          <p className="text-sm text-muted-foreground">
            O impacto volta para você em forma de adubo
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`h-full bg-gradient-to-br ${card.gradient} border ${card.borderColor} ${
                  card.priority ? 'ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  {card.priority && (
                    <span className="inline-flex self-start items-center gap-1 px-2 py-0.5 mb-3 text-[10px] font-medium bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                      ✨ Recomendado
                    </span>
                  )}

                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                    <span className="text-2xl">{card.emoji}</span>
                  </div>

                  <h3 className="font-bold text-foreground text-base mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-foreground font-medium">
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    {card.description}
                  </p>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {card.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className={`w-3 h-3 ${card.iconColor} shrink-0`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={card.priority ? 'default' : 'outline'}
                    className="w-full gap-2"
                    onClick={card.action}
                  >
                    {card.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Educational copy */}
      <div className="p-4 bg-muted/30 rounded-xl text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Quando o adubo é vendido, o ciclo se completa.</span>
          <br />
          O impacto acontece, o sistema se sustenta e novos resíduos entram na fila.
        </p>
      </div>
    </section>
  );
}

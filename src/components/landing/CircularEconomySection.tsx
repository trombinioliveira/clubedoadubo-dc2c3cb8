import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import economiaCircularFluxograma from '@/assets/economia-circular-fluxograma.png';

export const CircularEconomySection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Como o ciclo funciona na prática
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Regras claras. Processo real. Nada acontece fora do sistema.
            </p>
          </div>

          {/* Fluxograma Image */}
          <div className="mb-8 sm:mb-10">
            <img
              src={economiaCircularFluxograma}
              alt="Fluxograma da Economia Circular do Clube do Adubo - Mostra o ciclo real do resíduo ao adubo, a distribuição justa de valor por venda (R$2 ao PRO ativo + R$1 para avanço da fila), e como indicações e missões aceleram o ciclo sem alterar a ordem da fila FIFO"
              className="w-full max-w-3xl mx-auto rounded-xl shadow-elevated"
              loading="lazy"
            />
          </div>

          {/* Frase-síntese */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 sm:p-6 mb-8 sm:mb-10">
            <div className="space-y-3 text-center">
              <div className="flex items-start justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  Cada venda paga quem está na vez.
                </p>
              </div>
              <div className="flex items-start justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  Cada venda ajuda a próxima pessoa a chegar mais rápido.
                </p>
              </div>
            </div>
          </div>

          {/* Link para aprofundamento */}
          <div className="text-center">
            <Link to="/economia-circular">
              <Button variant="outline" size="lg" className="gap-2">
                Entender todas as regras do ciclo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

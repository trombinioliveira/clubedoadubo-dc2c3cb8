import { Recycle } from 'lucide-react';

export function FifoHeroSection() {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-4 shadow-lg">
        <Recycle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
        Fila FIFO — Economia Circular Viva
      </h1>
      <p className="text-base sm:text-lg text-primary font-medium mb-4 max-w-xl mx-auto leading-relaxed">
        Aqui, o resíduo entra em ordem.<br />
        O impacto acontece em etapas.<br />
        E o valor retorna com justiça.
      </p>
      <div className="max-w-2xl mx-auto p-4 bg-muted/50 rounded-xl">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          A Fila FIFO (First In, First Out) é <strong className="text-foreground">única e global</strong>.<br />
          A ordem é cronológica e transparente.<br />
          <strong className="text-foreground">Quem entra primeiro, recebe primeiro.</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">
          Nada fura a fila. Nada acelera a fila.<br />
          A fila só anda quando o ciclo acontece.
        </p>
      </div>
    </div>
  );
}

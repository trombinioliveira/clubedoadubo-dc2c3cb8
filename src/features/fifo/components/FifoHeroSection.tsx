import { Recycle } from 'lucide-react';

export function FifoHeroSection() {
  return (
    <div className="mb-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-4 shadow-lg">
        <Recycle className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Fila FIFO — Economia Circular Viva
      </h1>
      <p className="text-lg text-emerald-700 font-medium mb-4 max-w-xl mx-auto">
        Aqui, o resíduo entra em ordem.<br />
        O impacto acontece em etapas.<br />
        E o valor retorna com justiça.
      </p>
      <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
        A Fila FIFO (First In, First Out) é <strong>única e global</strong>. 
        A ordem é cronológica e transparente. Quem entra primeiro, recebe primeiro. 
        Nada fura a fila. Nada acelera a fila. A fila só anda quando o ciclo acontece.
      </p>
    </div>
  );
}

import React from 'react';
import fifoFluxograma from '@/assets/fifo-economia-circular.png';

export function FifoFluxogramaSection() {
  return (
    <div className="mb-10">
      {/* Fluxograma Image - Full width, mobile-first */}
      <div className="rounded-xl overflow-hidden border border-border shadow-soft bg-card">
        <img
          src={fifoFluxograma}
          alt="Economia Circular do Clube do Adubo - Fluxograma completo mostrando o ciclo real, distribuição justa do valor por venda e o que acelera o ciclo"
          className="w-full h-auto"
          loading="eager"
        />
      </div>
      
      {/* Synthesis phrase below image */}
      <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl border border-primary/30">
        <p className="text-center text-base sm:text-lg font-bold text-foreground">
          Cada venda paga quem está na vez.
        </p>
        <p className="text-center text-sm sm:text-base font-medium text-primary mt-1">
          Cada venda ajuda a fila a avançar mais rápido.
        </p>
      </div>
    </div>
  );
}

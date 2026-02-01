import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, QrCode } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  onOpenPix: () => void;
  onOpenQrCode: () => void;
}

// Frases motivacionais dinâmicas
const MOTIVATIONAL_PHRASES = [
  "Seu impacto já está em movimento.",
  "Seu sonho cresce junto com a cidade.",
  "Cada PRO é um passo em direção ao seu futuro.",
  "Pequenas ações diárias constroem grandes resultados.",
  "A mudança começa com você.",
];

export function DashboardHeader({ userName, onOpenPix, onOpenQrCode }: DashboardHeaderProps) {
  // Seleciona uma frase baseada no dia atual (para variar)
  const phraseIndex = new Date().getDate() % MOTIVATIONAL_PHRASES.length;
  const phrase = MOTIVATIONAL_PHRASES[phraseIndex];

  return (
    <div className="bg-gradient-to-b from-primary/10 to-transparent py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          {/* Saudação */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Olá, {userName}! 🌱
            </h1>
            <p className="text-muted-foreground mt-1 italic">
              "{phrase}"
            </p>
          </div>

          {/* Botões fixos */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onOpenPix} variant="hero" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Adicionar PROs via PIX
            </Button>
            <Button onClick={onOpenQrCode} variant="outline" size="lg" className="gap-2">
              <QrCode className="w-5 h-5" />
              Meu QR Code pessoal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

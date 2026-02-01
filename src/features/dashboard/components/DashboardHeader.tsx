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
    <div className="bg-gradient-to-b from-primary/10 to-transparent py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          {/* Saudação */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Olá, {userName}! 🌱
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 italic">
              "{phrase}"
            </p>
          </div>

          {/* Botões fixos - empilhados em mobile, lado a lado em tablet+ */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={onOpenPix} 
              variant="hero" 
              size="lg" 
              className="gap-2 w-full sm:w-auto justify-center h-12 sm:h-11 text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:hidden">Adicionar PROs</span>
              <span className="hidden sm:inline">Adicionar PROs via PIX</span>
            </Button>
            <Button 
              onClick={onOpenQrCode} 
              variant="outline" 
              size="lg" 
              className="gap-2 w-full sm:w-auto justify-center h-12 sm:h-11 text-sm sm:text-base"
            >
              <QrCode className="w-5 h-5" />
              <span className="sm:hidden">Meu QR Code</span>
              <span className="hidden sm:inline">Meu QR Code pessoal</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

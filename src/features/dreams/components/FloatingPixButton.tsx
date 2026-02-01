import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { HelpTooltip } from '@/components/shared/HelpTooltip';

interface FloatingPixButtonProps {
  onClick: () => void;
}

export function FloatingPixButton({ onClick }: FloatingPixButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2">
      <div className="hidden sm:block">
        <HelpTooltip 
          content="Use PIX para adicionar PROs de forma simples e diária." 
          side="left"
        />
      </div>
      <Button
        onClick={onClick}
        size="lg"
        className="h-12 sm:h-14 px-4 sm:px-5 rounded-full shadow-elevated earth-gradient text-white font-semibold gap-2 touch-manipulation"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Adicionar PROs via PIX</span>
        <span className="sm:hidden text-sm">+ PROs</span>
      </Button>
    </div>
  );
}

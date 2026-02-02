import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingAddProsCTAProps {
  onClick: () => void;
}

export function FloatingAddProsCTA({ onClick }: FloatingAddProsCTAProps) {
  return (
    <motion.div 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-auto py-3 px-5 rounded-full shadow-elevated earth-gradient text-white font-semibold gap-3 touch-manipulation group"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </motion.div>
        <div className="flex flex-col items-start">
          <span className="text-sm sm:text-base font-bold leading-tight">
            Adicionar PROs agora
          </span>
          <span className="text-[10px] sm:text-xs opacity-80 leading-tight font-normal">
            via PIX • rápido • impacto imediato
          </span>
        </div>
        <Zap className="w-4 h-4 text-amber-300 hidden sm:block" />
      </Button>
    </motion.div>
  );
}

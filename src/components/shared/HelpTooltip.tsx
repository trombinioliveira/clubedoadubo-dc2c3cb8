import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const HelpTooltip = ({ content, side = 'top', className = '' }: HelpTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button 
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors ${className}`}
            type="button"
          >
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-[280px] text-sm bg-foreground text-background p-3 rounded-lg shadow-elevated"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';
import { LevelInfo, formatPros, MAX_LEVEL } from '../constants/levels';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { Lock, Check } from 'lucide-react';

interface LevelBarsDisplayProps {
  levels: LevelInfo[];
  currentLevel: number;
  totalPros: number;
  compact?: boolean;
  tooltipText?: string;
  showLabels?: boolean;
}

export function LevelBarsDisplay({
  levels,
  currentLevel,
  totalPros,
  compact = false,
  tooltipText,
  showLabels = true,
}: LevelBarsDisplayProps) {
  const barHeight = compact ? 'h-2' : 'h-3';
  const containerClass = compact ? 'gap-0.5' : 'gap-1';

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Nível {currentLevel} de {MAX_LEVEL}
            </span>
            {tooltipText && <HelpTooltip content={tooltipText} />}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatPros(totalPros)} PROs
          </span>
        </div>
      )}

      <div className={cn('flex', containerClass)}>
        {levels.map((level) => (
          <div
            key={level.level}
            className={cn(
              'flex-1 rounded-sm overflow-hidden relative group',
              barHeight,
              level.status === 'completed' && 'bg-emerald-500',
              level.status === 'current' && 'bg-muted',
              level.status === 'locked' && 'bg-muted/50'
            )}
            title={`Nível ${level.level}: ${formatPros(level.threshold)} PROs`}
          >
            {level.status === 'current' && (
              <div
                className="absolute inset-0 bg-amber-500 transition-all duration-300"
                style={{ width: `${level.progress}%` }}
              />
            )}
            
            {/* Tooltip on hover for desktop */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/80 flex items-center justify-center">
              {level.status === 'completed' ? (
                <Check className="w-2 h-2 text-white" />
              ) : level.status === 'locked' ? (
                <Lock className="w-2 h-2 text-white/50" />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Level markers */}
      {!compact && (
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          <span>1</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>21</span>
        </div>
      )}
    </div>
  );
}

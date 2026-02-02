import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  Globe, 
  Recycle, 
  Wind, 
  Sprout,
  Plus,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CollectiveImpactCardProps {
  userPros: number;
  onAddPro: () => void;
}

// Simulated collective impact data (in a real app, this would come from the backend)
const COLLECTIVE_IMPACT = {
  wasteKg: 12500, // kg de resíduo processado
  co2Kg: 31250, // kg de CO2 evitado
  soilKg: 7500, // kg de solo regenerado
};

export function CollectiveImpactCard({ userPros, onAddPro }: CollectiveImpactCardProps) {
  // User metrics
  const userWeightKg = (userPros * 100) / 1000;
  const userCo2 = userWeightKg * 2.5;
  const userSoil = userWeightKg * 0.6;

  // Calculate percentages for visual
  const userContributionPercent = Math.min((userWeightKg / COLLECTIVE_IMPACT.wasteKg) * 100, 100);
  const hasImpact = userPros > 0;

  // Ring calculations
  const outerRadius = 90;
  const innerRadius = 65;
  const strokeWidth = 12;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  return (
    <Card className="bg-gradient-to-br from-emerald-50/50 to-blue-50/30 dark:from-emerald-950/20 dark:to-blue-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Impacto Ambiental Coletivo 🌍
          </div>
          <HelpTooltip 
            content="Um ciclo vivo na sua cidade. O impacto coletivo sempre aparece — você entra em algo que já funciona."
          />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Um ciclo vivo na sua cidade
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Radial Chart */}
        <div className="relative w-full max-w-[220px] mx-auto aspect-square">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Outer ring - Collective (always visible) */}
            <circle
              cx="100"
              cy="100"
              r={outerRadius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              className="opacity-20"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={outerRadius}
              fill="none"
              stroke="hsl(142.1 76.2% 36.3%)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={outerCircumference}
              initial={{ strokeDashoffset: outerCircumference }}
              animate={{ strokeDashoffset: outerCircumference * 0.15 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="drop-shadow-sm"
            />

            {/* Inner ring - User */}
            <circle
              cx="100"
              cy="100"
              r={innerRadius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              className="opacity-10"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={innerRadius}
              fill="none"
              stroke={hasImpact ? "hsl(47.9 95.8% 53.1%)" : "hsl(var(--muted))"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={innerCircumference}
              initial={{ strokeDashoffset: innerCircumference }}
              animate={{ 
                strokeDashoffset: hasImpact 
                  ? innerCircumference * (1 - Math.min(userContributionPercent / 100, 0.85))
                  : innerCircumference * 0.98
              }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              className={hasImpact ? 'drop-shadow-sm' : 'opacity-30'}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            {hasImpact ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-2xl mb-1">🌱</span>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Você já faz parte
                </p>
                <p className="text-xs text-muted-foreground">
                  desse impacto
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-2xl mb-1">🌱</span>
                <p className="text-xs font-medium text-muted-foreground">
                  Seu impacto
                </p>
                <p className="text-xs text-muted-foreground">
                  começa aqui
                </p>
              </motion.div>
            )}
          </div>

          {/* Legend dots */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Coletivo</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${hasImpact ? 'bg-amber-400' : 'bg-muted'}`}></span>
              <span>Seu</span>
            </div>
          </div>
        </div>

        {/* Collective metrics grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-card rounded-lg border border-border">
            <Recycle className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">
              {(COLLECTIVE_IMPACT.wasteKg / 1000).toFixed(1)}t
            </p>
            <p className="text-[10px] text-muted-foreground">Resíduos evitados</p>
          </div>
          <div className="p-2 bg-card rounded-lg border border-border">
            <Wind className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">
              {(COLLECTIVE_IMPACT.co2Kg / 1000).toFixed(1)}t
            </p>
            <p className="text-[10px] text-muted-foreground">CO₂ evitado</p>
          </div>
          <div className="p-2 bg-card rounded-lg border border-border">
            <Sprout className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">
              {(COLLECTIVE_IMPACT.soilKg / 1000).toFixed(1)}t
            </p>
            <p className="text-[10px] text-muted-foreground">Solo regenerado</p>
          </div>
        </div>

        {/* User impact (if any) */}
        {hasImpact && (
          <motion.div 
            className="p-3 bg-amber-500/10 rounded-xl text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-amber-700 dark:text-amber-400">
              🌿 Você contribuiu com{' '}
              <span className="font-bold">
                {userWeightKg >= 1 ? `${userWeightKg.toFixed(1)} kg` : `${(userWeightKg * 1000).toFixed(0)} g`}
              </span>
              {' '}de resíduo processado
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <Button 
          onClick={onAddPro}
          className="w-full gap-2 earth-gradient text-white"
        >
          <Plus className="w-4 h-4" />
          {hasImpact ? 'Ampliar meu impacto' : 'Entrar no ciclo agora'}
        </Button>

        {!hasImpact && (
          <p className="text-xs text-center text-muted-foreground">
            🎯 Complete uma missão e veja seu impacto crescer
          </p>
        )}
      </CardContent>
    </Card>
  );
}

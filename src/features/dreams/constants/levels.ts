// Sistema de 21 níveis exponenciais (1 → 1.000.000)
// Regra: cada nível dobra o anterior, nível 21 é o máximo por CPF

export const LEVELS_CONFIG = [
  { level: 1, threshold: 1 },
  { level: 2, threshold: 2 },
  { level: 3, threshold: 4 },
  { level: 4, threshold: 8 },
  { level: 5, threshold: 16 },
  { level: 6, threshold: 32 },
  { level: 7, threshold: 64 },
  { level: 8, threshold: 128 },
  { level: 9, threshold: 256 },
  { level: 10, threshold: 512 },
  { level: 11, threshold: 1024 },
  { level: 12, threshold: 2048 },
  { level: 13, threshold: 4096 },
  { level: 14, threshold: 8192 },
  { level: 15, threshold: 16384 },
  { level: 16, threshold: 32768 },
  { level: 17, threshold: 65536 },
  { level: 18, threshold: 131072 },
  { level: 19, threshold: 262144 },
  { level: 20, threshold: 524288 },
  { level: 21, threshold: 1000000 },
] as const;

export const MAX_LEVEL = 21;
export const MAX_PROS = 1000000;

export type LevelStatus = 'completed' | 'current' | 'locked';

export interface LevelInfo {
  level: number;
  threshold: number;
  status: LevelStatus;
  progress: number; // 0-100 within this level
}

/**
 * Calcula o nível atual e progresso baseado na quantidade de PROs
 */
export function calculateLevelInfo(totalPros: number): {
  currentLevel: number;
  levels: LevelInfo[];
  nextLevelPros: number;
  prosToNextLevel: number;
} {
  let currentLevel = 0;
  
  // Encontra o nível atual
  for (let i = 0; i < LEVELS_CONFIG.length; i++) {
    if (totalPros >= LEVELS_CONFIG[i].threshold) {
      currentLevel = LEVELS_CONFIG[i].level;
    } else {
      break;
    }
  }

  // Monta array de níveis com status
  const levels: LevelInfo[] = LEVELS_CONFIG.map((config) => {
    let status: LevelStatus;
    let progress = 0;

    if (totalPros >= config.threshold) {
      status = 'completed';
      progress = 100;
    } else if (config.level === currentLevel + 1) {
      status = 'current';
      const prevThreshold = currentLevel > 0 ? LEVELS_CONFIG[currentLevel - 1].threshold : 0;
      const range = config.threshold - prevThreshold;
      const progressPros = totalPros - prevThreshold;
      progress = Math.min(100, (progressPros / range) * 100);
    } else {
      status = 'locked';
      progress = 0;
    }

    return {
      level: config.level,
      threshold: config.threshold,
      status,
      progress,
    };
  });

  // Calcula próximo nível
  const nextLevelIndex = Math.min(currentLevel, LEVELS_CONFIG.length - 1);
  const nextLevelPros = LEVELS_CONFIG[nextLevelIndex].threshold;
  const prosToNextLevel = Math.max(0, nextLevelPros - totalPros);

  return {
    currentLevel: currentLevel || 1,
    levels,
    nextLevelPros,
    prosToNextLevel,
  };
}

/**
 * Formata número de PROs para exibição
 */
export function formatPros(value: number): string {
  if (value >= 1000000) return '1M';
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

/**
 * Coleções de sonhos sugeridas
 */
export const DREAM_COLLECTIONS = [
  {
    id: 'base',
    name: 'Base',
    description: 'Sonhos pequenos para começar',
    levels: '1–4',
    minLevel: 1,
    maxLevel: 4,
    suggestedAmounts: [50, 100],
    icon: '🌱',
  },
  {
    id: 'conforto',
    name: 'Conforto',
    description: 'Celular, contas, rotina',
    levels: '5–8',
    minLevel: 5,
    maxLevel: 8,
    suggestedAmounts: [200, 500],
    icon: '📱',
  },
  {
    id: 'qualidade',
    name: 'Qualidade de Vida',
    description: 'Viagem, cursos, melhorias',
    levels: '9–12',
    minLevel: 9,
    maxLevel: 12,
    suggestedAmounts: [1000, 2000],
    icon: '✈️',
  },
  {
    id: 'seguranca',
    name: 'Segurança e Expansão',
    description: 'Reforma, projetos maiores',
    levels: '13–17',
    minLevel: 13,
    maxLevel: 17,
    suggestedAmounts: [5000, 10000],
    icon: '🏠',
  },
  {
    id: 'impacto',
    name: 'Impacto Máximo',
    description: 'Impacto coletivo e legado',
    levels: '18–21',
    minLevel: 18,
    maxLevel: 21,
    suggestedAmounts: [50000, 100000],
    icon: '🌍',
  },
] as const;

/**
 * Retorna status textual do sonho
 */
export function getDreamStatus(progress: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (progress >= 100) return { label: 'Concluído', emoji: '🎉', color: 'text-emerald-600' };
  if (progress >= 75) return { label: 'Quase lá', emoji: '🔥', color: 'text-orange-500' };
  if (progress >= 25) return { label: 'Crescendo', emoji: '🌿', color: 'text-primary' };
  return { label: 'Plantado', emoji: '🌱', color: 'text-muted-foreground' };
}

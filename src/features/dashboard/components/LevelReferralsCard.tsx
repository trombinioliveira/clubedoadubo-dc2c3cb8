import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { 
  Users, 
  Share2,
  QrCode,
  TrendingUp,
  Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { calculateLevelInfo } from '@/features/dreams/constants/levels';

interface LevelReferralsCardProps {
  totalPros: number;
  referralCode: string;
  onOpenQrCode: () => void;
}

export function LevelReferralsCard({ 
  totalPros, 
  referralCode,
  onOpenQrCode 
}: LevelReferralsCardProps) {
  const navigate = useNavigate();
  const levelInfo = calculateLevelInfo(totalPros);

  // Calcula progresso para o próximo nível
  const currentLevelConfig = levelInfo.levels.find(l => l.level === levelInfo.currentLevel);
  const nextLevelConfig = levelInfo.levels.find(l => l.level === levelInfo.currentLevel + 1);
  const progressPercent = currentLevelConfig?.progress || 0;
  const nextThreshold = nextLevelConfig?.threshold || levelInfo.nextLevelPros;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
    const shareText = `Faça parte do Clube do Adubo! Transforme resíduo em impacto real. Use meu código: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clube do Adubo',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Usuário cancelou ou erro
      }
    } else {
      // Fallback: copiar link
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const showCloseToLevel = levelInfo.prosToNextLevel <= 5 && levelInfo.prosToNextLevel > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            Nível & Indicações
          </div>
          <HelpTooltip 
            content="Diferentes ações aceleram seu avanço nos mesmos níveis."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível atual */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Nível atual</p>
              <p className="text-3xl font-bold text-primary">{levelInfo.currentLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">de 21 níveis</p>
              <p className="text-xs text-muted-foreground">
                {totalPros} / {nextThreshold} PROs
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Nível {levelInfo.currentLevel}</span>
              <span>Nível {Math.min(levelInfo.currentLevel + 1, 21)}</span>
            </div>
          </div>
        </div>

        {/* Alerta de proximidade */}
        {showCloseToLevel && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Você está a <span className="font-bold">{levelInfo.prosToNextLevel} PROs</span> do próximo nível! 🌊
            </p>
          </div>
        )}

        {/* Código de indicação */}
        <div className="p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Seu código de indicação</p>
              <p className="font-mono font-bold text-lg text-foreground">{referralCode}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="default" 
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onOpenQrCode}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </Button>
        </div>

        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground"
          onClick={() => navigate('/indicacoes')}
        >
          Ver todas as indicações →
        </Button>
      </CardContent>
    </Card>
  );
}

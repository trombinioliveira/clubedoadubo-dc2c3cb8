import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { Leaf, DollarSign, Package, Loader2, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface CommissionPreferenceSelectorProps {
  userId: string;
  currentPreference: string;
  onPreferenceChange?: (newPreference: string) => void;
}

const preferenceOptions = [
  {
    value: 'pros',
    label: 'PROs',
    icon: Leaf,
    description: 'Transforme comissões em impacto ambiental',
    detail: 'Cada comissão vira PRO e entra na sua contagem de impacto. Ideal para quem quer maximizar sua contribuição ambiental.',
    color: 'bg-primary',
    gradient: 'earth-gradient',
    badge: 'Recomendado',
    badgeColor: 'bg-primary'
  },
  {
    value: 'dinheiro',
    label: 'Dinheiro',
    icon: DollarSign,
    description: 'Receba em saldo interno resgatável via PIX',
    detail: 'Suas comissões viram saldo interno. Você pode resgatar via PIX para contas de mesma titularidade (mesmo CPF).',
    color: 'bg-emerald-500',
    gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
    badge: null,
    badgeColor: ''
  },
  {
    value: 'adubos',
    label: 'Adubos',
    icon: Package,
    description: 'Acumule créditos para produtos',
    detail: 'Suas comissões viram créditos de adubo que podem ser resgatados por produtos físicos no sistema.',
    color: 'bg-secondary',
    gradient: 'warmth-gradient',
    badge: null,
    badgeColor: ''
  }
];

export const CommissionPreferenceSelector = ({
  userId,
  currentPreference,
  onPreferenceChange
}: CommissionPreferenceSelectorProps) => {
  const [selectedPreference, setSelectedPreference] = useState(currentPreference || 'pros');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (value: string) => {
    setSelectedPreference(value);
    setHasChanges(value !== currentPreference);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ commission_preference: selectedPreference })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Preferência salva!', {
        description: 'Sua forma de recebimento foi atualizada.'
      });
      
      setHasChanges(false);
      onPreferenceChange?.(selectedPreference);
    } catch (error: any) {
      toast.error('Erro ao salvar', {
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedOption = preferenceOptions.find(o => o.value === selectedPreference);

  return (
    <Card className="overflow-hidden shadow-elevated">
      <CardHeader className="earth-gradient text-primary-foreground pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Como você quer receber sua comissão?</CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-1">
              Escolha como transformar suas indicações em valor
            </CardDescription>
          </div>
          <HelpTooltip 
            content="Você pode alterar sua preferência a qualquer momento. Mudanças não afetam ciclos de comissão já fechados."
            className="bg-white/20 hover:bg-white/30"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <RadioGroup
          value={selectedPreference}
          onValueChange={handlePreferenceChange}
          className="space-y-3"
        >
          {preferenceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedPreference === option.value;
            
            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Label
                  htmlFor={option.value}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-soft' 
                      : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                    }
                  `}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="mt-1"
                  />
                  
                  <div className={`w-12 h-12 rounded-xl ${option.gradient} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{option.label}</span>
                      {option.badge && (
                        <Badge className={`${option.badgeColor} text-white text-xs`}>
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                    
                    <AnimatePresence>
                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg"
                        >
                          <Info className="w-3 h-3 inline mr-1" />
                          {option.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  )}
                </Label>
              </motion.div>
            );
          })}
        </RadioGroup>

        {/* Save button */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Salvar Preferência
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current preference indicator */}
        {!hasChanges && selectedOption && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Você está recebendo comissões em <span className="font-medium text-foreground">{selectedOption.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

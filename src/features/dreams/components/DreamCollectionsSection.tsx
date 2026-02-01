import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DREAM_COLLECTIONS } from '../constants/levels';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { ChevronRight } from 'lucide-react';

interface DreamCollectionsSectionProps {
  currentLevel: number;
  onSelectCollection: (collection: typeof DREAM_COLLECTIONS[number]) => void;
}

export function DreamCollectionsSection({
  currentLevel,
  onSelectCollection,
}: DreamCollectionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">Coleções de Sonhos</h2>
        <HelpTooltip content="Sonhos maiores aceleram sua evolução no sistema. Use as coleções como guia para sua jornada." />
      </div>

      <p className="text-sm text-muted-foreground">
        Guia de jornada com sugestões baseadas no seu nível atual.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DREAM_COLLECTIONS.map((collection) => {
          const isUnlocked = currentLevel >= collection.minLevel;
          const isRecommended = currentLevel >= collection.minLevel && currentLevel <= collection.maxLevel;

          return (
            <Card 
              key={collection.id}
              className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                isRecommended 
                  ? 'border-primary bg-primary/5' 
                  : isUnlocked 
                    ? 'border-border' 
                    : 'border-border/50 opacity-60'
              }`}
              onClick={() => isUnlocked && onSelectCollection(collection)}
            >
              {isRecommended && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground text-[10px]">
                    Recomendado
                  </Badge>
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{collection.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{collection.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">
                        Níveis {collection.levels}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        R$ {collection.suggestedAmounts[0]}–{collection.suggestedAmounts[1]}
                      </span>
                    </div>
                  </div>
                  {isUnlocked && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

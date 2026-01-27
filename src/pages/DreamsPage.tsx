import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Target, TrendingUp, Package } from 'lucide-react';
import { CreateDreamModal } from '@/components/CreateDreamModal';
import { AllocateProModal } from '@/features/dreams/components/AllocateProModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Dream {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  created_at: string;
}

interface Pro {
  id: string;
  status: 'processing' | 'ready' | 'sold' | 'paid';
  dream_id: string | null;
}

const DreamsPage = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [pros, setPros] = useState<Pro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const [dreamsRes, prosRes] = await Promise.all([
      supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('pros')
        .select('id, status, dream_id')
        .eq('user_id', user.id)
    ]);

    if (!dreamsRes.error) {
      // Calculate current amount for each dream based on paid PROs
      const dreamsWithProgress = (dreamsRes.data as Dream[]).map(dream => {
        const allocatedPros = prosRes.data?.filter(p => p.dream_id === dream.id) || [];
        const paidPros = allocatedPros.filter(p => p.status === 'paid');
        const currentAmount = paidPros.length * 2; // R$ 2,00 per paid PRO
        return {
          ...dream,
          current_amount: currentAmount,
          is_completed: currentAmount >= dream.target_amount
        };
      });
      setDreams(dreamsWithProgress);
    }

    if (!prosRes.error) {
      setPros(prosRes.data as Pro[] || []);
    }

    setIsLoading(false);
  };

  const createDream = async (title: string, targetAmount: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('dreams')
      .insert({
        user_id: user.id,
        title,
        target_amount: targetAmount
      });

    if (!error) {
      fetchData();
    }
  };

  const openAllocateModal = (dream: Dream) => {
    setSelectedDream(dream);
    setIsAllocateOpen(true);
  };

  const activeDreams = dreams.filter(d => !d.is_completed);
  const completedDreams = dreams.filter(d => d.is_completed);
  const totalEarned = pros.filter(p => p.status === 'paid').length * 2;
  const totalAllocated = pros.filter(p => p.dream_id).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Meus Sonhos
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina metas financeiras e acompanhe seu progresso
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Sonho
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">de PROs pagos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Sonhos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDreams.length}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              PROs Alocados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated}</div>
            <p className="text-xs text-muted-foreground">vinculados a sonhos</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : dreams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum sonho cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro sonho e comece a acompanhar seu progresso!
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="earth-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Sonho
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Dreams */}
          {activeDreams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Sonhos em Andamento
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeDreams.map((dream) => {
                  const progress = (dream.current_amount / dream.target_amount) * 100;
                  const prosNeeded = Math.ceil((dream.target_amount - dream.current_amount) / 2);
                  const allocatedCount = pros.filter(p => p.dream_id === dream.id).length;
                  
                  return (
                    <Card key={dream.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{dream.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {allocatedCount} PROs
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Criado em {format(new Date(dream.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>R$ {dream.current_amount.toFixed(2)}</span>
                            <span className="text-muted-foreground">R$ {dream.target_amount.toFixed(2)}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Faltam {prosNeeded} PROs pagos para atingir a meta
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openAllocateModal(dream)}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Alocar PROs
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Dreams */}
          {completedDreams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Sonhos Realizados
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedDreams.map((dream) => (
                  <Card key={dream.id} className="overflow-hidden border-emerald-200 bg-emerald-50/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{dream.title}</CardTitle>
                        <Badge className="bg-emerald-500 text-white">Realizado!</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-emerald-600">
                        R$ {dream.target_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Meta atingida! 🎉
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateDreamModal 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onConfirm={createDream}
      />

      {selectedDream && (
        <AllocateProModal
          open={isAllocateOpen}
          onOpenChange={setIsAllocateOpen}
          dream={selectedDream}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default DreamsPage;

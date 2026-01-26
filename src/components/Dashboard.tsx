import React, { useState } from 'react';
import { mockPros, mockFifoQueue, mockImpactWave, mockUser } from '@/data/mockData';
import { StatsOverview } from './StatsOverview';
import { FifoQueueCard } from './FifoQueueCard';
import { ImpactWaveCard } from './ImpactWaveCard';
import { ProCard } from './ProCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export const Dashboard = () => {
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredPros = activeTab === 'all' 
    ? mockPros 
    : mockPros.filter(p => p.status === activeTab);

  const handleActivatePro = () => {
    toast.success('PRO ativado com sucesso!', {
      description: 'Você ativou 1 PRO (100g de resíduo) por R$ 1,00',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Welcome header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Olá, {mockUser.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe seus PROs e seu impacto no ciclo
              </p>
            </div>
            <Button onClick={handleActivatePro} variant="hero" size="lg">
              <Plus className="w-5 h-5" />
              Ativar PROs
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsOverview pros={mockPros} />

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* PROs list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Meus PROs</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-5 h-auto">
                <TabsTrigger value="all" className="text-xs py-2">Todos</TabsTrigger>
                <TabsTrigger value="processing" className="text-xs py-2">Processando</TabsTrigger>
                <TabsTrigger value="ready" className="text-xs py-2">Prontos</TabsTrigger>
                <TabsTrigger value="sold" className="text-xs py-2">Vendidos</TabsTrigger>
                <TabsTrigger value="paid" className="text-xs py-2">Pagos</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-3">
                {filteredPros.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <p className="text-muted-foreground">Nenhum PRO nesta categoria</p>
                  </div>
                ) : (
                  filteredPros.map((pro) => (
                    <ProCard
                      key={pro.id}
                      pro={pro}
                      expanded={selectedProId === pro.id}
                      onClick={() => setSelectedProId(selectedProId === pro.id ? null : pro.id)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FifoQueueCard queue={mockFifoQueue} />
            <ImpactWaveCard wave={mockImpactWave} referralCode={mockUser.referralCode} />
          </div>
        </div>

        {/* Educational callout */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-border">
          <h3 className="font-bold text-foreground mb-2">💡 Como funciona a fila FIFO?</h3>
          <p className="text-sm text-muted-foreground">
            A fila FIFO (First In, First Out) é única e global. Quando um adubo é vendido, 
            o próximo PRO da fila recebe o pagamento. Não existem filas separadas — 
            todos participam da mesma fila justa e transparente.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Share2, 
  Copy, 
  Leaf, 
  TrendingUp, 
  Calendar,
  ShoppingCart,
  DollarSign,
  Award,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  Gift,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockUser, mockImpactWave } from '@/data/mockData';
import { ImpactCardsSection } from '@/components/ImpactCardsSection';
import { CommissionPreferenceSelector } from '@/components/CommissionPreferenceSelector';
import { CommissionSimulator } from '@/components/CommissionSimulator';
import { useAuth } from '@/lib/auth';

// Mock referral data - in production this would come from the database
const mockReferrals = [
  { 
    id: '1', 
    name: 'João Santos', 
    email: 'joao@email.com',
    joinedAt: new Date('2024-02-10'), 
    prosCount: 15,
    totalWeight: 1500,
    paidPros: 8,
    hasPurchased: true,
    lastActivity: new Date('2024-03-15')
  },
  { 
    id: '2', 
    name: 'Ana Oliveira', 
    email: 'ana@email.com',
    joinedAt: new Date('2024-02-15'), 
    prosCount: 8,
    totalWeight: 800,
    paidPros: 3,
    hasPurchased: true,
    lastActivity: new Date('2024-03-10')
  },
  { 
    id: '3', 
    name: 'Carlos Lima', 
    email: 'carlos@email.com',
    joinedAt: new Date('2024-02-20'), 
    prosCount: 0,
    totalWeight: 0,
    paidPros: 0,
    hasPurchased: false,
    lastActivity: new Date('2024-02-20')
  },
  { 
    id: '4', 
    name: 'Paula Costa', 
    email: 'paula@email.com',
    joinedAt: new Date('2024-03-01'), 
    prosCount: 22,
    totalWeight: 2200,
    paidPros: 12,
    hasPurchased: true,
    lastActivity: new Date('2024-03-18')
  },
  { 
    id: '5', 
    name: 'Roberto Almeida', 
    email: 'roberto@email.com',
    joinedAt: new Date('2024-03-05'), 
    prosCount: 5,
    totalWeight: 500,
    paidPros: 0,
    hasPurchased: true,
    lastActivity: new Date('2024-03-12')
  },
  { 
    id: '6', 
    name: 'Fernanda Silva', 
    email: 'fernanda@email.com',
    joinedAt: new Date('2024-03-10'), 
    prosCount: 0,
    totalWeight: 0,
    paidPros: 0,
    hasPurchased: false,
    lastActivity: new Date('2024-03-10')
  },
  { 
    id: '7', 
    name: 'Marcos Pereira', 
    email: 'marcos@email.com',
    joinedAt: new Date('2024-03-12'), 
    prosCount: 35,
    totalWeight: 3500,
    paidPros: 20,
    hasPurchased: true,
    lastActivity: new Date('2024-03-20')
  },
];

// Commission tiers (future feature)
const commissionTiers = [
  { tier: 1, minReferrals: 0, maxReferrals: 5, rate: 5, label: 'Iniciante' },
  { tier: 2, minReferrals: 6, maxReferrals: 15, rate: 7, label: 'Ativo' },
  { tier: 3, minReferrals: 16, maxReferrals: 30, rate: 10, label: 'Embaixador' },
  { tier: 4, minReferrals: 31, maxReferrals: Infinity, rate: 15, label: 'Líder' },
];

export const ReferralsPage = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [mainTab, setMainTab] = useState('impacto');
  
  const referralCode = profile?.referral_code || mockUser.referralCode;
  const referralLink = `https://clubedoadubo.com/r/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado!', {
      description: 'Compartilhe com amigos e amplie sua onda de impacto.',
    });
  };

  // Calculate stats
  const totalReferrals = mockReferrals.length;
  const activeReferrals = mockReferrals.filter(r => r.hasPurchased).length;
  const totalProsFromNetwork = mockReferrals.reduce((sum, r) => sum + r.prosCount, 0);
  const totalWeightFromNetwork = mockReferrals.reduce((sum, r) => sum + r.totalWeight, 0);
  const totalPaidFromNetwork = mockReferrals.reduce((sum, r) => sum + r.paidPros, 0);

  // Mock impact data
  const directPros = 12;
  const recurringPros = 8;
  const globalPros = 3;
  const fifoPosition = 247;
  const currentGoal = 4;

  // Determine current tier
  const currentTier = commissionTiers.find(
    t => activeReferrals >= t.minReferrals && activeReferrals <= t.maxReferrals
  ) || commissionTiers[0];
  
  const nextTier = commissionTiers.find(t => t.tier === currentTier.tier + 1);
  const progressToNextTier = nextTier 
    ? ((activeReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100;

  // Filter referrals
  const filteredReferrals = mockReferrals.filter(referral => {
    const matchesSearch = referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          referral.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && referral.hasPurchased;
    if (activeTab === 'pending') return matchesSearch && !referral.hasPurchased;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-secondary/10 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Share2 className="w-8 h-8 text-secondary" />
                Minhas Indicações
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe sua rede e o impacto na economia circular
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Referral Link Card */}
        <Card className="border-2 border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse-slow">
                  <Gift className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Seu link de indicação</h3>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe e amplie sua onda de impacto
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-1 max-w-md">
                <Input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button onClick={copyLink} variant="secondary" className="shadow-soft">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs Navigation */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="impacto" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <Leaf className="w-4 h-4 mr-1 hidden sm:inline" />
              Meu Impacto
            </TabsTrigger>
            <TabsTrigger value="comissao" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />
              Comissão
            </TabsTrigger>
            <TabsTrigger value="simulador" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-1 hidden sm:inline" />
              Simulador
            </TabsTrigger>
            <TabsTrigger value="rede" className="text-xs sm:text-sm py-2 px-3 rounded-lg">
              <Users className="w-4 h-4 mr-1 hidden sm:inline" />
              Minha Rede
            </TabsTrigger>
          </TabsList>

          {/* Meu Impacto Tab */}
          <TabsContent value="impacto" className="mt-6">
            <ImpactCardsSection 
              directPros={directPros}
              recurringPros={recurringPros}
              globalPros={globalPros}
              fifoPosition={fifoPosition}
              currentGoal={currentGoal}
              statusBadge={currentTier.label}
            />
          </TabsContent>

          {/* Comissão Tab */}
          <TabsContent value="comissao" className="mt-6">
            <CommissionPreferenceSelector 
              userId={user?.id || ''}
              currentPreference={profile?.commission_preference || 'pros'}
            />
          </TabsContent>

          {/* Simulador Tab */}
          <TabsContent value="simulador" className="mt-6">
            <CommissionSimulator 
              currentLevel={currentTier.tier}
              currentRate={currentTier.rate}
              activeReferrals={activeReferrals}
            />
          </TabsContent>

          {/* Minha Rede Tab */}
          <TabsContent value="rede" className="mt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
                  <p className="text-xs text-muted-foreground">Total Indicados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeReferrals}</p>
                  <p className="text-xs text-muted-foreground">Ativos (compraram)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalProsFromNetwork}</p>
                  <p className="text-xs text-muted-foreground">PROs da Rede</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{(totalWeightFromNetwork / 1000).toFixed(1)} kg</p>
                  <p className="text-xs text-muted-foreground">Resíduo Processado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Referrals List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg">Histórico de Indicações</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-3 mb-4">
                    <TabsTrigger value="all" className="text-xs">
                      Todos ({mockReferrals.length})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="text-xs">
                      Ativos ({mockReferrals.filter(r => r.hasPurchased).length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs">
                      Pendentes ({mockReferrals.filter(r => !r.hasPurchased).length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {filteredReferrals.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-xl">
                          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            {searchTerm ? 'Nenhum indicado encontrado' : 'Nenhum indicado nesta categoria'}
                          </p>
                        </div>
                      ) : (
                        filteredReferrals.map((referral) => (
                          <div 
                            key={referral.id}
                            className="p-4 bg-muted/30 rounded-xl border border-border hover:border-secondary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                                  {referral.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{referral.name}</p>
                                  <p className="text-xs text-muted-foreground">{referral.email}</p>
                                </div>
                              </div>
                              <Badge variant={referral.hasPurchased ? 'default' : 'secondary'}>
                                {referral.hasPurchased ? 'Ativo' : 'Pendente'}
                              </Badge>
                            </div>

                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                              <div className="p-2 bg-background rounded-lg">
                                <p className="text-muted-foreground text-xs">Entrou em</p>
                                <p className="font-medium">
                                  {format(referral.joinedAt, "dd/MM/yy", { locale: ptBR })}
                                </p>
                              </div>
                              <div className="p-2 bg-background rounded-lg">
                                <p className="text-muted-foreground text-xs">PROs</p>
                                <p className="font-medium text-primary">{referral.prosCount}</p>
                              </div>
                              <div className="p-2 bg-background rounded-lg">
                                <p className="text-muted-foreground text-xs">Resíduo</p>
                                <p className="font-medium">{(referral.totalWeight / 1000).toFixed(1)} kg</p>
                              </div>
                              <div className="p-2 bg-background rounded-lg">
                                <p className="text-muted-foreground text-xs">Pagos</p>
                                <p className="font-medium text-emerald-600">{referral.paidPros}</p>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              Última atividade: {format(referral.lastActivity, "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Commission Tier Card */}
            <Card className="overflow-hidden">
              <CardHeader className="warmth-gradient text-secondary-foreground pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Seu Nível</CardTitle>
                  <Award className="w-6 h-6" />
                </div>
              </CardHeader>
              <CardContent className="-mt-4 relative">
                <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
                  <div className="text-center mb-4">
                    <Badge variant="secondary" className="text-lg px-4 py-1 mb-2">
                      {currentTier.label}
                    </Badge>
                    <p className="text-3xl font-bold text-secondary">{currentTier.rate}%</p>
                    <p className="text-xs text-muted-foreground">de comissão por venda</p>
                  </div>

                  {nextTier && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Próximo nível</span>
                        <span className="font-medium">{nextTier.label} ({nextTier.rate}%)</span>
                      </div>
                      <Progress value={progressToNextTier} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Faltam {nextTier.minReferrals - activeReferrals} indicados ativos
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-600">Em breve!</p>
                        <p className="text-xs text-muted-foreground">
                          O sistema de comissões será ativado em breve. Continue indicando!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Impacto da Rede
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm">Adubo gerado</span>
                  <span className="font-bold text-primary">
                    {(totalWeightFromNetwork * 0.6 / 1000).toFixed(1)} kg
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm">CO₂ evitado</span>
                  <span className="font-bold text-primary">
                    {(totalWeightFromNetwork * 2.5 / 1000).toFixed(1)} kg
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <span className="text-sm">PROs pagos</span>
                  <span className="font-bold text-emerald-600">{totalPaidFromNetwork}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <span className="text-sm">Valor movimentado</span>
                  <span className="font-bold text-secondary">
                    R$ {(totalPaidFromNetwork * 2).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tier Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Níveis de Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {commissionTiers.map((tier) => (
                    <div 
                      key={tier.tier}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        currentTier.tier === tier.tier 
                          ? 'border-secondary bg-secondary/10' 
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentTier.tier === tier.tier 
                            ? 'bg-secondary text-secondary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {tier.tier}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tier.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {tier.maxReferrals === Infinity 
                              ? `${tier.minReferrals}+ indicados` 
                              : `${tier.minReferrals}-${tier.maxReferrals} indicados`}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        currentTier.tier === tier.tier ? 'text-secondary' : 'text-muted-foreground'
                      }`}>
                        {tier.rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
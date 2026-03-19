import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3, Plus, Scale, Factory, Truck, Wallet, Receipt,
  MapPin, Users, Share2, Globe, Bell, RotateCcw, CreditCard,
  ClipboardList,
} from 'lucide-react';
import { UsersManagement } from '../components/UsersManagement';
import { BatchesManagement } from '../components/BatchesManagement';
import { CollectionPointsManagement } from '../components/CollectionPointsManagement';
import { WeighingsManagement } from '../components/WeighingsManagement';
import { GenerateProsPanel } from '../components/GenerateProsPanel';
import { DistributionManagement } from '../components/DistributionManagement';
import { FinancialManagement } from '../components/FinancialManagement';
import { OverviewDashboard } from '../components/OverviewDashboard';
import { ReferralsManagement } from '../components/ReferralsManagement';
import { SiteManagement } from '../components/SiteManagement';
import { SaleDistributionsManagement } from '../components/SaleDistributionsManagement';
import { NotificationsManagement } from '../components/NotificationsManagement';
import { ResetSandbox } from '../components/ResetSandbox';
import { SubscriptionsManagement } from '../components/SubscriptionsManagement';
import { QAGoLivePanel } from '../components/QAGoLivePanel';

export default function AdminDashboard() {
  const { isAdmin, isStaff, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin && !isStaff) {
    return <Navigate to="/" replace />;
  }

  const tabGroups = [
    {
      label: 'Operação do Ciclo',
      tabs: [
        { value: 'overview', icon: BarChart3, label: 'Jornada', adminOnly: false },
        ...(isAdmin ? [{ value: 'generate-pros', icon: Plus, label: 'Abastecer Fila', adminOnly: true }] : []),
        { value: 'collection-points', icon: MapPin, label: 'Pontos de Coleta', adminOnly: false },
        { value: 'weighings', icon: Scale, label: 'Pesagem', adminOnly: false },
        ...(isAdmin ? [{ value: 'batches', icon: Factory, label: 'Produção', adminOnly: true }] : []),
        { value: 'distribution', icon: Truck, label: 'Distribuição', adminOnly: false },
        ...(isAdmin ? [
          { value: 'financial', icon: Wallet, label: 'Financeiro', adminOnly: true },
          { value: 'sale-distributions', icon: Receipt, label: 'Dist. por Venda', adminOnly: true },
        ] : []),
      ],
    },
    {
      label: 'Pessoas e Crescimento',
      tabs: [
        ...(isAdmin ? [{ value: 'users', icon: Users, label: 'Usuários', adminOnly: true }] : []),
        ...(isAdmin ? [{ value: 'referrals', icon: Share2, label: 'Onda de Impacto', adminOnly: true }] : []),
        { value: 'subscriptions', icon: CreditCard, label: 'Assinaturas', adminOnly: false },
        ...(isAdmin ? [{ value: 'notifications', icon: Bell, label: 'Notificações', adminOnly: true }] : []),
      ],
    },
    {
      label: 'Configuração',
      tabs: [
        ...(isAdmin ? [{ value: 'site', icon: Globe, label: 'Site', adminOnly: true }] : []),
      ],
    },
    {
      label: 'Virada e Segurança',
      tabs: [
        ...(isAdmin ? [
          { value: 'qa-golive', icon: ClipboardList, label: 'Validação', adminOnly: true },
          { value: 'reset-sandbox', icon: RotateCcw, label: 'Reset', adminOnly: true },
        ] : []),
      ],
    },
  ].filter(g => g.tabs.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mesa de Operação</h1>
          <p className="text-muted-foreground mt-1">
            Controle completo do ciclo, pessoas e configuração do Clube do Adubo
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="space-y-3 overflow-x-auto">
            {tabGroups.map((group, gIdx) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                  {group.label}
                </p>
                <TabsList className="flex flex-wrap w-full gap-1 h-auto">
                  {group.tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs">
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {gIdx < tabGroups.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>

          <TabsContent value="overview"><OverviewDashboard /></TabsContent>

          {isAdmin && (
            <TabsContent value="generate-pros"><GenerateProsPanel /></TabsContent>
          )}

          <TabsContent value="collection-points"><CollectionPointsManagement /></TabsContent>
          <TabsContent value="weighings"><WeighingsManagement /></TabsContent>

          {isAdmin && (
            <TabsContent value="batches"><BatchesManagement /></TabsContent>
          )}

          <TabsContent value="distribution"><DistributionManagement /></TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="financial"><FinancialManagement /></TabsContent>
              <TabsContent value="sale-distributions"><SaleDistributionsManagement /></TabsContent>
              <TabsContent value="users"><UsersManagement /></TabsContent>
              <TabsContent value="referrals"><ReferralsManagement /></TabsContent>
            </>
          )}

          <TabsContent value="subscriptions"><SubscriptionsManagement /></TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="notifications"><NotificationsManagement /></TabsContent>
              <TabsContent value="site"><SiteManagement /></TabsContent>
              <TabsContent value="qa-golive"><QAGoLivePanel /></TabsContent>
              <TabsContent value="reset-sandbox"><ResetSandbox /></TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}

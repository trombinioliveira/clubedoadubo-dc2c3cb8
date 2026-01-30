import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, MapPin, Scale, BarChart3, Plus, Truck, Wallet, Factory } from 'lucide-react';
import { UsersManagement } from '../components/UsersManagement';
import { BatchesManagement } from '../components/BatchesManagement';
import { CollectionPointsManagement } from '../components/CollectionPointsManagement';
import { WeighingsManagement } from '../components/WeighingsManagement';
import { GenerateProsPanel } from '../components/GenerateProsPanel';
import { DistributionManagement } from '../components/DistributionManagement';
import { FinancialManagement } from '../components/FinancialManagement';
import { OverviewDashboard } from '../components/OverviewDashboard';

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie PROs, produção, distribuição e finanças
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-1">
            {/* (0) Visão Geral */}
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>

            {/* (1) Gerar PROs - Admin only */}
            {isAdmin && (
              <TabsTrigger value="generate-pros" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Gerar PROs</span>
              </TabsTrigger>
            )}

            {/* (2) Pesagem */}
            <TabsTrigger value="weighings" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Pesagem</span>
            </TabsTrigger>

            {/* (3) Produção - Admin only */}
            {isAdmin && (
              <TabsTrigger value="batches" className="flex items-center gap-2">
                <Factory className="w-4 h-4" />
                <span className="hidden sm:inline">Produção</span>
              </TabsTrigger>
            )}

            {/* (4) Distribuição */}
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Distribuição</span>
            </TabsTrigger>

            {/* (5) Financeiro - Admin only */}
            {isAdmin && (
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Financeiro</span>
              </TabsTrigger>
            )}

            {/* (6) Pontos de Coleta */}
            <TabsTrigger value="collection-points" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Pontos de Coleta</span>
            </TabsTrigger>

            {/* (7) Usuários - Admin only */}
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* (0) Visão Geral */}
          <TabsContent value="overview">
            <OverviewDashboard />
          </TabsContent>

          {/* (1) Gerar PROs */}
          {isAdmin && (
            <TabsContent value="generate-pros">
              <GenerateProsPanel />
            </TabsContent>
          )}

          {/* (2) Pesagem */}
          <TabsContent value="weighings">
            <WeighingsManagement />
          </TabsContent>

          {/* (3) Produção (Batches) */}
          {isAdmin && (
            <TabsContent value="batches">
              <BatchesManagement />
            </TabsContent>
          )}

          {/* (4) Distribuição */}
          <TabsContent value="distribution">
            <DistributionManagement />
          </TabsContent>

          {/* (5) Financeiro */}
          {isAdmin && (
            <TabsContent value="financial">
              <FinancialManagement />
            </TabsContent>
          )}

          {/* (6) Pontos de Coleta */}
          <TabsContent value="collection-points">
            <CollectionPointsManagement />
          </TabsContent>

          {/* (7) Usuários */}
          {isAdmin && (
            <TabsContent value="users">
              <UsersManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

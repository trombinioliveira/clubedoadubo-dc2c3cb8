import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReferralsOverview } from './ReferralsOverview';
import { ReferralsTable } from './ReferralsTable';
import { CommissionLevelsEditor } from './CommissionLevelsEditor';
import { ReferralLogs } from './ReferralLogs';
import { ProUserAudit } from './ProUserAudit';
import { Users, Settings, History, Link2 } from 'lucide-react';

export function ReferralsManagement() {
  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
        <span className="font-bold">ℹ️</span>
        <span>
          <strong>Onda de Impacto</strong> — Gestão das indicações, comissões e vínculos entre participantes. 
          Comissão creditada ≠ comissão paga: o crédito acontece automaticamente via trigger a cada venda confirmada de um indicado. 
          O pagamento efetivo (PIX ou PROs) é um processo separado via Admin.
        </span>
      </div>

      <ReferralsOverview />
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Indicações
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Vínculos PRO
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Níveis
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <ReferralsTable />
        </TabsContent>

        <TabsContent value="audit">
          <ProUserAudit />
        </TabsContent>

        <TabsContent value="levels">
          <CommissionLevelsEditor />
        </TabsContent>

        <TabsContent value="logs">
          <ReferralLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

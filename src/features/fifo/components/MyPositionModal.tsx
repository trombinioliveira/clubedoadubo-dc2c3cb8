import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProStatus = 'pending' | 'processing' | 'ready' | 'sold' | 'paid';

interface FifoQueuePublic {
  queue_id: string;
  queue_position: number;
  queue_status: ProStatus;
  queue_created_at: string;
  queue_paid_at: string | null;
  pro_id: string;
  pro_code: string;
  pro_weight_grams: number;
  pro_status: ProStatus;
  pro_created_at: string;
  pro_user_id: string | null;
  user_name: string;
}

interface MyPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPros: FifoQueuePublic[];
  prosAhead: number;
  paidCount: number;
  userFirstPosition: number | null;
}

const statusLabels: Record<ProStatus, { label: string; emoji: string }> = {
  pending: { label: 'Coleta', emoji: '📍' },
  processing: { label: 'Processamento', emoji: '🏭' },
  ready: { label: 'Produção', emoji: '🌾' },
  sold: { label: 'Venda', emoji: '📦' },
  paid: { label: 'Pago', emoji: '💰' },
};

export function MyPositionModal({ 
  isOpen, 
  onClose, 
  userPros, 
  prosAhead, 
  paidCount,
  userFirstPosition 
}: MyPositionModalProps) {
  // Group user PROs by status
  const statusCounts = userPros.reduce((acc, pro) => {
    acc[pro.queue_status] = (acc[pro.queue_status] || 0) + 1;
    return acc;
  }, {} as Record<ProStatus, number>);

  // Get next unpaid PROs (sorted by position)
  const unpaidPros = userPros
    .filter(p => p.queue_status !== 'paid')
    .sort((a, b) => a.queue_position - b.queue_position);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Seus resíduos no ciclo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {userPros.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Você ainda não possui PROs na fila.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ative PROs para entrar na economia circular!
              </p>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800">
                  💡 Cada PRO representa 100g de resíduo orgânico entrando no ciclo.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary by status */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-3 font-medium">
                  Você possui <strong className="text-foreground">{userPros.length} resíduos</strong> em diferentes etapas do ciclo:
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {(['pending', 'processing', 'ready', 'sold', 'paid'] as ProStatus[]).map(status => {
                    const count = statusCounts[status] || 0;
                    const info = statusLabels[status];
                    return (
                      <div key={status} className="text-center">
                        <span className="text-lg">{info.emoji}</span>
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{info.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next positions */}
              {unpaidPros.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Posições dos seus resíduos ({unpaidPros.length} ativos):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {unpaidPros.slice(0, 10).map(pro => (
                      <Badge key={pro.queue_id} variant="outline" className="text-xs gap-1">
                        #{pro.queue_position} {statusLabels[pro.queue_status].emoji}
                      </Badge>
                    ))}
                    {unpaidPros.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{unpaidPros.length - 10} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Global context */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Resíduos à frente no ciclo</p>
                  <p className="text-2xl font-bold text-orange-600">{prosAhead}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total pagos (global)</p>
                  <p className="text-2xl font-bold text-emerald-600">{paidCount}</p>
                </div>
              </div>

              <div className="text-center p-3 border border-dashed border-emerald-300 rounded-lg bg-emerald-50/50">
                <p className="text-sm text-emerald-700 font-medium">
                  Cada venda real de adubo move o ciclo adiante.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O ciclo tem tempo biológico real: coleta → compostagem → venda.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Você pode ter vários resíduos em posições diferentes — todos avançam juntos.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

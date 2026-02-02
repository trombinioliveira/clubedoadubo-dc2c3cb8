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

export function MyPositionModal({ 
  isOpen, 
  onClose, 
  userPros, 
  prosAhead, 
  paidCount,
  userFirstPosition 
}: MyPositionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Sua Posição na Fila FIFO
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
              <div className="text-center p-4 bg-emerald-100 rounded-lg">
                <p className="text-xs text-emerald-700 mb-1">Sua melhor posição</p>
                <p className="text-4xl font-bold text-emerald-700">
                  {userFirstPosition}º
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">PROs à frente</p>
                  <p className="text-2xl font-bold text-orange-600">{prosAhead}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Já avançaram (pagos)</p>
                  <p className="text-2xl font-bold text-emerald-600">{paidCount}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">Seus PROs na fila:</p>
                <div className="flex flex-wrap gap-1">
                  {userPros.slice(0, 10).map(pro => (
                    <Badge key={pro.queue_id} variant="outline" className="text-xs">
                      #{pro.queue_position}
                    </Badge>
                  ))}
                  {userPros.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{userPros.length - 10} mais
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-center p-3 border border-dashed border-emerald-300 rounded-lg bg-emerald-50/50">
                <p className="text-xs text-muted-foreground">
                  Como o avanço ocorre?
                </p>
                <p className="text-sm text-emerald-700 font-medium mt-1">
                  Cada venda real de adubo paga o próximo da fila!
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 text-center">
                  💡 A fila se move com impacto real, não com promessas.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

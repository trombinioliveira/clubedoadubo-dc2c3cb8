import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ExportCSVButtonProps {
  onExport: (includeSensitive: boolean) => Promise<number>;
  label?: string;
  hasSensitiveToggle?: boolean;
}

export function ExportCSVButton({ onExport, label = 'Exportar CSV', hasSensitiveToggle = false }: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [includeSensitive, setIncludeSensitive] = useState(false);

  const handleClick = () => {
    if (hasSensitiveToggle) {
      setShowConfirm(true);
    } else {
      doExport(false);
    }
  };

  const doExport = async (sensitive: boolean) => {
    setIsExporting(true);
    setShowConfirm(false);
    try {
      const count = await onExport(sensitive);
      toast.success(`Exportados ${count} registros`);
    } catch (err: any) {
      toast.error('Erro na exportação: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsExporting(false);
      setIncludeSensitive(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick} disabled={isExporting} className="gap-2">
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {label}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Confirmar Exportação
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a exportar dados. Deseja incluir dados sensíveis (CPF, email, telefone)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="sensitive"
              checked={includeSensitive}
              onCheckedChange={(v) => setIncludeSensitive(v === true)}
            />
            <Label htmlFor="sensitive" className="text-sm">
              Incluir dados sensíveis (CPF, email, WhatsApp)
            </Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => doExport(includeSensitive)}>
              Exportar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

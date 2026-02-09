import React from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, KeyRound } from 'lucide-react';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

export function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const { user, profile, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Skip guard for admin/staff, unauthenticated, or already on change-password page
  if (!user || isAdmin || isStaff || location.pathname === '/alterar-senha') {
    return <>{children}</>;
  }

  // Check if password change is required
  const passwordChangeRequired = (profile as any)?.password_change_required === true;

  if (!passwordChangeRequired) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Alteração de Senha Obrigatória
            </DialogTitle>
            <DialogDescription>
              Por segurança, você precisa alterar sua senha temporária antes de continuar usando o aplicativo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => navigate('/alterar-senha')} className="w-full">
              <KeyRound className="w-4 h-4 mr-2" />
              Alterar Minha Senha
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

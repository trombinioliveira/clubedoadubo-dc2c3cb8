import React from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, User } from 'lucide-react';

interface ProfileDeadlineGuardProps {
  children: React.ReactNode;
}

export function ProfileDeadlineGuard({ children }: ProfileDeadlineGuardProps) {
  const { user, profile, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Skip guard for admin/staff, unauthenticated users, or if on profile page
  if (!user || isAdmin || isStaff || location.pathname === '/perfil') {
    return <>{children}</>;
  }

  // Check if profile is completed
  const isProfileCompleted = profile?.profile_completed_at !== null;
  
  // Check deadline
  const daysRemaining = profile?.profile_deadline 
    ? differenceInDays(new Date(profile.profile_deadline), new Date())
    : null;
  
  // If profile is completed or deadline hasn't passed, show content
  if (isProfileCompleted || (daysRemaining !== null && daysRemaining > 0)) {
    return <>{children}</>;
  }

  // If deadline has passed and profile not completed, show blocking modal
  if (!isProfileCompleted && daysRemaining !== null && daysRemaining <= 0) {
    return (
      <>
        {children}
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Perfil Incompleto
              </DialogTitle>
              <DialogDescription>
                Seu prazo para completar o perfil expirou. Complete seus dados para continuar usando o aplicativo.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pt-4">
              <Button onClick={() => navigate('/perfil')} className="w-full">
                <User className="w-4 h-4 mr-2" />
                Completar Meu Perfil
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}

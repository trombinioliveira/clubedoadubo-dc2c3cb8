import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles, ListOrdered, Settings, LogOut, User, Share2, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logoImage from '@/assets/logo.webp';

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export function AppHeader({ menuOpen, setMenuOpen }: HeaderProps) {
  const { user, profile, isAdmin, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center gap-1 sm:gap-3">
        {/* Logo */}
        <Link 
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <img src={logoImage} alt="Clube do Adubo" className="w-7 h-7 sm:w-10 sm:h-10 object-contain" />
          <span className="font-bold text-sm sm:text-lg text-foreground hidden sm:inline">Clube do Adubo</span>
        </Link>

        {/* Nav links — all breakpoints, between logo and avatar */}
        <nav className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 flex-1 justify-center overflow-x-auto scrollbar-none">
          {user && !isAdmin && (
            <>
              <Link 
                to="/ciclo"
                className={cn(
                  "text-[11px] sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap",
                  isActive('/ciclo') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-bold shrink-0">1</span>
                <span>Passo a passo</span>
              </Link>
              
              <Link 
                to="/dreams"
                className={cn(
                  "text-[11px] sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap",
                  isActive('/dreams') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-bold shrink-0">2</span>
                <span>Sonhos</span>
              </Link>

              <Link 
                to="/indicacoes"
                className={cn(
                  "text-[11px] sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap",
                  isActive('/indicacoes') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-bold shrink-0">3</span>
                <span>Indicações</span>
              </Link>
              
              <Link 
                to="/fifo"
                className={cn(
                  "text-[11px] sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap",
                  isActive('/fifo') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-bold shrink-0">4</span>
                <span>FIFO</span>
              </Link>

              <Link 
                to="/dashboard"
                className={cn(
                  "text-[11px] sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap",
                  isActive('/dashboard') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>PROs</span>
              </Link>
            </>
          )}

          {user && isAdmin && (
            <Link to="/admin">
              <Button variant={isActive('/admin') ? 'default' : 'outline'} size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Painel Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* Avatar / Login — right side */}
        <div className="flex items-center shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {profile ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover z-[60]">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {!isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                    {!profile?.profile_completed_at && (
                      <span className="ml-auto text-xs text-destructive">!</span>
                    )}
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Painel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="earth-gradient" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

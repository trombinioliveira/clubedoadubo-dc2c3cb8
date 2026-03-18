import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, User, Sparkles, Eye, Globe, BarChart3, CreditCard, Compass, Heart, Waves, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logoImage from '@/assets/logo.webp';

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const navItems = [
  { to: '/jornada', label: 'Jornada', icon: Sparkles, badge: null },
  { to: '/ciclo', label: 'Passo a passo', icon: null, badge: '1' },
  { to: '/dreams', label: 'Sonhos', icon: null, badge: '2' },
  { to: '/fifo', label: 'Minha participação', icon: null, badge: '3' },
  { to: '/indicacoes', label: 'Minha onda de impacto', icon: null, badge: '4' },
];

export function AppHeader({ menuOpen, setMenuOpen }: HeaderProps) {
  const { user, profile, isAdmin, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center gap-1 sm:gap-3">
        {/* Logo → /jornada for logged-in users */}
        <Link
          to="/jornada"
          className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <img src={logoImage} alt="Clube do Adubo" className="w-7 h-7 sm:w-10 sm:h-10 object-contain" />
          <span className="font-bold text-sm sm:text-lg text-foreground hidden sm:inline">Clube do Adubo</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 flex-1 justify-center overflow-x-auto scrollbar-none">
          {user && !isAdmin && navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-[11px] sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap",
                isActive(item.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.icon ? (
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              ) : item.badge ? (
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-bold shrink-0">
                  {item.badge}
                </span>
              ) : null}
              <span>{item.label}</span>
            </Link>
          ))}

          {user && isAdmin && (
            <Link to="/admin">
              <Button variant={isActive('/admin') ? 'default' : 'outline'} size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Painel Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* Avatar / user menu */}
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
              <DropdownMenuContent align="end" className="w-60 bg-popover z-[60]">
                {/* User info */}
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />

                {!isAdmin && (
                  <>
                    {/* Minha conta section */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal uppercase tracking-wider px-3 py-1">
                      Minha conta
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/perfil')}>
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                      {!profile?.profile_completed_at && (
                        <span className="ml-auto text-xs bg-destructive/15 text-destructive rounded-full px-1.5 py-0.5">completar</span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/assinatura')}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Minha Assinatura
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* Acompanhar section */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal uppercase tracking-wider px-3 py-1">
                      Acompanhar o sistema
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/transparencia')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Painel Público
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Painel Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Links externos */}
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <Globe className="w-4 h-4 mr-2" />
                  Área Pública
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Sair */}
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
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

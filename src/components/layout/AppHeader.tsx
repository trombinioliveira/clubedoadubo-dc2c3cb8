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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={logoImage} alt="Clube do Adubo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          <span className="font-bold text-base sm:text-lg text-foreground hidden xs:inline sm:inline">Clube do Adubo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {user && !isAdmin && (
            <>
              <Link 
                to="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive('/dashboard') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">1</span>
                Passo a passo
              </Link>
              
              <Link 
                to="/dreams"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive('/dreams') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">2</span>
                Meus Sonhos
              </Link>

              <Link 
                to="/indicacoes"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive('/indicacoes') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">3</span>
                Minhas Indicações
              </Link>
              
              <Link 
                to="/fifo"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive('/fifo') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">4</span>
                Fila FIFO
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
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {!isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/perfil')}>
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                      {!profile?.profile_completed_at && (
                        <span className="ml-auto text-xs text-destructive">!</span>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Painel Admin
                    </DropdownMenuItem>
                  </>
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
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 -mr-2 hover:bg-muted rounded-lg transition-colors touch-manipulation"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu - full screen overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-14 sm:top-16 z-50 bg-background animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-1 max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto">
            <Link 
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block w-full text-left p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-3 text-base",
                isActive('/dashboard') && "text-primary font-medium bg-primary/5"
              )}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold">1</span>
              Passo a passo
            </Link>
            
            {user ? (
              <>
                {isAdmin ? (
                  <Link 
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block w-full text-left p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-3 text-base",
                      isActive('/admin') && "text-primary font-medium bg-primary/5"
                    )}
                  >
                    <Settings className="w-5 h-5" />
                    Painel Admin
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/dreams"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block w-full text-left p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-3 text-base",
                        isActive('/dreams') && "text-primary font-medium bg-primary/5"
                      )}
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold">2</span>
                      Meus Sonhos
                    </Link>
                    <Link 
                      to="/indicacoes"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block w-full text-left p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-3 text-base",
                        isActive('/indicacoes') && "text-primary font-medium bg-primary/5"
                      )}
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold">3</span>
                      Minhas Indicações
                    </Link>
                    <Link 
                      to="/fifo"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block w-full text-left p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-3 text-base",
                        isActive('/fifo') && "text-primary font-medium bg-primary/5"
                      )}
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold">4</span>
                      Fila FIFO
                    </Link>
                    <Link 
                      to="/perfil"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block w-full text-left p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-3 text-base",
                        isActive('/perfil') && "text-primary font-medium bg-primary/5"
                      )}
                    >
                      <User className="w-5 h-5" />
                      Meu Perfil
                      {!profile?.profile_completed_at && (
                        <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">Completar</span>
                      )}
                    </Link>
                  </>
                )}
                <div className="pt-4 border-t border-border mt-4">
                  <button 
                    onClick={() => { handleSignOut(); setMenuOpen(false); }}
                    className="block w-full text-left p-4 rounded-xl hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-3 text-base"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block w-full mt-4"
              >
                <Button className="w-full earth-gradient h-12 text-base">
                  <User className="w-5 h-5 mr-2" />
                  Entrar / Cadastrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

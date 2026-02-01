import React from 'react';
import { Button } from '@/components/ui/button';
import { Leaf, Menu, X, Sparkles, ListOrdered, Settings, LogOut, User, Share2 } from 'lucide-react';
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl earth-gradient flex items-center justify-center shadow-soft">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">Clube do Adubo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/"
            className={cn(
              "text-sm font-medium transition-colors",
              isActive('/') ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Início
          </Link>
          
          {user && (
            <>
              <Link 
                to="/dreams"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive('/dreams') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="w-4 h-4" />
                Meus Sonhos
              </Link>
              
              <Link 
                to="/fifo"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive('/fifo') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListOrdered className="w-4 h-4" />
                Fila FIFO
              </Link>
              
              <Link to="/dashboard">
                <Button variant={isActive('/dashboard') ? 'default' : 'outline'}>
                  Meus PROs
                </Button>
              </Link>
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                  {!profile?.profile_completed_at && (
                    <span className="ml-auto text-xs text-destructive">!</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/indicacoes')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Indicações
                </DropdownMenuItem>
                {(isAdmin || isStaff) && (
                  <>
                    <DropdownMenuSeparator />
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
              <Button className="earth-gradient">
                Entrar
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              to="/"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors",
                isActive('/') && "text-primary font-medium"
              )}
            >
              Início
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2",
                    isActive('/perfil') && "text-primary font-medium"
                  )}
                >
                  <User className="w-4 h-4" />
                  Meu Perfil
                  {!profile?.profile_completed_at && (
                    <span className="ml-auto text-xs text-destructive font-medium">Completar</span>
                  )}
                </Link>
                <Link 
                  to="/indicacoes"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2",
                    isActive('/indicacoes') && "text-primary font-medium"
                  )}
                >
                  <Share2 className="w-4 h-4" />
                  Indicações
                </Link>
                <Link 
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors",
                    isActive('/dashboard') && "text-primary font-medium"
                  )}
                >
                  Meus PROs
                </Link>
                <Link 
                  to="/dreams"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2",
                    isActive('/dreams') && "text-primary font-medium"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Meus Sonhos
                </Link>
                <Link 
                  to="/fifo"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2",
                    isActive('/fifo') && "text-primary font-medium"
                  )}
                >
                  <ListOrdered className="w-4 h-4" />
                  Fila FIFO
                </Link>
                {(isAdmin || isStaff) && (
                  <Link 
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2",
                      isActive('/admin') && "text-primary font-medium"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Painel Admin
                  </Link>
                )}
                <button 
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors text-destructive flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link 
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Entrar / Cadastrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

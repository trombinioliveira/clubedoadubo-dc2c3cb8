import React, { useState, useEffect } from 'react';
import { useAuth, clearPasswordRecovery, getIsPasswordRecovery } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.webp';

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa');

type PageMode = 'loading' | 'ready' | 'no_access';

export default function ResetPasswordPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<PageMode>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem('password_recovery', '1');
        setMode('ready');
      }
    });

    const detectMode = async () => {
      // Check sessionStorage flag (persists across redirect)
      if (sessionStorage.getItem('password_recovery') === '1') {
        setMode('ready');
        return;
      }

      // Check global flag from AuthProvider
      if (getIsPasswordRecovery()) {
        setMode('ready');
        return;
      }

      // Check URL hash for recovery tokens
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        // Tokens present — wait briefly for PASSWORD_RECOVERY event
        setMode('loading');
        return;
      }

      const { data: { session } } = await (supabase.auth as any).getSession();
      if (!session) {
        setMode('no_access');
        return;
      }

      // Session exists but no recovery indicators
      setMode('no_access');
    };

    detectMode();
    return () => subscription.unsubscribe();
  }, []);

  // Timeout fallback
  useEffect(() => {
    if (mode !== 'loading') return;
    const timer = setTimeout(() => {
      setMode((current) => (current === 'loading' ? 'no_access' : current));
    }, 5000);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await (supabase.auth as any).updateUser({ password: newPassword });

      if (updateError) {
        if (updateError.message.toLowerCase().includes('weak')) {
          setError('Senha muito fraca. Use pelo menos 8 caracteres com letras e números.');
        } else if (updateError.message.toLowerCase().includes('expired') || updateError.message.toLowerCase().includes('invalid')) {
          setError('Link de redefinição expirado ou inválido. Solicite um novo.');
        } else {
          setError(updateError.message);
        }
        return;
      }

      // Clear password_change_required flag if set
      const { data: { session } } = await (supabase.auth as any).getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ password_change_required: false })
          .eq('user_id', session.user.id);
        await refreshProfile();
      }

      clearPasswordRecovery();
      setSuccess(true);
    } catch {
      setError('Erro inesperado. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (mode === 'loading') {
    return (
      <PageShell>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Verificando link…</CardTitle>
            <CardDescription>Aguarde um momento.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // No access
  if (mode === 'no_access') {
    return (
      <PageShell>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Link inválido ou expirado</CardTitle>
            <CardDescription>Não foi possível verificar sua identidade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Você precisa de um link válido de redefinição para acessar esta página.
                Solicite um novo link na tela de login.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link to="/auth">Voltar para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // Success
  if (success) {
    return (
      <PageShell>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Sua senha foi atualizada com sucesso.</CardTitle>
            <CardDescription>
              Agora você pode acessar o Clube do Adubo com sua nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full earth-gradient"
              onClick={() => navigate('/dashboard')}
            >
              Entrar no Clube do Adubo
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // Form
  return (
    <PageShell>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Crie sua nova senha</CardTitle>
          <CardDescription>
            Você já está quase lá.
            <br />
            Defina uma nova senha para voltar ao Clube do Adubo com segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <ul className="text-xs text-muted-foreground space-y-1 pl-1">
              <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                {newPassword.length >= 8 ? '✓' : '○'} Pelo menos 8 caracteres
              </li>
              <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-600' : ''}>
                {newPassword === confirmPassword && newPassword.length > 0 ? '✓' : '○'} Senhas coincidem
              </li>
            </ul>

            <Button
              type="submit"
              className="w-full earth-gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando…</>
              ) : (
                'Salvar nova senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Clube do Adubo" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">Clube do Adubo</span>
              <p className="text-xs text-muted-foreground">Economia Circular Urbana</p>
            </div>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {children}
      </main>
    </div>
  );
}

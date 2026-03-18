import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.webp';

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa');

type PageMode = 'loading' | 'recovery' | 'forced_change' | 'no_access';

export default function ChangePasswordPage() {
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
    // Listen for PASSWORD_RECOVERY event from Supabase magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
      }
    });

    // Determine initial mode based on current state
    const detectMode = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Check if there's a recovery token in the URL hash
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('access_token')) {
          // Supabase will fire PASSWORD_RECOVERY event — wait for it
          setMode('loading');
          return;
        }
        setMode('no_access');
        return;
      }

      // User is logged in — check if forced change is required
      const { data: profileData } = await supabase
        .from('profiles')
        .select('password_change_required')
        .eq('user_id', session.user.id)
        .single();

      if (profileData?.password_change_required) {
        setMode('forced_change');
      } else {
        // Logged in but no forced change — check if arrived via recovery
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('access_token')) {
          setMode('recovery');
        } else {
          // Already fine, redirect
          navigate('/dashboard');
        }
      }
    };

    detectMode();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // If loading waits too long without PASSWORD_RECOVERY event, fall to no_access
  useEffect(() => {
    if (mode !== 'loading') return;
    const timer = setTimeout(() => {
      setMode((current) => (current === 'loading' ? 'no_access' : current));
    }, 3000);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        // Map common error messages to Portuguese
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ password_change_required: false })
          .eq('user_id', session.user.id);

        await refreshProfile();
      }

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch {
      setError('Erro inesperado. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderHeader = (title: string, description: string) => (
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
        <KeyRound className="w-6 h-6 text-primary" />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );

  // Loading state
  if (mode === 'loading') {
    return (
      <PageShell>
        <Card className="w-full max-w-md">
          {renderHeader('Verificando link…', 'Aguarde um momento.')}
          <CardContent className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // No access — not logged in and no valid recovery session
  if (mode === 'no_access') {
    return (
      <PageShell>
        <Card className="w-full max-w-md">
          {renderHeader('Link inválido ou expirado', 'Não foi possível verificar sua identidade.')}
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Você precisa de um link válido de redefinição ou estar logado para acessar esta página.
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

  // Success state
  if (success) {
    return (
      <PageShell>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Senha alterada!</CardTitle>
            <CardDescription>Sua senha foi salva com sucesso. Redirecionando…</CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    );
  }

  // Main form — works for both 'recovery' and 'forced_change'
  const isRecovery = mode === 'recovery';
  const title = isRecovery ? 'Redefinir Senha' : 'Alterar Senha Obrigatória';
  const description = isRecovery
    ? 'Escolha uma nova senha segura para sua conta.'
    : 'Por segurança, você precisa definir uma nova senha antes de continuar.';

  return (
    <PageShell>
      <Card className="w-full max-w-md">
        {renderHeader(title, description)}
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
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
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
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

            {/* Password strength hints */}
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
                'Salvar Nova Senha'
              )}
            </Button>

            {isRecovery && (
              <Button variant="ghost" asChild className="w-full">
                <Link to="/auth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Login
                </Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}

// ── Layout shell ──────────────────────────────────────────────────────────────
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

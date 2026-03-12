import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, getIsPasswordRecovery } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Lock, User, AlertCircle, Phone, Eye, EyeOff, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import logo from '@/assets/logo.webp';

// Validation schemas
const emailSchema = z.string().trim().email('Email inválido').max(255, 'Email muito longo');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nameSchema = z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo');
const whatsappSchema = z.string().optional().refine(
  (val) => !val || /^\+?[1-9]\d{10,14}$/.test(val.replace(/\s/g, '')),
  'Número de WhatsApp inválido'
);
const resetEmailSchema = z.string().trim().email('Informe um email válido').max(255, 'Email muito longo');

// ── ForgotPasswordModal ────────────────────────────────────────────────────
interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = (v: boolean) => {
    if (!v) { setSent(false); setEmail(''); setError(null); }
    onOpenChange(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = resetEmailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (resetError) {
        // Don't reveal if email exists — show generic message
        console.error('Reset error:', resetError.message);
      }

      // Always show success message (neutral — doesn't reveal email existence)
      setSent(true);
    } catch {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Redefinir senha
          </DialogTitle>
          <DialogDescription>
            Informe seu email e enviaremos um link de redefinição.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Se este email estiver cadastrado, você receberá um link de redefinição em breve.
                Verifique também a caixa de spam.
              </p>
            </div>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 earth-gradient" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…</>
                ) : (
                  'Enviar link'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, signIn, signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  useEffect(() => {
    if (user && !isLoading) {
      // Don't redirect to dashboard if user arrived via password recovery link
      if (getIsPasswordRecovery()) {
        navigate('/redefinir-senha');
        return;
      }
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, isLoading, isAdmin, navigate]);

  // Social login - preparado para ativação futura (Google/Apple)
  // Para ativar: descomentar botões no JSX e habilitar providers no Supabase Dashboard
  // const handleSocialLogin = async (provider: 'google' | 'apple') => {
  //   setError(null);
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider,
  //     options: {
  //       redirectTo: `${window.location.origin}/dashboard`
  //     }
  //   });
  //   
  //   if (error) {
  //     setError(`Erro ao conectar com ${provider === 'google' ? 'Google' : 'Apple'}`);
  //   }
  // };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login');
      } else {
        setError(error.message);
      }
    } else {
      // Update last_login_at
      toast.success('Login realizado com sucesso!');
      // Roles may not be loaded yet, so we navigate to dashboard
      // and the useEffect will redirect admin when roles load
    }
    
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(fullName);
      if (whatsapp) {
        whatsappSchema.parse(whatsapp);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        setError('Este email já está cadastrado');
      } else {
        setError(error.message);
      }
    } else {
      // Record terms acceptance
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase.from('terms_acceptance').insert({
          user_id: newUser.id,
          version: '1.0',
        } as any);
      }

      if (whatsapp) {
        localStorage.setItem('pending_whatsapp', whatsapp);
      }
      setSignupEmail(email.trim());
      setSignupComplete(true);
    }
    
    setIsSubmitting(false);
  };

  const clearForm = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setWhatsapp('');
    setAcceptedTerms(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {signupComplete ? (
          <Card className="w-full max-w-md shadow-elevated border-border/50">
            <CardContent className="pt-8 pb-6 px-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Confira seu e-mail</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sua conta foi criada com sucesso.<br />
                  Enviamos um link de confirmação para{' '}
                  <span className="font-medium text-foreground">{signupEmail}</span>.<br />
                  Depois de confirmar, você poderá entrar no Clube do Adubo.
                </p>
              </div>
              <div className="space-y-3">
                <a
                  href={`https://mail.google.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="default" className="w-full h-11 earth-gradient font-medium gap-2">
                    <Mail className="w-4 h-4" />
                    Abrir meu e-mail
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email: signupEmail,
                    });
                    if (error) {
                      toast.error('Não foi possível reenviar. Tente novamente em alguns minutos.');
                    } else {
                      toast.success('Link de confirmação reenviado!');
                    }
                  }}
                >
                  Reenviar confirmação
                </Button>
                <Link to="/" className="block">
                  <Button variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao início
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Não encontrou? Verifique também sua caixa de spam.
              </p>
            </CardContent>
          </Card>
        ) : (
        <Card className="w-full max-w-md shadow-elevated border-border/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Bem-vindo!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Faça parte do ciclo de economia circular urbana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); clearForm(); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* LOGIN TAB */}
              <TabsContent value="signin" className="space-y-4">
                {/* Social Login - Preparado para ativação futura
                <div className="space-y-3">
                  <Button type="button" variant="outline" className="w-full h-11 font-medium" onClick={() => handleSocialLogin('google')}>
                    Entrar com Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-11 font-medium" onClick={() => handleSocialLogin('apple')}>
                    Entrar com Apple
                  </Button>
                </div>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    ou continue com email
                  </span>
                </div>
                */}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 earth-gradient font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* SIGNUP TAB */}
              <TabsContent value="signup" className="space-y-4">
                {/* Social Signup - Preparado para ativação futura
                <div className="space-y-3">
                  <Button type="button" variant="outline" className="w-full h-11 font-medium" onClick={() => handleSocialLogin('google')}>
                    Criar conta com Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-11 font-medium" onClick={() => handleSocialLogin('apple')}>
                    Criar conta com Apple
                  </Button>
                </div>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    ou cadastre-se com email
                  </span>
                </div>
                */}

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
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

                  {/* WhatsApp - Optional */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-whatsapp" className="flex items-center gap-2">
                      WhatsApp
                      <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-whatsapp"
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional. Você pode adicionar depois.<br />
                      O WhatsApp libera notificações de impacto, fila FIFO e PROs.
                    </p>
                  </div>

                  {/* Terms acceptance checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="accept-terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border accent-primary"
                    />
                    <label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-relaxed">
                      Li e aceito os{' '}
                      <Link to="/termos" target="_blank" className="text-primary hover:underline">
                        Termos de Uso
                      </Link>{' '}
                      e a{' '}
                      <Link to="/politica-de-privacidade" target="_blank" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>.
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 earth-gradient font-medium"
                    disabled={isSubmitting || !acceptedTerms}
                  >
                    {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        )}
      </main>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/politica-de-riscos" className="hover:text-foreground transition-colors">
                Política de Riscos
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/natureza-do-pro" className="hover:text-foreground transition-colors">
                Natureza do PRO
              </Link>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              Economia Circular Urbana • Impacto real e rastreável
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

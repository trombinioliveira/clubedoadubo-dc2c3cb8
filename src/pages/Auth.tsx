import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Leaf, Mail, Lock, User, AlertCircle, Phone, Eye, EyeOff } from 'lucide-react';
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

export default function Auth() {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      setError(`Erro ao conectar com ${provider === 'google' ? 'Google' : 'Apple'}`);
    }
  };

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
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
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
      // If WhatsApp was provided, we'll update it after profile is created
      if (whatsapp) {
        // Store for later update via webhook or profile completion
        localStorage.setItem('pending_whatsapp', whatsapp);
      }
      toast.success('Cadastro realizado! Verifique seu email para confirmar.');
    }
    
    setIsSubmitting(false);
  };

  const clearForm = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setWhatsapp('');
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
                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={() => handleSocialLogin('google')}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Entrar com Google
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={() => handleSocialLogin('apple')}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
                    </svg>
                    Entrar com Apple
                  </Button>
                </div>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    ou continue com email
                  </span>
                </div>

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
                      onClick={() => toast.info('Funcionalidade em desenvolvimento')}
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
                {/* Social Signup Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={() => handleSocialLogin('google')}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Criar conta com Google
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={() => handleSocialLogin('apple')}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
                    </svg>
                    Criar conta com Apple
                  </Button>
                </div>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    ou cadastre-se com email
                  </span>
                </div>

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

                  <Button 
                    type="submit" 
                    className="w-full h-11 earth-gradient font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Ao criar sua conta, você passa a fazer parte de um ciclo de economia circular urbana, com regras claras e impacto real.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/transparencia" className="hover:text-foreground transition-colors">
                Transparência
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/contato" className="hover:text-foreground transition-colors">
                Contato
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/termos" className="hover:text-foreground transition-colors">
                Termos de Uso
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

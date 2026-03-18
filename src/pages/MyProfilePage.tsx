import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  User, Shield, CheckCircle2, Loader2, AlertCircle, MapPin,
  ExternalLink, Bell, HelpCircle, ArrowRight, Eye, Copy, Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// ─── Helpers ───

function MicroHelp({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ProfileFormData {
  full_name: string;
  gender: string;
  cpf: string;
  birth_date: string;
  email: string;
  whatsapp: string;
  pix_key: string;
  public_name: string;
  instagram: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_zipcode: string;
  city: string;
  address_state: string;
}

// ─── Validation & formatting ───

const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder >= 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder >= 10) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;
  return true;
};

const formatCPF = (value: string): string => {
  const c = value.replace(/\D/g, '');
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0, 3)}.${c.slice(3)}`;
  if (c.length <= 9) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
};

const formatPhone = (value: string): string => {
  const c = value.replace(/\D/g, '');
  if (c.length <= 2) return c;
  if (c.length <= 7) return `(${c.slice(0, 2)}) ${c.slice(2)}`;
  return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7, 11)}`;
};

const formatCEP = (value: string): string => {
  const c = value.replace(/\D/g, '');
  if (c.length <= 5) return c;
  return `${c.slice(0, 5)}-${c.slice(5, 8)}`;
};

// ─── Notification Preferences (inline, humanized) ───

interface Prefs {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  notify_purchase: boolean;
  notify_pro_credited: boolean;
  notify_pro_paid: boolean;
  notify_fifo_moved: boolean;
  notify_dream_milestones: boolean;
}

const DEFAULT_PREFS: Prefs = {
  email_enabled: true,
  whatsapp_enabled: false,
  notify_purchase: true,
  notify_pro_credited: true,
  notify_pro_paid: true,
  notify_fifo_moved: true,
  notify_dream_milestones: true,
};

const NOTIF_LABELS: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: 'notify_purchase', label: 'Compras aprovadas', desc: 'Quando uma compra sua for confirmada.' },
  { key: 'notify_pro_credited', label: 'Participações creditadas', desc: 'Quando novas participações entrarem no ciclo.' },
  { key: 'notify_pro_paid', label: 'Ciclos concluídos', desc: 'Quando uma participação completar o ciclo e o valor for pago.' },
  { key: 'notify_fifo_moved', label: 'Avanço no ciclo', desc: 'Quando o ciclo avançar e suas participações progredirem.' },
  { key: 'notify_dream_milestones', label: 'Marcos dos sonhos', desc: 'Quando um sonho seu atingir uma etapa importante.' },
];

// ─── Page ───

export default function MyProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '', gender: '', cpf: '', birth_date: '', email: '', whatsapp: '',
    pix_key: '', public_name: '', instagram: '',
    address_street: '', address_number: '', address_complement: '',
    address_neighborhood: '', address_zipcode: '', city: '', address_state: '',
  });

  // OTP state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'whatsapp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);

  // Notification prefs
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [prefsLoading, setPrefsLoading] = useState(true);

  const isProfileCompleted = profile?.profile_completed_at !== null;
  const referralCode = profile?.referral_code;
  const referralLink = referralCode ? `https://clubedoadubo.com.br/u/${referralCode}` : null;

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        gender: profile.gender || '',
        cpf: profile.cpf ? formatCPF(profile.cpf) : '',
        birth_date: profile.birth_date || '',
        email: profile.email || '',
        whatsapp: profile.whatsapp ? formatPhone(profile.whatsapp) : '',
        pix_key: profile.pix_key || '',
        public_name: (profile as any).public_name || '',
        instagram: (profile as any).instagram || '',
        address_street: (profile as any).address_street || '',
        address_number: (profile as any).address_number || '',
        address_complement: (profile as any).address_complement || '',
        address_neighborhood: (profile as any).address_neighborhood || '',
        address_zipcode: (profile as any).address_zipcode ? formatCEP((profile as any).address_zipcode) : '',
        city: (profile as any).city || '',
        address_state: (profile as any).address_state || '',
      });
      setEmailVerified(!!profile.email_verified_at);
      setWhatsappVerified(!!profile.whatsapp_verified_at);
    }
  }, [profile]);

  // Load notification prefs
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setPrefs({
          email_enabled: data.email_enabled,
          whatsapp_enabled: data.whatsapp_enabled,
          notify_purchase: data.notify_purchase,
          notify_pro_credited: data.notify_pro_credited,
          notify_pro_paid: data.notify_pro_paid,
          notify_fifo_moved: data.notify_fifo_moved,
          notify_dream_milestones: data.notify_dream_milestones,
        });
      } else {
        await supabase.from('notification_preferences').insert({ user_id: user.id });
      }
      setPrefsLoading(false);
    })();
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    if (field === 'cpf') value = formatCPF(value);
    else if (field === 'whatsapp') value = formatPhone(value);
    else if (field === 'address_zipcode') value = formatCEP(value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePref = async (key: keyof Prefs, value: boolean) => {
    if (!user) return;
    setPrefs(prev => ({ ...prev, [key]: value }));
    const { error } = await supabase.from('notification_preferences').update({ [key]: value, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      setPrefs(prev => ({ ...prev, [key]: !value }));
    }
  };

  const sendOTP = async (type: 'email' | 'whatsapp') => {
    if (isProfileCompleted) return;
    const target = type === 'email' ? formData.email : formData.whatsapp.replace(/\D/g, '');
    if (!target || (type === 'email' && !formData.email.includes('@')) || (type === 'whatsapp' && target.length < 10)) {
      toast({ title: 'Erro', description: type === 'email' ? 'Digite um email válido' : 'Digite um WhatsApp válido', variant: 'destructive' });
      return;
    }
    setOtpSending(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from('otp_codes').insert({ user_id: user?.id, type, code, expires_at: expiresAt });
      // Store code temporarily for test display inside dialog (NOT in toast)
      setTestOtpCode(code);
      toast({ title: 'Código enviado!', description: `Verifique seu ${type === 'email' ? 'e-mail' : 'WhatsApp'}.` });
      setOtpType(type);
      setOtpCode('');
      setOtpDialogOpen(true);
    } catch (error: any) {
      toast({ title: 'Erro ao enviar código', description: error.message, variant: 'destructive' });
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: 'Código inválido', description: 'Digite o código de 6 dígitos', variant: 'destructive' });
      return;
    }
    setOtpLoading(true);
    try {
      const { data: otpData, error: fetchError } = await supabase
        .from('otp_codes').select('*').eq('user_id', user?.id).eq('type', otpType).eq('code', otpCode)
        .is('used_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).single();
      if (fetchError || !otpData) {
        toast({ title: 'Código inválido ou expirado', description: 'Solicite um novo código', variant: 'destructive' });
        return;
      }
      await supabase.from('otp_codes').update({ used_at: new Date().toISOString() }).eq('id', otpData.id);
      const updateField = otpType === 'email' ? 'email_verified_at' : 'whatsapp_verified_at';
      await supabase.from('profiles').update({
        [updateField]: new Date().toISOString(),
        ...(otpType === 'email' ? { email: formData.email } : { whatsapp: formData.whatsapp.replace(/\D/g, '') })
      }).eq('user_id', user?.id);
      if (otpType === 'email') setEmailVerified(true); else setWhatsappVerified(true);
      toast({ title: 'Verificado!', description: `${otpType === 'email' ? 'E-mail' : 'WhatsApp'} verificado com sucesso!` });
      setOtpDialogOpen(false);
      await refreshProfile();
    } catch (error: any) {
      toast({ title: 'Erro ao verificar', description: error.message, variant: 'destructive' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast({ title: 'Nome completo é obrigatório', variant: 'destructive' });
      return;
    }
    const cleanedCPF = formData.cpf.replace(/\D/g, '');
    if (!validateCPF(cleanedCPF)) {
      toast({ title: 'CPF inválido', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          gender: formData.gender || null,
          cpf: cleanedCPF,
          birth_date: formData.birth_date || null,
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.replace(/\D/g, '') || null,
          pix_key: formData.pix_key.trim() || null,
          public_name: formData.public_name.trim() || null,
          instagram: formData.instagram.trim() || null,
          address_street: formData.address_street.trim() || null,
          address_number: formData.address_number.trim() || null,
          address_complement: formData.address_complement.trim() || null,
          address_neighborhood: formData.address_neighborhood.trim() || null,
          address_zipcode: formData.address_zipcode.replace(/\D/g, '') || null,
          city: formData.city.trim() || null,
          address_state: formData.address_state.trim() || null,
          profile_completed_at: isProfileCompleted ? undefined : new Date().toISOString(),
        } as any)
        .eq('user_id', user?.id);
      if (error) throw error;
      toast({ title: 'Perfil salvo!', description: 'Suas informações foram atualizadas.' });
      await refreshProfile();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const daysRemaining = profile?.profile_deadline
    ? differenceInDays(new Date(profile.profile_deadline), new Date())
    : null;

  // Pending items
  const pendingItems: string[] = [];
  if (!isProfileCompleted) pendingItems.push('Completar dados obrigatórios');
  if (!emailVerified) pendingItems.push('Verificar e-mail');
  if (!formData.pix_key) pendingItems.push('Cadastrar chave Pix');

  // Loading
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* ═══ Header ═══ */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meu perfil</h1>
          <p className="text-muted-foreground leading-relaxed">
            Aqui você organiza sua presença no Clube do Adubo. Cada informação tem uma razão — e você encontra a explicação junto de cada campo.
          </p>
        </section>

        {/* ═══ BLOCO 0 — Pendências (apenas se reais) ═══ */}
        {pendingItems.length > 0 && (
          <section>
            <Card className={daysRemaining !== null && daysRemaining <= 2 ? 'border-destructive/30' : 'border-primary/20'}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                  <p className="font-medium text-foreground text-sm">
                    {pendingItems.length === 1 ? 'Há 1 item pendente' : `Há ${pendingItems.length} itens pendentes`}
                  </p>
                </div>
                <ul className="space-y-1">
                  {pendingItems.map(item => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {daysRemaining !== null && daysRemaining <= 7 && (
                  <p className="text-xs text-muted-foreground">
                    {daysRemaining > 0
                      ? `Você tem ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} para completar seu perfil.`
                      : 'Seu prazo para completar o perfil expirou. Complete agora para continuar.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* ═══ BLOCO 1 — Dados pessoais ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Seus dados pessoais</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Usados para identificar você no sistema e garantir a segurança da sua conta.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input id="full_name" value={formData.full_name} onChange={e => handleInputChange('full_name', e.target.value)} placeholder="Seu nome completo" />
                <p className="text-xs text-muted-foreground">Usado internamente. Não aparece publicamente.</p>
              </div>

              <div className="space-y-2">
                <Label>Gênero</Label>
                <RadioGroup value={formData.gender} onValueChange={v => handleInputChange('gender', v)} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="masculino" id="masculino" /><Label htmlFor="masculino">Masculino</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="feminino" id="feminino" /><Label htmlFor="feminino">Feminino</Label></div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="cpf">CPF *</Label>
                  <MicroHelp text="Necessário para garantir a titularidade da conta e para retiradas via Pix." />
                </div>
                <Input id="cpf" value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} placeholder="000.000.000-00" maxLength={14} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input id="birth_date" type="date" value={formData.birth_date} onChange={e => handleInputChange('birth_date', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 2 — Contato e verificações ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Contato e verificações</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Seus canais de contato. Verificar o e-mail garante que você receba atualizações do ciclo.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">E-mail *</Label>
                  {emailVerified ? (
                    <Badge variant="default" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Verificado</Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => sendOTP('email')} disabled={otpSending || isProfileCompleted}>
                      Verificar
                    </Button>
                  )}
                </div>
                <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="seu@email.com" />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <MicroHelp text="Usado para notificações futuras e contato em caso de necessidade." />
                  </div>
                  {whatsappVerified ? (
                    <Badge variant="default" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Verificado</Badge>
                  ) : formData.whatsapp.replace(/\D/g, '').length >= 10 ? (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => sendOTP('whatsapp')} disabled={otpSending || isProfileCompleted}>
                      Verificar
                    </Button>
                  ) : null}
                </div>
                <Input id="whatsapp" value={formData.whatsapp} onChange={e => handleInputChange('whatsapp', e.target.value)} placeholder="(11) 99999-9999" maxLength={15} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 3 — Recebimento ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Recebimento</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quando o ciclo completa e o valor retorna, ele precisa chegar até você. Configure aqui como isso acontece.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="pix_key">Chave Pix</Label>
                  <MicroHelp text="Usada para transferir o valor quando suas participações completam o ciclo. Precisa ser do mesmo CPF cadastrado." />
                </div>
                <Input id="pix_key" value={formData.pix_key} onChange={e => handleInputChange('pix_key', e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Por segurança, a retirada via Pix só é permitida para contas com o mesmo CPF cadastrado no perfil.</span>
                </div>
              </div>

              {/* Commission preference — inline, simplified */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">O que fazer com o retorno da sua onda</p>
                  <MicroHelp text="Quando alguém entra no Clube do Adubo pelo seu link e participa, o clube reconhece sua contribuição com um pequeno retorno. Aqui você escolhe o que fazer com ele." />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quando pessoas que entraram pelo seu link compram participações, o Clube do Adubo reconhece sua contribuição com um pequeno percentual desse valor. Abaixo, você escolhe o que fazer com esse retorno:
                </p>
                <RadioGroup
                  value={(profile as any)?.commission_preference || 'pro'}
                  onValueChange={async (v) => {
                    await supabase.from('profiles').update({ commission_preference: v }).eq('user_id', user?.id);
                    await refreshProfile();
                    toast({ title: 'Preferência atualizada!' });
                  }}
                  className="space-y-2 mt-2"
                >
                  {[
                    { value: 'pro', label: 'Converter em participações', desc: 'O retorno se transforma em novas participações no ciclo, ampliando automaticamente sua presença.' },
                    { value: 'dinheiro', label: 'Receber via Pix', desc: 'O valor é transferido para a chave Pix cadastrada acima, sempre que atingir o mínimo para envio.' },
                    { value: 'adubos', label: 'Converter em créditos de adubo', desc: 'O retorno se transforma em créditos para retirar adubo em pontos de coleta parceiros.' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors">
                      <RadioGroupItem value={opt.value} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                  Você pode mudar essa escolha a qualquer momento. A mudança vale para os próximos retornos.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 4 — Presença pública ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sua presença pública</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Essas informações aparecem na sua página pessoal — a porta de entrada que você compartilha com outras pessoas.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="public_name">Nome público</Label>
                <Input id="public_name" value={formData.public_name} onChange={e => handleInputChange('public_name', e.target.value)} placeholder="Como você quer ser chamado publicamente" />
                <p className="text-xs text-muted-foreground">Exibido na sua página pessoal. Se não preencher, usaremos seu primeiro nome.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={formData.instagram} onChange={e => handleInputChange('instagram', e.target.value)} placeholder="@seuusuario" />
                <p className="text-xs text-muted-foreground">Opcional. Aparece na sua página pessoal para quem quiser te acompanhar.</p>
              </div>

              {/* Public page preview */}
              {referralLink && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">Sua página pessoal</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quem acessa seu link vê seu nome público, impacto ambiental e uma porta de entrada no ciclo. Seus dados pessoais (CPF, endereço, e-mail) nunca são exibidos.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href={referralLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir minha página
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink);
                        toast({ title: 'Link copiado!' });
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ BLOCO 5 — Endereço ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Endereço</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Necessário para planos que incluem envio de adubo. Se seu plano não inclui envio, pode preencher depois.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address_street">Rua</Label>
                  <Input id="address_street" value={formData.address_street} onChange={e => handleInputChange('address_street', e.target.value)} placeholder="Rua, Avenida..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input id="address_number" value={formData.address_number} onChange={e => handleInputChange('address_number', e.target.value)} placeholder="123" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input id="address_complement" value={formData.address_complement} onChange={e => handleInputChange('address_complement', e.target.value)} placeholder="Apto, Bloco... (opcional)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input id="address_neighborhood" value={formData.address_neighborhood} onChange={e => handleInputChange('address_neighborhood', e.target.value)} placeholder="Bairro" />
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address_zipcode">CEP</Label>
                  <Input id="address_zipcode" value={formData.address_zipcode} onChange={e => handleInputChange('address_zipcode', e.target.value)} placeholder="00000-000" maxLength={9} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">UF</Label>
                  <Input id="address_state" value={formData.address_state} onChange={e => handleInputChange('address_state', e.target.value)} placeholder="SP" maxLength={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══ Save ═══ */}
        <section>
          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
            ) : (
              isProfileCompleted ? 'Atualizar perfil' : 'Salvar perfil'
            )}
          </Button>
          {isProfileCompleted && profile?.profile_completed_at && (
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              Perfil completo desde {format(new Date(profile.profile_completed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </section>

        {/* ═══ BLOCO 6 — Notificações ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Notificações</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha o que você quer saber. Sem exagero — só o que importa para você.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6 space-y-5">
              {prefsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <>
                  {/* Channel */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Canal de envio</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground">E-mail</p>
                        <p className="text-xs text-muted-foreground">Receber atualizações por e-mail.</p>
                      </div>
                      <Switch checked={prefs.email_enabled} onCheckedChange={v => updatePref('email_enabled', v)} />
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <div>
                        <p className="text-sm text-foreground flex items-center gap-1.5">WhatsApp <Badge variant="secondary" className="text-[10px]">Em breve</Badge></p>
                        <p className="text-xs text-muted-foreground">Ainda não disponível.</p>
                      </div>
                      <Switch disabled checked={false} />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <p className="text-sm font-medium text-foreground">O que você quer receber</p>
                    {NOTIF_LABELS.map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                          checked={prefs[key] as boolean}
                          onCheckedChange={v => updatePref(key, v)}
                          disabled={!prefs.email_enabled}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══ Continue sua jornada ═══ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Continue sua jornada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/jornada">
              <Card className="hover:shadow-md transition-shadow h-full group">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Minha jornada</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Seu momento atual e próximo passo.</p>
                  <span className="inline-flex items-center text-xs font-medium text-primary gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/indicacoes">
              <Card className="hover:shadow-md transition-shadow h-full group">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Minha onda de impacto</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Veja como sua rede amplia o ciclo.</p>
                  <span className="inline-flex items-center text-xs font-medium text-primary gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/assinatura">
              <Card className="hover:shadow-md transition-shadow h-full group">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Minha assinatura</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Veja seu plano e formas de participar.</p>
                  <span className="inline-flex items-center text-xs font-medium text-primary gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

      </div>

      {/* OTP Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={(open) => { setOtpDialogOpen(open); if (!open) setTestOtpCode(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificação</DialogTitle>
            <DialogDescription>
              Digite o código de 6 dígitos enviado para seu {otpType === 'email' ? 'e-mail' : 'WhatsApp'}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {testOtpCode && (
              <div className="w-full p-3 rounded-lg bg-muted/50 border border-border text-center space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ambiente de teste</p>
                <p className="text-xs text-muted-foreground">
                  O envio real de e-mail/SMS ainda não está ativo. Use o código abaixo:
                </p>
                <p className="text-lg font-mono font-bold text-foreground tracking-[0.3em]">{testOtpCode}</p>
              </div>
            )}
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={verifyOTP} disabled={otpLoading} className="w-full">
              {otpLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : 'Verificar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

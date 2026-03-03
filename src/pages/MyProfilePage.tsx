import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { User, Shield, CheckCircle2, Loader2, AlertCircle, MapPin, Instagram } from 'lucide-react';
import { NotificationPreferences } from '@/components/NotificationPreferences';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

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

// CPF validation helper
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;
  
  return true;
};

const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

const formatCEP = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
};

export default function MyProfilePage() {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    gender: '',
    cpf: '',
    birth_date: '',
    email: '',
    whatsapp: '',
    pix_key: '',
    public_name: '',
    instagram: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_zipcode: '',
    city: '',
    address_state: '',
  });
  
  // OTP verification state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'whatsapp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  
  const [emailVerified, setEmailVerified] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  
  const isProfileCompleted = profile?.profile_completed_at !== null;

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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    if (field === 'cpf') {
      value = formatCPF(value);
    } else if (field === 'whatsapp') {
      value = formatPhone(value);
    } else if (field === 'address_zipcode') {
      value = formatCEP(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const { error: insertError } = await supabase.from('otp_codes').insert({ user_id: user?.id, type, code, expires_at: expiresAt });
      if (insertError) throw insertError;
      toast({ title: 'Código enviado!', description: `Código de verificação (teste): ${code}` });
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
      const { error: updateError } = await supabase.from('profiles').update({
        [updateField]: new Date().toISOString(),
        ...(otpType === 'email' ? { email: formData.email } : { whatsapp: formData.whatsapp.replace(/\D/g, '') })
      }).eq('user_id', user?.id);
      if (updateError) throw updateError;
      if (otpType === 'email') setEmailVerified(true); else setWhatsappVerified(true);
      toast({ title: 'Verificado!', description: `${otpType === 'email' ? 'Email' : 'WhatsApp'} verificado com sucesso!` });
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
      toast({ title: 'Perfil salvo!', description: 'Seus dados foram salvos com sucesso.' });
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Meu Perfil
          </CardTitle>
          <CardDescription>
            {isProfileCompleted 
              ? 'Seus dados foram salvos. Você pode atualizar informações opcionais.'
              : 'Complete seu perfil para continuar usando o aplicativo.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deadline warning */}
          {!isProfileCompleted && daysRemaining !== null && daysRemaining <= 7 && (
            <Alert variant={daysRemaining <= 2 ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {daysRemaining > 0 
                  ? `Você tem ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} para completar seu perfil.`
                  : 'Seu prazo para completar o perfil expirou. Complete agora para continuar.'
                }
              </AlertDescription>
            </Alert>
          )}
          
          {/* ── Dados Pessoais ── */}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dados Pessoais</h3>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input id="full_name" value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} placeholder="Seu nome completo" />
          </div>
          
          <div className="space-y-2">
            <Label>Gênero</Label>
            <RadioGroup value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="masculino" id="masculino" /><Label htmlFor="masculino">Masculino</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="feminino" id="feminino" /><Label htmlFor="feminino">Feminino</Label></div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} placeholder="000.000.000-00" maxLength={14} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input id="birth_date" type="date" value={formData.birth_date} onChange={(e) => handleInputChange('birth_date', e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="seu@email.com" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" value={formData.whatsapp} onChange={(e) => handleInputChange('whatsapp', e.target.value)} placeholder="(11) 99999-9999" maxLength={15} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pix_key">Chave PIX para Recebimento</Label>
            <Input id="pix_key" value={formData.pix_key} onChange={(e) => handleInputChange('pix_key', e.target.value)} placeholder="CPF, Email, Telefone ou Chave Aleatória" />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              A retirada via PIX só será possível para pessoas com o mesmo CPF cadastrado.
            </p>
          </div>

          {/* ── Perfil Público ── */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Perfil Público (opcional)
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public_name">Nome Público</Label>
                <Input id="public_name" value={formData.public_name} onChange={(e) => handleInputChange('public_name', e.target.value)} placeholder="Como você quer ser chamado publicamente" />
                <p className="text-xs text-muted-foreground">Exibido na sua página pública /u/codigo</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} placeholder="@seuusuario" />
              </div>
            </div>
          </div>

          {/* ── Endereço ── */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Obrigatório para planos que incluem envio de adubo.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address_street">Rua</Label>
                  <Input id="address_street" value={formData.address_street} onChange={(e) => handleInputChange('address_street', e.target.value)} placeholder="Rua, Avenida..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input id="address_number" value={formData.address_number} onChange={(e) => handleInputChange('address_number', e.target.value)} placeholder="123" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input id="address_complement" value={formData.address_complement} onChange={(e) => handleInputChange('address_complement', e.target.value)} placeholder="Apto, Bloco... (opcional)" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input id="address_neighborhood" value={formData.address_neighborhood} onChange={(e) => handleInputChange('address_neighborhood', e.target.value)} placeholder="Bairro" />
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address_zipcode">CEP</Label>
                  <Input id="address_zipcode" value={formData.address_zipcode} onChange={(e) => handleInputChange('address_zipcode', e.target.value)} placeholder="00000-000" maxLength={9} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">UF</Label>
                  <Input id="address_state" value={formData.address_state} onChange={(e) => handleInputChange('address_state', e.target.value)} placeholder="SP" maxLength={2} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
            ) : (
              isProfileCompleted ? 'Atualizar Perfil' : 'Salvar Perfil'
            )}
          </Button>
          
          {isProfileCompleted && profile?.profile_completed_at && (
            <div className="text-center text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-600" />
              Perfil completo em {format(new Date(profile.profile_completed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <NotificationPreferences />
      
      {/* OTP Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificação</DialogTitle>
            <DialogDescription>
              Digite o código de 6 dígitos enviado para seu {otpType === 'email' ? 'email' : 'WhatsApp'}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
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

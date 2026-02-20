import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, CreditCard, Calendar, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
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

// Format CPF for display
const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

// Format phone for display
const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
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
    pix_key: ''
  });
  
  // OTP verification state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'whatsapp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  
  // Verification status
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
        pix_key: profile.pix_key || ''
      });
      setEmailVerified(!!profile.email_verified_at);
      setWhatsappVerified(!!profile.whatsapp_verified_at);
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    if (isProfileCompleted) return;
    
    if (field === 'cpf') {
      value = formatCPF(value);
    } else if (field === 'whatsapp') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendOTP = async (type: 'email' | 'whatsapp') => {
    if (isProfileCompleted) return;
    
    const target = type === 'email' ? formData.email : formData.whatsapp.replace(/\D/g, '');
    
    if (!target || (type === 'email' && !formData.email.includes('@')) || (type === 'whatsapp' && target.length < 10)) {
      toast({
        title: 'Erro',
        description: type === 'email' ? 'Digite um email válido' : 'Digite um WhatsApp válido',
        variant: 'destructive'
      });
      return;
    }
    
    setOtpSending(true);
    
    try {
      // Generate OTP code on server
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      
      // Store OTP in database
      const { error: insertError } = await supabase
        .from('otp_codes')
        .insert({
          user_id: user?.id,
          type,
          code,
          expires_at: expiresAt
        });
      
      if (insertError) throw insertError;
      
      // TODO: Actually send the OTP via email/WhatsApp service
      // For now, we'll show it in a toast for testing
      toast({
        title: 'Código enviado!',
        description: `Código de verificação (teste): ${code}`,
      });
      
      setOtpType(type);
      setOtpCode('');
      setOtpDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar código',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: 'Código inválido',
        description: 'Digite o código de 6 dígitos',
        variant: 'destructive'
      });
      return;
    }
    
    setOtpLoading(true);
    
    try {
      // Check OTP code
      const { data: otpData, error: fetchError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', otpType)
        .eq('code', otpCode)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError || !otpData) {
        toast({
          title: 'Código inválido ou expirado',
          description: 'Solicite um novo código',
          variant: 'destructive'
        });
        return;
      }
      
      // Mark OTP as used
      await supabase
        .from('otp_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', otpData.id);
      
      // Update profile verification status
      const updateField = otpType === 'email' ? 'email_verified_at' : 'whatsapp_verified_at';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          [updateField]: new Date().toISOString(),
          ...(otpType === 'email' ? { email: formData.email } : { whatsapp: formData.whatsapp.replace(/\D/g, '') })
        })
        .eq('user_id', user?.id);
      
      if (updateError) throw updateError;
      
      if (otpType === 'email') {
        setEmailVerified(true);
      } else {
        setWhatsappVerified(true);
      }
      
      toast({
        title: 'Verificado!',
        description: `${otpType === 'email' ? 'Email' : 'WhatsApp'} verificado com sucesso!`,
      });
      
      setOtpDialogOpen(false);
      await refreshProfile();
    } catch (error: any) {
      toast({
        title: 'Erro ao verificar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSave = async () => {
    if (isProfileCompleted) return;
    
    // Validate required fields
    if (!formData.full_name.trim()) {
      toast({ title: 'Nome completo é obrigatório', variant: 'destructive' });
      return;
    }
    if (!formData.gender) {
      toast({ title: 'Gênero é obrigatório', variant: 'destructive' });
      return;
    }
    
    const cleanedCPF = formData.cpf.replace(/\D/g, '');
    if (!validateCPF(cleanedCPF)) {
      toast({ title: 'CPF inválido', variant: 'destructive' });
      return;
    }
    
    if (!formData.birth_date) {
      toast({ title: 'Data de nascimento é obrigatória', variant: 'destructive' });
      return;
    }
    
    // Email and WhatsApp verification temporarily disabled
    // if (!emailVerified) {
    //   toast({ title: 'Email precisa ser verificado', variant: 'destructive' });
    //   return;
    // }
    
    // if (!whatsappVerified) {
    //   toast({ title: 'WhatsApp precisa ser verificado', variant: 'destructive' });
    //   return;
    // }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          gender: formData.gender,
          cpf: cleanedCPF,
          birth_date: formData.birth_date,
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.replace(/\D/g, ''),
          pix_key: formData.pix_key.trim() || null,
          profile_completed_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: 'Perfil salvo!',
        description: 'Seus dados foram salvos com sucesso.',
      });
      
      await refreshProfile();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const daysRemaining = profile?.profile_deadline 
    ? differenceInDays(new Date(profile.profile_deadline), new Date())
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Meu Perfil
          </CardTitle>
          <CardDescription>
            {isProfileCompleted 
              ? 'Seus dados estão salvos e não podem ser alterados.'
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
          
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={isProfileCompleted}
              placeholder="Seu nome completo"
            />
          </div>
          
          {/* Gender */}
          <div className="space-y-2">
            <Label>Gênero *</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
              disabled={isProfileCompleted}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masculino" id="masculino" />
                <Label htmlFor="masculino">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feminino" id="feminino" />
                <Label htmlFor="feminino">Feminino</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              disabled={isProfileCompleted}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
          
          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento *</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              disabled={isProfileCompleted}
            />
          </div>
          
          {/* Email with verification */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
          <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isProfileCompleted}
              placeholder="seu@email.com"
            />
          </div>
          
          {/* WhatsApp with verification */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              disabled={isProfileCompleted}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>
          
          {/* PIX Key */}
          <div className="space-y-2">
            <Label htmlFor="pix_key">Chave PIX para Recebimento</Label>
            <Input
              id="pix_key"
              value={formData.pix_key}
              onChange={(e) => handleInputChange('pix_key', e.target.value)}
              disabled={isProfileCompleted}
              placeholder="CPF, Email, Telefone ou Chave Aleatória"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              A retirada via PIX só será possível para pessoas com o mesmo CPF cadastrado.
            </p>
          </div>
          
          {/* Save Button */}
          {!isProfileCompleted && (
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Perfil'
              )}
            </Button>
          )}
          
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
            <DialogTitle>Verificar {otpType === 'email' ? 'Email' : 'WhatsApp'}</DialogTitle>
            <DialogDescription>
              Digite o código de 6 dígitos enviado para {otpType === 'email' ? formData.email : formData.whatsapp}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={verifyOTP} disabled={otpLoading || otpCode.length !== 6}>
              {otpLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verificar Código
            </Button>
            <Button variant="link" onClick={() => sendOTP(otpType)} disabled={otpSending}>
              Reenviar código
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

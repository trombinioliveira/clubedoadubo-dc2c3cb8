import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Bell, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export function NotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

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
        // Create default prefs
        await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id });
      }
      setLoading(false);
    })();
  }, [user]);

  const updatePref = async (key: keyof Prefs, value: boolean) => {
    if (!user) return;
    setSaving(true);
    setPrefs(prev => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from('notification_preferences')
      .update({ [key]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      setPrefs(prev => ({ ...prev, [key]: !value }));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações
        </CardTitle>
        <CardDescription>Configure quais notificações deseja receber.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channels */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Canais</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="email_enabled">Email</Label>
            <Switch
              id="email_enabled"
              checked={prefs.email_enabled}
              onCheckedChange={(v) => updatePref('email_enabled', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>WhatsApp</Label>
              <Badge variant="secondary" className="text-xs">Em breve</Badge>
            </div>
            <Switch disabled checked={false} />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Categorias</h4>
          {[
            { key: 'notify_purchase' as const, label: 'Compras aprovadas' },
            { key: 'notify_pro_credited' as const, label: 'PROs creditados' },
            { key: 'notify_pro_paid' as const, label: 'PROs pagos' },
            { key: 'notify_fifo_moved' as const, label: 'Avanço da fila' },
            { key: 'notify_dream_milestones' as const, label: 'Marcos dos sonhos' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={prefs[key]}
                onCheckedChange={(v) => updatePref(key, v)}
                disabled={!prefs.email_enabled}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

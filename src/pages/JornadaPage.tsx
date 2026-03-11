import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Eye, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const JornadaPage = () => {
  const { user, profile } = useAuth();

  const { data: prosCount = 0 } = useQuery({
    queryKey: ['jornada-pros', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('pros')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: dreamsCount = 0 } = useQuery({
    queryKey: ['jornada-dreams', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('dreams')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(' ')[0] || 'Participante';

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Minha jornada
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Olá, {firstName}! Acompanhe sua participação no ciclo.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{prosCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Meus PROs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{dreamsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Meus sonhos</p>
            </CardContent>
          </Card>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link to="/planos#pro-avulso" className="block">
            <Button variant="hero" size="lg" className="w-full py-6 text-base gap-2">
              <Sparkles className="w-5 h-5" />
              Ativar 1 PRO (R$ 1)
            </Button>
          </Link>
          <Link to="/dreams" className="block">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <Heart className="w-4 h-4" />
              {dreamsCount > 0 ? 'Ver meus sonhos' : 'Criar meu primeiro sonho'}
            </Button>
          </Link>
        </div>

        {/* Links discretos */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link to="/transparencia" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
            <Eye className="w-4 h-4" />
            Painel público
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
            <Globe className="w-4 h-4" />
            Área pública
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JornadaPage;

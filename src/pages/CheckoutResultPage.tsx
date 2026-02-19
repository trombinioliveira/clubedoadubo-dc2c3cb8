import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.webp';

type Status = 'sucesso' | 'pendente' | 'erro';

const CONFIG: Record<Status, {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  description: string;
  cta: string;
  ctaPath: string;
}> = {
  sucesso: {
    icon: CheckCircle2,
    iconClass: 'text-primary',
    title: 'Pagamento aprovado!',
    description: 'Seu pagamento foi confirmado. Em instantes seu pedido será processado e seus PROs ativados. Você receberá uma confirmação por email.',
    cta: 'Ir para meu Dashboard',
    ctaPath: '/dashboard',
  },
  pendente: {
    icon: Clock,
    iconClass: 'text-yellow-500',
    title: 'Pagamento em análise',
    description: 'Seu pagamento está sendo processado. Assim que confirmado, seus PROs serão ativados automaticamente. Isso pode levar alguns minutos.',
    cta: 'Acompanhar no Dashboard',
    ctaPath: '/dashboard',
  },
  erro: {
    icon: XCircle,
    iconClass: 'text-destructive',
    title: 'Pagamento não concluído',
    description: 'Não foi possível processar seu pagamento. Nenhum valor foi cobrado. Tente novamente ou entre em contato conosco.',
    cta: 'Tentar novamente',
    ctaPath: '/planos',
  },
};

export default function CheckoutResultPage({ status }: { status: Status }) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Clube do Adubo" className="h-10 w-auto" />
            <span className="font-bold text-lg text-foreground hidden sm:block">Clube do Adubo</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
              <Icon className={`w-8 h-8 ${cfg.iconClass}`} />
            </div>
            <CardTitle className="text-2xl">{cfg.title}</CardTitle>
            <CardDescription className="text-base">{cfg.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full earth-gradient">
              <Link to={cfg.ctaPath}>{cfg.cta}</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/">Voltar ao início</Link>
            </Button>
            {status !== 'sucesso' && (
              <p className="text-xs text-muted-foreground">
                Precisa de ajuda?{' '}
                <Link to="/contato" className="text-primary hover:underline">
                  Fale conosco
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

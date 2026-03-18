import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Leaf, Heart, TrendingUp, Eye, Users,
  ArrowRight, HelpCircle, CreditCard, RefreshCw
} from 'lucide-react';

interface TutorialBlock {
  icon: React.ElementType;
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
}

const blocks: TutorialBlock[] = [
  {
    icon: Leaf,
    title: 'O que é o Clube do Adubo?',
    body: 'O Clube do Adubo é um sistema de economia circular onde resíduos orgânicos são transformados em adubo. Cada participante contribui para esse ciclo e acompanha, com total transparência, o caminho que sua participação percorre — da coleta até o retorno.',
    link: '/economia-circular',
    linkLabel: 'Entender a economia circular',
  },
  {
    icon: RefreshCw,
    title: 'Como funciona o ciclo?',
    body: 'O ciclo começa com a coleta de resíduos orgânicos. Eles são processados por compostagem, transformados em adubo e vendidos. Quando o adubo é vendido, o retorno volta para quem participou, seguindo a ordem de entrada (primeiro a entrar, primeiro a receber). Esse é o ciclo completo.',
    link: '/ciclo',
    linkLabel: 'Ver o passo a passo',
  },
  {
    icon: Sparkles,
    title: 'Como participar?',
    body: 'Você pode participar de forma avulsa (comprando participações quando quiser) ou de forma contínua (com um plano mensal que gera participações automaticamente). Cada participação representa sua entrada no ciclo e acompanha todo o processo até o retorno.',
    link: '/planos',
    linkLabel: 'Conhecer os planos',
  },
  {
    icon: Eye,
    title: 'Como acompanhar sua jornada?',
    body: 'Depois de entrar, você acompanha tudo pela sua área logada. A página "Minha jornada" mostra seu momento atual no ciclo, o que já está em andamento e qual é o próximo passo. Tudo com dados reais e atualizados.',
    link: '/jornada',
    linkLabel: 'Ver minha jornada',
  },
  {
    icon: Heart,
    title: 'Sonhos',
    body: 'Sonhos são metas pessoais que você conecta à sua jornada. Pode ser uma viagem, um presente, um fundo de emergência — qualquer coisa. Ao criar um sonho, suas participações ganham direção e você acompanha o progresso rumo a algo que faz sentido para sua vida.',
    link: '/dreams',
    linkLabel: 'Criar um sonho',
  },
  {
    icon: CreditCard,
    title: 'Participação contínua',
    body: 'Com a participação contínua, você escolhe um plano mensal e suas participações são geradas automaticamente a cada ciclo. Não precisa lembrar nem fazer nada — o sistema cuida disso para você. Você pode mudar de plano ou encerrar quando quiser.',
    link: '/assinatura',
    linkLabel: 'Ver minha assinatura',
  },
  {
    icon: TrendingUp,
    title: 'Minha participação no ciclo',
    body: 'Na página "Minha participação" você vê a posição das suas participações na fila, quais já avançaram, quais já foram concluídas e o que está por vir. Tudo funciona por ordem de entrada — quem entra primeiro, recebe primeiro.',
    link: '/fifo',
    linkLabel: 'Ver minha participação',
  },
  {
    icon: Users,
    title: 'Minha onda de impacto',
    body: 'Quando você indica alguém para o Clube do Adubo, essa pessoa passa a fazer parte da sua rede. Isso amplia o volume do ciclo e pode gerar retornos adicionais para você. Sua onda de impacto mostra quantas pessoas você já indicou e o impacto da sua rede.',
    link: '/indicacoes',
    linkLabel: 'Ver minha onda',
  },
  {
    icon: HelpCircle,
    title: 'Dúvidas comuns',
    body: 'Se algo não ficou claro, a página de perguntas frequentes reúne as dúvidas mais comuns. E se precisar de atendimento direto, você pode entrar em contato com nosso time a qualquer momento.',
    link: '/faq',
    linkLabel: 'Ver perguntas frequentes',
  },
];

export default function TutorialPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Como tudo funciona
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Aqui você encontra uma explicação simples de cada parte do Clube do Adubo. 
            Não precisa entender tudo de uma vez — comece pelo que fizer mais sentido para você.
          </p>
        </section>

        {/* Tutorial blocks */}
        {blocks.map((block, idx) => {
          const Icon = block.icon;
          return (
            <Card key={idx} className="overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {block.body}
                </p>
                {block.link && block.linkLabel && (
                  <Link to={block.link}>
                    <Button variant="outline" size="sm" className="gap-1.5 mt-1">
                      {block.linkLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Footer CTA */}
        <section className="text-center space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            Alguma dúvida que não apareceu aqui?
          </p>
          <Link to="/contato">
            <Button variant="outline">Falar com o time</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

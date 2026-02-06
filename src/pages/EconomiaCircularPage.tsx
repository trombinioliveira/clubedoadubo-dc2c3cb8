import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  ArrowRight, 
  Scale, 
  CircleDollarSign, 
  ListOrdered, 
  Zap, 
  Users, 
  ShieldCheck,
  Sprout
} from 'lucide-react';
import economiaCircularFluxograma from '@/assets/economia-circular-fluxograma.png';

const rules = [
  {
    id: 'regra-1',
    icon: Leaf,
    title: 'Regra 1 — Origem do ciclo',
    summary: 'O ciclo começa com resíduo orgânico real',
    content: [
      'O ciclo começa com resíduo orgânico real.',
      'Sem resíduo → sem adubo → sem venda → sem valor.',
      'Não existe atalho. O ciclo é físico, mensurável e rastreável.'
    ]
  },
  {
    id: 'regra-2',
    icon: Scale,
    title: 'Regra 2 — PRO (Unidade de Lastro)',
    summary: '1 PRO = 100g de resíduo orgânico real',
    content: [
      '1 PRO = 100 g de resíduo orgânico real.',
      'PRO é unidade de lastro — não é dinheiro.',
      'PRO não garante retorno. Garante participação no ciclo.',
      'Cada PRO está vinculado a resíduo processado de verdade.'
    ]
  },
  {
    id: 'regra-3',
    icon: CircleDollarSign,
    title: 'Regra 3 — Onde o valor nasce',
    summary: 'O valor nasce exclusivamente na venda do adubo',
    content: [
      'O valor nasce exclusivamente na venda do adubo.',
      'Nada acontece sem venda.',
      'Não existe fundo garantidor externo.',
      'O dinheiro vem do mercado — de quem compra adubo.'
    ]
  },
  {
    id: 'regra-4',
    icon: Zap,
    title: 'Regra 4 — Distribuição por venda',
    summary: 'R$ 2,00 ao PRO ativo + R$ 1,00 para avanço da fila',
    content: [
      'A cada venda de adubo:',
      '• R$ 2,00 são pagos diretamente ao PRO ativo da fila FIFO',
      '• R$ 1,00 é convertido em crédito de avanço do sistema',
      'Não existe fundo garantidor externo. Existe regra automática por venda.',
      'Essa é a mecânica central do Clube do Adubo.'
    ]
  },
  {
    id: 'regra-5',
    icon: ListOrdered,
    title: 'Regra 5 — Fila FIFO',
    summary: 'Fila única, global e imutável',
    content: [
      'Fila única — todos participam da mesma fila.',
      'Ordem global — não existe fila por região ou grupo.',
      'Imutável — a ordem não pode ser alterada.',
      'Quem entra primeiro, recebe primeiro.',
      'Transparência total: você pode ver sua posição a qualquer momento.'
    ]
  },
  {
    id: 'regra-6',
    icon: ShieldCheck,
    title: 'Regra 6 — Avanço da fila',
    summary: 'A fila só avança quando há vendas de adubo',
    content: [
      'A fila só avança quando há vendas de adubo.',
      'Cada venda contribui com avanço.',
      'Quando o crédito acumulado (R$ 1,00 por venda) é suficiente, a fila avança novamente.',
      'A ordem nunca muda — apenas a velocidade.',
      'Quanto mais vendas, mais rápido o ciclo.'
    ]
  },
  {
    id: 'regra-7',
    icon: Users,
    title: 'Regra 7 — Indicações, missões e planos',
    summary: 'Aceleram o ciclo, mas não criam atalhos',
    content: [
      'Não alteram a ordem da fila.',
      'Não criam atalhos.',
      'Servem para:',
      '• Ativar mais resíduo',
      '• Aumentar produção',
      '• Aumentar vendas',
      '• Acelerar o ciclo para todos',
      'Quem indica, ajuda. Quem participa, acelera. Ninguém fura fila.'
    ]
  }
];

const EconomiaCircularPage = () => {
  return (
    <>
      <Helmet>
        <title>Economia Circular | Clube do Adubo</title>
        <meta 
          name="description" 
          content="Entenda como funciona a economia circular do Clube do Adubo. Regras claras, processo real e distribuição justa de valor por venda." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Regras do Sistema
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">
                Economia Circular do Clube do Adubo
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Regras claras. Processo real. Nada acontece fora do sistema.
                Entenda como cada venda gera valor e move a fila.
              </p>
            </div>
          </div>
        </section>

        {/* Fluxograma */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <img
                src={economiaCircularFluxograma}
                alt="Fluxograma completo da Economia Circular do Clube do Adubo"
                className="w-full rounded-xl shadow-elevated"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Regras em Accordion */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
                As 7 Regras do Ciclo
              </h2>

              <Accordion type="single" collapsible className="space-y-3">
                {rules.map((rule) => (
                  <AccordionItem 
                    key={rule.id} 
                    value={rule.id}
                    className="border-0"
                  >
                    <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                      <AccordionTrigger className="hover:no-underline p-0 [&[data-state=open]>div]:bg-muted/50">
                        <CardContent className="p-4 sm:p-5 w-full transition-colors">
                          <div className="flex items-center gap-3 sm:gap-4 text-left">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <rule.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-foreground text-sm sm:text-base">
                                {rule.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                {rule.summary}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className="ml-0 sm:ml-16 pt-3 border-t border-border/50">
                          <ul className="space-y-2">
                            {rule.content.map((line, idx) => (
                              <li 
                                key={idx} 
                                className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                              >
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Princípio Final */}
        <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
                O princípio é simples
              </h2>
              <p className="text-lg sm:text-xl font-medium mb-2">
                Venda real → Pagamento real → Avanço justo → Impacto contínuo
              </p>
              <p className="text-primary-foreground/80 text-sm sm:text-base max-w-xl mx-auto mb-8">
                Não existe promessa. Existe processo.
                Não existe atalho. Existe fila.
                Não existe mágica. Existe resíduo, adubo e venda.
              </p>
              
              <Link to="/planos">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Sprout className="w-5 h-5" />
                  Participar do ciclo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EconomiaCircularPage;

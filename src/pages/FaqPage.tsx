import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ArrowRight } from 'lucide-react';

const FaqPage = () => {
  const faqs = [
    {
      question: 'O que é um PRO?',
      answer: 'PRO significa Processamento de Resíduo Orgânico. É a unidade básica do Clube do Adubo: cada PRO representa 100 gramas de resíduo orgânico urbano que será compostado e transformado em adubo natural. Quando você ativa um PRO, ele entra na Fila FIFO global e você acompanha todo o ciclo até a venda do adubo.'
    },
    {
      question: 'Isso é investimento financeiro?',
      answer: 'NÃO. O Clube do Adubo é um modelo de economia circular, não um investimento financeiro. O valor que você pode receber (R$ 2,00 por PRO) vem exclusivamente da venda real do adubo produzido. Não há promessas de rendimento, não há ganhos garantidos, e não há nenhum tipo de aplicação financeira envolvida. O ciclo só gera valor quando o adubo é efetivamente vendido.'
    },
    {
      question: 'De onde vem o dinheiro?',
      answer: 'O dinheiro vem exclusivamente da venda do adubo. O ciclo funciona assim: resíduo orgânico é coletado → processado em compostagem → transformado em adubo natural → vendido. Cada venda de adubo gera R$ 2,00, que são distribuídos seguindo a ordem da Fila FIFO. Ou seja: o valor vem de uma atividade produtiva real (venda de produto), não da entrada de novos participantes.'
    },
    {
      question: 'O que é a Fila FIFO?',
      answer: 'FIFO significa "First In, First Out" (Primeiro a Entrar, Primeiro a Sair). É a fila única e global que organiza a distribuição do valor gerado pela venda do adubo. Quem ativou PROs primeiro, recebe primeiro. A fila é cronológica, transparente e não pode ser alterada. Ninguém fura a fila, ninguém paga para acelerar. É justiça baseada em tempo de participação.'
    },
    {
      question: 'O que são Ondas de Impacto?',
      answer: 'Ondas de Impacto são o sistema de indicações do Clube do Adubo. Quando você indica alguém e essa pessoa participa do ciclo, você ganha PROs Diretos (pelo engajamento) e pode receber comissões sobre vendas de adubo. Importante: as Ondas medem seu impacto ambiental e social, mas NUNCA alteram a ordem da Fila FIFO. Fila é dinheiro. Ondas são impacto.'
    },
    {
      question: 'Quanto tempo demora para receber?',
      answer: 'O tempo depende do ritmo real do ciclo: coleta de resíduos, processamento, produção do adubo e vendas. Não fazemos promessas de prazo porque o sistema é baseado em atividade real. Você pode acompanhar sua posição na Fila FIFO e ver quantos PROs estão à sua frente a qualquer momento.'
    },
    {
      question: 'Posso perder meu PRO?',
      answer: 'Uma vez ativado, seu PRO entra na Fila FIFO e permanece lá até receber o pagamento correspondente. Cada PRO é rastreável do início ao fim do ciclo.'
    },
    {
      question: 'Como funcionam as metas progressivas?',
      answer: 'Na Fila FIFO, cada usuário tem uma meta de PROs Globais a receber. A meta inicial é 2 PROs. Ao atingir a meta, você é movido para o final da fila e sua próxima meta dobra (2 → 4 → 8 → 16...). Isso mantém o ciclo justo e rotativo, garantindo que todos tenham oportunidade.'
    }
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Perguntas Frequentes
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tire suas dúvidas
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa saber sobre o Clube do Adubo, PROs, Fila FIFO e como o ciclo funciona.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entre em contato conosco ou veja como o ciclo funciona na prática.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button variant="outline" size="lg">
                Falar conosco
              </Button>
            </Link>
            <Link to="/planos">
              <Button variant="hero" size="lg">
                Ver planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqPage;

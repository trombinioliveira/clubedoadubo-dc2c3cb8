import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ArrowRight } from 'lucide-react';

const FaqPage = () => {
  const faqs = [
    {
      question: 'O que é uma participação?',
      answer: 'Cada participação representa 100 gramas de resíduo orgânico que será compostado e transformado em adubo natural. Ao ativar uma participação, ela entra no ciclo e você acompanha todo o processo até a venda do adubo e o retorno do valor.'
    },
    {
      question: 'Isso é investimento financeiro?',
      answer: 'Não. O Clube do Adubo é um modelo de economia circular, não um investimento. O valor que pode retornar (R$ 2,00 por participação) vem exclusivamente da venda real do adubo produzido. Não há promessas de rendimento, ganhos garantidos ou qualquer tipo de aplicação financeira. O ciclo só gera valor quando o adubo é efetivamente vendido.'
    },
    {
      question: 'De onde vem o dinheiro?',
      answer: 'Exclusivamente da venda do adubo. Resíduos orgânicos são coletados, processados por compostagem, transformados em adubo natural e vendidos. Cada venda gera R$ 2,00 que são distribuídos seguindo a ordem de entrada no ciclo. O valor vem de uma atividade produtiva real, não da entrada de novos participantes.'
    },
    {
      question: 'Como funciona a ordem do ciclo?',
      answer: 'O ciclo segue a regra "primeiro a entrar, primeiro a receber". Quem ativou participações antes, recebe antes. A ordem é cronológica, transparente e não pode ser alterada. Ninguém fura a fila e ninguém paga para acelerar.'
    },
    {
      question: 'O que é a onda de impacto?',
      answer: 'A onda de impacto mostra o alcance das suas indicações. Quando você indica alguém e essa pessoa participa, isso amplia o volume do ciclo e pode gerar participações adicionais para você. Importante: a onda mede impacto, mas nunca altera a ordem do ciclo.'
    },
    {
      question: 'Quanto tempo demora para receber?',
      answer: 'O tempo depende do ritmo real do ciclo: coleta, processamento, produção e vendas. Não fazemos promessas de prazo porque o sistema é baseado em atividade real. Você pode acompanhar a posição das suas participações e ver o andamento a qualquer momento.'
    },
    {
      question: 'Posso perder minha participação?',
      answer: 'Não. Uma vez ativada, sua participação entra no ciclo e permanece lá até completar o percurso. Cada participação é rastreável do início ao fim.'
    },
    {
      question: 'O que são os sonhos?',
      answer: 'Sonhos são metas pessoais que você conecta à sua jornada. Pode ser qualquer coisa — uma viagem, um presente, um objetivo. Conforme suas participações completam o ciclo, o valor vai acumulando rumo ao seu sonho. É uma forma de dar direção pessoal à sua participação.'
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
            Tudo que você precisa saber sobre o Clube do Adubo, como o ciclo funciona e como participar.
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

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, MessageCircle, ArrowRight } from 'lucide-react';

const ContatoPage = () => {
  const whatsappNumber = '5511999999999'; // TODO: Replace with real number
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre o Clube do Adubo.');
  const email = 'contato@clubedoadubo.com.br'; // TODO: Replace with real email

  return (
    <>
      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            Contato
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fale com a gente
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos aqui para tirar suas dúvidas, ouvir sugestões e ajudar você a participar do ciclo.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
                <CardDescription>
                  Resposta rápida em horário comercial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Abrir WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="hover:shadow-elevated transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  Para assuntos mais detalhados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    {email}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Dúvidas frequentes?
          </h2>
          <p className="text-muted-foreground mb-6">
            Muitas perguntas já foram respondidas na nossa página de FAQ.
          </p>
          <Link to="/faq">
            <Button variant="outline" size="lg">
              Ver perguntas frequentes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default ContatoPage;

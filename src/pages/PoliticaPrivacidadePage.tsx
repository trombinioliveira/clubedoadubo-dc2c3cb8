import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <Helmet>
        <title>Clube do Adubo | Política de Privacidade</title>
        <meta name="description" content="Política de Privacidade do Clube do Adubo — saiba como seus dados são coletados, utilizados e protegidos conforme a LGPD." />
        <link rel="canonical" href="https://www.clubedoadubo.com.br/politica-de-privacidade" />
        <meta property="og:title" content="Clube do Adubo | Política de Privacidade" />
        <meta property="og:description" content="Como o Clube do Adubo protege seus dados pessoais conforme a LGPD." />
        <meta property="og:url" content="https://www.clubedoadubo.com.br/politica-de-privacidade" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Fevereiro de 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Dados Coletados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo</li>
              <li>Email</li>
              <li>CPF</li>
              <li>Data de nascimento</li>
              <li>WhatsApp</li>
              <li>Chave PIX</li>
              <li>Dados de navegação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Finalidade</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Execução do ciclo de economia circular</li>
              <li>Pagamentos e distribuições</li>
              <li>Comunicação com o participante</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Base Legal</h2>
            <p>
              O processamento de dados é realizado com base na execução contratual e no legítimo interesse,
              conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Compartilhamento</h2>
            <p>Seus dados são compartilhados somente com:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Processadores de pagamento (para distribuições via PIX)</li>
              <li>Supabase (infraestrutura e hospedagem de dados)</li>
              <li>Autoridades competentes, quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Armazenamento</h2>
            <p>
              Os dados são protegidos e armazenados com controle de acesso rigoroso, políticas de segurança
              por linha (Row Level Security) e criptografia em trânsito e em repouso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Direitos do Titular</h2>
            <p>Conforme a LGPD, você pode solicitar:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>Exclusão de dados pessoais</li>
              <li>Portabilidade dos dados</li>
            </ul>
            <p className="mt-2">
              Canal de contato: <a href="mailto:contato@clubedoadubo.com.br" className="text-primary hover:underline">contato@clubedoadubo.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e administrativas adequadas para proteger os dados pessoais contra
              acessos não autorizados, destruição, perda, alteração ou qualquer forma de processamento inadequado.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

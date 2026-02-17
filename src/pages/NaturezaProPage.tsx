import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function NaturezaProPage() {
  return (
    <>
      <Helmet>
        <title>Clube do Adubo | Natureza do PRO</title>
        <meta name="description" content="Entenda a natureza do PRO — unidade operacional ambiental do Clube do Adubo, vinculada ao processamento real de 100g de resíduo orgânico." />
        <link rel="canonical" href="https://clubedoadubo.lovable.app/natureza-do-pro" />
        <meta property="og:title" content="Clube do Adubo | Natureza do PRO" />
        <meta property="og:description" content="O PRO é uma unidade operacional ambiental, não um investimento financeiro." />
        <meta property="og:url" content="https://clubedoadubo.lovable.app/natureza-do-pro" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Natureza do PRO</h1>
        <p className="text-sm text-muted-foreground mb-8">Documento educativo e jurídico</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">O que é o PRO?</h2>
            <p>
              O PRO é a unidade operacional ambiental do Clube do Adubo. Cada PRO representa exatamente
              100g de resíduo orgânico real que será processado, transformado em adubo e reinserido no ciclo
              da economia circular urbana.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">O que o PRO é</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uma unidade digital de participação ambiental</li>
              <li>Vinculado ao processamento real de 100g de resíduo orgânico</li>
              <li>Uma unidade operacional dentro do ciclo de economia circular</li>
              <li>Rastreável, transparente e vinculado à venda real de adubo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">O que o PRO NÃO é</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Não é investimento financeiro</strong> — não há expectativa de retorno garantido</li>
              <li><strong>Não é ativo financeiro</strong> — não pode ser negociado, transferido ou revendido</li>
              <li><strong>Não é promessa de retorno</strong> — a distribuição depende exclusivamente de venda real</li>
              <li><strong>Não é valor mobiliário</strong> — não se enquadra como título ou valor regulado pela CVM</li>
              <li><strong>Não é título de crédito</strong> — não gera direito de crédito contra o Clube do Adubo</li>
              <li><strong>Não é contrato de sociedade</strong> — o participante não é sócio, investidor ou cotista</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Funcionamento</h2>
            <p>
              Cada PRO entra na fila FIFO (First In, First Out) — uma fila única, global e imutável.
              Quando há venda real de adubo, o valor é distribuído conforme a ordem da fila:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>R$2,00 ao PRO ativo na vez da fila</li>
              <li>R$1,00 acumulado para avanço da fila</li>
            </ul>
            <p className="mt-3 font-medium">
              Sem venda real, não há pagamento. Sem pagamento, não há avanço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Vinculação à realidade</h2>
            <p>
              O PRO só existe porque existe resíduo orgânico real sendo processado. Essa é a garantia
              fundamental do sistema: tudo é rastreável, auditável e vinculado à operação física do
              Clube do Adubo.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

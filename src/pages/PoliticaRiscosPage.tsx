import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PoliticaRiscosPage() {
  return (
    <>
      <Helmet>
        <title>Clube do Adubo | Política de Riscos</title>
        <meta name="description" content="Política de Riscos do Clube do Adubo — entenda os riscos associados à participação no ciclo de economia circular." />
        <link rel="canonical" href="https://clubedoadubo.lovable.app/politica-de-riscos" />
        <meta property="og:title" content="Clube do Adubo | Política de Riscos" />
        <meta property="og:description" content="Riscos associados ao ciclo de economia circular do Clube do Adubo." />
        <meta property="og:url" content="https://clubedoadubo.lovable.app/politica-de-riscos" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Riscos</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Fevereiro de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <p>
            O Clube do Adubo opera com base em economia circular real. Ao participar, o usuário declara
            ciência dos seguintes riscos:
          </p>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>Dependência de venda real:</strong> O ciclo depende exclusivamente da venda real de
              adubo orgânico. Sem venda, não há distribuição.
            </li>
            <li>
              <strong>Tempo variável:</strong> O tempo de avanço na fila FIFO pode variar conforme o
              volume de vendas e a demanda do mercado.
            </li>
            <li>
              <strong>Desaceleração possível:</strong> O sistema pode desacelerar em períodos de menor
              demanda por adubo.
            </li>
            <li>
              <strong>Sem garantia de liquidez:</strong> Não há garantia de liquidez imediata. PROs não
              podem ser revendidos, transferidos ou convertidos.
            </li>
            <li>
              <strong>Sem aceleração artificial:</strong> Não existe qualquer mecanismo de aceleração
              artificial da fila ou do ciclo.
            </li>
            <li>
              <strong>Ondas de impacto:</strong> As ondas de impacto (indicações) não alteram a ordem
              da fila FIFO, apenas geram novos PROs para o indicador.
            </li>
          </ul>

          <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm font-semibold text-foreground text-center italic">
              "Sem venda real não há pagamento. Sem pagamento não há avanço."
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

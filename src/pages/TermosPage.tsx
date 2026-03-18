import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermosPage() {
  return (
    <>
      <Helmet>
        <title>Clube do Adubo | Termos de Uso</title>
        <meta name="description" content="Termos de Uso do Clube do Adubo — plataforma de economia circular urbana baseada no processamento real de resíduo orgânico." />
        <link rel="canonical" href="https://www.clubedoadubo.com.br/termos" />
        <meta property="og:title" content="Clube do Adubo | Termos de Uso" />
        <meta property="og:description" content="Termos de Uso do Clube do Adubo — economia circular urbana com impacto real." />
        <meta property="og:url" content="https://www.clubedoadubo.com.br/termos" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Fevereiro de 2026 • Versão 1.0</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Identificação</h2>
            <p>Clube do Adubo — Plataforma de Economia Circular Urbana.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Natureza da Plataforma</h2>
            <p>
              O Clube do Adubo é uma plataforma de economia circular urbana baseada no processamento real
              de resíduo orgânico e comercialização de adubo físico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Natureza do PRO</h2>
            <p>
              O PRO é uma unidade digital de participação ambiental vinculada ao processamento real de 100g
              de resíduo orgânico.
            </p>
            <p className="font-medium mt-3">O PRO <strong>não</strong> constitui:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Investimento financeiro</li>
              <li>Aplicação de capital</li>
              <li>Valor mobiliário</li>
              <li>Título de crédito</li>
              <li>Promessa de rendimento</li>
              <li>Contrato de sociedade</li>
              <li>Produto financeiro</li>
            </ul>
            <p className="mt-3">
              O eventual valor distribuído ao participante somente ocorre se e quando houver venda real
              de adubo produzido. Sem venda real, não há distribuição. Não há garantia de prazo, retorno ou liquidez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Funcionamento do Ciclo</h2>
            <p className="font-medium">Venda real → Pagamento real → Avanço justo → Impacto contínuo.</p>
            <p className="mt-2">A distribuição ocorre conforme:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>R$2,00 ao PRO ativo na vez da fila</li>
              <li>R$1,00 acumulado para avanço da fila</li>
            </ul>
            <p className="mt-2">A fila é única, global e imutável (FIFO).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Ausência de Garantias</h2>
            <p>O participante declara ciência de que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Não há promessa de retorno garantido</li>
              <li>Não há prazo determinado para pagamento</li>
              <li>O ciclo depende exclusivamente de venda real</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Proibições</h2>
            <p>É proibido:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Divulgar o sistema como investimento</li>
              <li>Prometer ganhos garantidos</li>
              <li>Alterar a lógica da fila</li>
              <li>Criar expectativas irreais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Cancelamento</h2>
            <p>
              Usuários podem solicitar encerramento da conta. PROs ativos seguem as regras do ciclo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Atualizações</h2>
            <p>Os termos podem ser atualizados mediante nova versão.</p>
          </section>
        </div>
      </div>
    </>
  );
}

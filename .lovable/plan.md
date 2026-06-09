# Mensagens no espaço acima do botão circular

Hoje, as ações na página `/game` (entrar no ciclo, avançar etapa, confirmar participação, recompensa recebida) mostram feedback apenas via `toast` (notificações flutuantes no canto). A ideia é fazer essas mensagens aparecerem dentro do círculo, no espaço em branco logo acima do botão central, reforçando o contexto do ciclo.

## O que será feito

1. **Novo estado de mensagem**
   - Adicionar um estado `cycleMessage` (texto curto) em `GamePage`.
   - Cada ação (`enterCycle`, `advance`, `confirmParticipation`, recompensa recebida, `reset`) passa a atualizar esse texto além de (opcionalmente) manter o toast.

2. **Exibição dentro do círculo**
   - Inserir um pequeno "balão"/pílula de texto posicionado no espaço em branco acima do botão central (entre o anel superior e o botão).
   - Estilo coerente com o visual: fundo suave (verde/teal translúcido), cantos arredondados, sombra leve, texto pequeno e centralizado.
   - Transição suave (fade/slide) ao trocar a mensagem.

3. **Mensagens padrão**
   - Estado inicial (sem entrar): mensagem-guia, ex. "Toque para entrar no ciclo".
   - Ao avançar: nome/descrição curta da etapa atual.
   - Ao receber recompensa: "Recompensa recebida 🎉".
   - Ao reiniciar: volta à mensagem inicial.

## Detalhes técnicos

- Posicionamento via `absolute` centralizado horizontalmente, ancorado acima do botão central (que tem 128px de altura, `-translate-y-1/2`). O balão fica entre o topo do botão e o anel.
- Largura máxima limitada (`max-w-[160px]`) para não encostar nos nós numerados.
- Sem mudanças de lógica de negócio; apenas apresentação/estado de UI.

## Pergunta em aberto
- Manter também os toasts atuais, ou substituir totalmente pelo balão dentro do círculo? (Plano assume manter ambos, mas posso remover os toasts se preferir.)
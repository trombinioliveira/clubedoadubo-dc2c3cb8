# PAGE CHECKLIST — Clube do Adubo

> Template universal de auditoria. Aplicar a TODA página/rota.

---

## Identificação

- **Rota**: ____________
- **Nome**: ____________
- **Revisor**: ____________
- **Data**: ____________
- **Status**: [ ] Não revisada | [ ] Em revisão | [ ] Aprovada | [ ] Precisa ajuste

---

## 1. Conteúdo & Copy

- [ ] Títulos e subtítulos claros e consistentes
- [ ] Descrições objetivas (sem jargão técnico)
- [ ] Microcopy de botões segue Copy Bible (ex: "Comprar 1 PRO (R$ 1)", não "Confirmar")
- [ ] Labels, placeholders e helper texts presentes em todos os inputs
- [ ] Tooltips e avisos onde necessário
- [ ] Mensagens de erro claras e não culpam o usuário
- [ ] Mensagens de sucesso confirmam + indicam próximo passo
- [ ] Formato de moeda: `R$ 25/mês` (com espaço após R$)
- [ ] Formato de data: `dd/mm/aaaa` consistente
- [ ] Plural correto: "PRO" (singular), "PROs" (plural)
- [ ] Tom de voz: claro, humano, positivo, sem promessas financeiras

## 2. UX / Fluxo

- [ ] Objetivo da página claro em 5 segundos
- [ ] CTA principal único e evidente
- [ ] Hierarquia visual correta (título > subtítulo > corpo > ação)
- [ ] Sem fricção desnecessária (passos extras, modals confusos)
- [ ] "O que acontece depois" sempre explícito
- [ ] Feedback imediato em toda ação (loading → success/error)
- [ ] Navegação de retorno disponível (voltar / breadcrumb)

## 3. Estados (Resiliência)

- [ ] **Loading**: Skeleton ou spinner visível
- [ ] **Empty**: Mensagem orientativa + próximo passo
- [ ] **Error**: "Algo deu errado. Tente novamente." + botão retry
- [ ] **Success**: "Pronto! Atualização salva." ou equivalente
- [ ] Prevenção de double submit (botão desabilita durante ação)
- [ ] Retry disponível quando aplicável

## 4. Links & Botões

- [ ] Todo botão funciona (não é placeholder)
- [ ] Todo link interno navega corretamente
- [ ] Links externos abrem em nova aba (`target="_blank"`)
- [ ] Botões desabilitam quando form inválido
- [ ] Foco/hover/active visíveis
- [ ] Tab/Enter/Escape funcionam
- [ ] Sem botões "mortos" ou links quebrados

## 5. Pagamentos (Mercado Pago)

- [ ] CTA de compra chama edge function correta (`create-mp-preference` ou `create-mp-subscription`)
- [ ] `external_reference` e `product_key` sempre presentes
- [ ] `attribution` preservado quando vindo de ponto de coleta
- [ ] Pós-checkout: mensagens para sucesso/pendente/falha/cancelado
- [ ] Sem múltiplas preferências por cliques repetidos (botão desabilita)
- [ ] Mensagem: "Pagamento processado com segurança via Mercado Pago."

## 6. Segurança & Permissões

- [ ] Rotas admin protegidas (ProtectedRoute requireStaff/requireAdmin)
- [ ] Rotas logadas protegidas (ProtectedRoute)
- [ ] Redirect para /auth quando não autenticado
- [ ] Sem dados privados em páginas públicas (CPF, email, pix_key)
- [ ] RLS policies ativas nas queries usadas

## 7. Acessibilidade & Responsivo

- [ ] Labels associados a inputs (`htmlFor`)
- [ ] Contraste adequado (WCAG AA)
- [ ] Mobile 360px: sem overflow, sem botão cortado
- [ ] Mobile 390px: layout funcional
- [ ] Tablet 768px: layout adaptado
- [ ] Desktop 1280px+: layout completo
- [ ] Imagens com `alt` text
- [ ] Sem scroll horizontal indesejado

---

## Resultado

| Critério | Status |
|----------|--------|
| Conteúdo & Copy | ⬜ |
| UX / Fluxo | ⬜ |
| Estados | ⬜ |
| Links & Botões | ⬜ |
| Pagamentos | ⬜ (se aplicável) |
| Segurança | ⬜ |
| Acessibilidade | ⬜ |
| **APROVADO** | ⬜ |

> Uma página só é APROVADA quando TODOS os critérios aplicáveis estiverem ✅.

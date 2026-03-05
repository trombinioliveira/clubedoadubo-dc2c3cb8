# FLOW MAP — Clube do Adubo

> Fluxos principais e suas variantes (sucesso, pendente, falha).

---

## 1. Compra Avulsa (1 PRO = R$ 1)

```
Visitante → /planos ou / (CTA)
  → Clica "Comprar 1 PRO (R$ 1)"
  → Se não logado → /auth → volta
  → Se logado → Valida endereço completo
    → Se incompleto → modal/redirect → /perfil
    → Se completo → Edge Function: create-mp-preference
      → external_reference = uuid gerado
      → product_key = "pro_avulso"
      → attribution = { collection_point_slug? }
      → Redireciona para Mercado Pago
        → Sucesso → /compra/sucesso
        → Pendente → /compra/pendente
        → Falha → /compra/erro
        → Cancelado → /compra/erro

Backend (pós-webhook):
  financial_entries (confirmed)
  → trigger: create_user_pros_from_confirmed_payment
  → pro_activations
  → trigger: consume_pro_activations (SKIP LOCKED)
  → PROs transferidos do pool → FIFO
```

## 2. Assinatura (Plano Semente/Muda/Árvore)

```
Visitante → /planos
  → Clica "Assinar Plano X"
  → Se não logado → /auth → volta
  → Se logado → Valida endereço
  → Edge Function: create-mp-subscription
    → product_key = "plano_semente" | "plano_muda" | "plano_arvore"
    → Redireciona MP
      → Sucesso → /compra/sucesso
      → Pendente → /compra/pendente
      → Falha → /compra/erro

Backend:
  mp-webhook → financial_entries (confirmed)
  → trigger → pro_credits (quantity_total = 10/25/50)
  → ledger_event('subscription_credit')
  → cron (5min) → convert_pro_credits → pro_activations
  → trigger → consume_pro_activations → PROs no FIFO
```

## 3. Cadastro / Login / Logout

```
Cadastro:
  /auth → tab "Cadastro"
  → full_name, email, senha
  → Aceite de termos (obrigatório)
  → Supabase auth.signUp()
  → trigger: handle_new_user → profiles + user_roles(client)
  → trigger: initialize_referral_stats
  → trigger: initialize_notification_preferences
  → Redireciona → /dashboard

Login:
  /auth → tab "Login"
  → email + senha
  → Supabase auth.signInWithPassword()
  → Se admin → /admin
  → Se client → /dashboard
  → Se password_change_required → /alterar-senha

Logout:
  Header → botão "Sair"
  → supabase.auth.signOut()
  → Redireciona → /

Recuperação:
  /auth → link "Esqueceu a senha?"
  → Supabase auth.resetPasswordForEmail()
  → Email com link → /alterar-senha
```

## 4. Perfil (edição)

```
/perfil
  → Carrega profile do user
  → Campos: full_name, public_name, email (readonly), cpf, birth_date,
    gender, phone, whatsapp, instagram, pix_key
  → Endereço: zipcode, street, number, complement, neighborhood, state, city
  → Commission preference: pro | pix | mix
  → Validação: endereço completo obrigatório para checkout
  → "Salvar alterações" → supabase.update(profiles)
  → Toast: "Pronto! Atualização salva."
```

## 5. Dashboard (logado)

```
/dashboard
  → RPC: get_user_dashboard_summary
  → Exibe: PROs no ciclo, vendidos, pagos, total recebido
  → Cards: movimento do dia/mês, sonhos, assinatura
  → CTAs: comprar PRO, ver fila, ver indicações
  → Se sem PROs: "Você já entrou no ciclo. Acompanhe sua posição."
  → Se com PROs: resumo + ações rápidas
```

## 6. Fila FIFO (/fifo)

```
/fifo
  → RPC: get_fifo_queue_public
  → Exibe: colunas por status (pendente/processando/pronto/vendido/pago)
  → Modal "Minha Posição": PRO #posicao · código, status, data
  → Mensagem: "O valor só é gerado quando o adubo é vendido."
  → Se vazio: "Ainda não há PROs na fila."
```

## 7. Transparência Pública (/painel-publico)

```
/painel-publico
  → RPC: get_public_transparency_kpis
  → KPIs: total PROs, peso, vendas, distribuições, lotes
  → Sem dados privados expostos
```

## 8. Admin — Fluxo de Distribuição de Venda

```
Admin → Financeiro → seleciona financial_entry
  → "Distribuir" → RPC: process_sale_distribution_safe
  → Resultado: PROs pagos, valores, posições avançadas
  → Atualiza sale_distributions
  → Ledger: pro_paid (via trigger)
```

## 9. Ponto de Coleta (/ponto/:slug)

```
Visitante → /ponto/nome-do-ponto
  → RPC: get_collection_point_public(slug)
  → Exibe: nome, endereço, stats (pesagens, PROs, CO2)
  → CTA: "Participe pelo Ponto X" → /planos com attribution
  → financial_entries.attribution = { collection_point_slug }
```

## 10. Indicações (/indicacoes)

```
/indicacoes
  → Carrega: profile.referral_code, referral_stats
  → Link compartilhável: /u/{código}
  → Lista de indicados (profiles WHERE referred_by = user.profile_id)
  → Métricas: nível, PROs diretos, comissão
```

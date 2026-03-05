# Clube do Adubo — GO-LIVE CHECKLIST

> ⚠️ **ATENÇÃO**: NÃO alterar `process_sale_distribution`, `mp-webhook`, ou a lógica FIFO/ordem/pagamentos em nenhuma circunstância.

---

## Passo 1 — Reset Sandbox

1. Acesse `/admin` → aba **Reset**
2. Marque os **2 checkboxes**
3. Digite `RESET`
4. Clique **Executar Reset**
5. Valide com SQL:

```sql
SELECT 
  (SELECT count(*) FROM pros)              AS pros,
  (SELECT count(*) FROM fifo_queue)        AS fifo_queue,
  (SELECT count(*) FROM financial_entries) AS financial_entries,
  (SELECT count(*) FROM sale_distributions) AS sale_distributions,
  (SELECT count(*) FROM pro_payouts)       AS pro_payouts,
  (SELECT count(*) FROM subscriptions)     AS subscriptions,
  (SELECT count(*) FROM reset_logs)        AS reset_logs,
  (SELECT count(*) FROM commission_levels) AS commission_levels;
```

**Esperado**: pros=0, fifo_queue=0, financial_entries=0, sale_distributions=0, pro_payouts=0, subscriptions=0, commission_levels=4, reset_logs≥1.

---

## Passo 2 — Secrets de Produção

No Supabase Dashboard → **Project Settings → Edge Function Secrets**:

| Secret | Valor |
|--------|-------|
| `MP_ACCESS_TOKEN` | Token de **PRODUÇÃO** do Mercado Pago |
| `APP_BASE_URL` | Domínio final (ex: `https://clubedoadubo.lovable.app`) |

---

## Passo 3 — env_mode = production

```sql
UPDATE site_settings
SET value = '{"mode":"production"}'::jsonb
WHERE key = 'env_mode';
```

Validar:
```sql
SELECT key, value FROM site_settings WHERE key = 'env_mode';
```

Validar UI: `/admin` → aba **Reset** deve mostrar badge **production** e botão de reset **desabilitado**.

> ⚠️ Após este passo, NÃO executar reset novamente.

---

## Passo 4 — Seed Inicial

1. Crie um usuário cliente de teste (ex: `cliente.teste@gmail.com`)
2. Complete o perfil com endereço completo em `/perfil`
3. No Admin → **Gerar PROs** → selecione o usuário → gere **200 PROs**
4. Validar:

```sql
SELECT count(*) FROM pros;          -- esperado: 200
SELECT count(*) FROM fifo_queue;    -- esperado: 200
-- Sem duplicatas:
SELECT code, count(*) FROM pros GROUP BY code HAVING count(*) > 1 LIMIT 5;
SELECT position, count(*) FROM fifo_queue GROUP BY position HAVING count(*) > 1 LIMIT 5;
```

---

## Passo 5 — Teste E2E Pagamento (PRO Avulso)

### 5.1 Compra pro_avulso (R$ 1)

1. Como **cliente de teste**, acesse `/planos`
2. Clique **Comprar** no PRO Avulso
3. Complete o pagamento no Mercado Pago
4. Validar:

```sql
SELECT id, status, product_key, is_distributed, external_reference, attribution
FROM financial_entries
ORDER BY created_at DESC LIMIT 1;

SELECT * FROM sale_distributions ORDER BY created_at DESC LIMIT 1;

SELECT * FROM pro_payouts ORDER BY paid_at DESC LIMIT 5;
```

### 5.2 Compra plano_muda (R$ 50) — via create-mp-subscription

```sql
SELECT id, user_id, plan_key, status, started_at, mp_preapproval_id
FROM subscriptions
ORDER BY updated_at DESC LIMIT 1;
```

---

## Passo 6 — Validação de Planos (Créditos)

Quando um pagamento com `product_key IN ('plano_semente','plano_muda','plano_arvore')` é confirmado:

1. O trigger `create_user_pros_from_confirmed_payment` cria um registro em `pro_credits`:

```sql
SELECT id, user_id, product_key, quantity_total, quantity_remaining, created_at
FROM pro_credits
ORDER BY created_at DESC LIMIT 5;
```

2. A Edge Function `convert-pro-credits` (agendada ou manual) converte créditos em PROs:

```sql
-- Chamar manualmente para testar:
SELECT * FROM convert_pro_credits(200);

-- Verificar ativações geradas:
SELECT * FROM pro_activations ORDER BY created_at DESC LIMIT 10;

-- O trigger consume_pro_activations gera PROs direct automaticamente.
SELECT count(*) FROM pros WHERE pro_type = 'direct';
```

3. Quantidades por plano:
   - `plano_semente` → 10 créditos
   - `plano_muda` → 25 créditos
   - `plano_arvore` → 50 créditos

### Função `process_sale_distribution_safe`

Para QA manual, use esta função wrapper que verifica se existem PROs elegíveis antes de processar:

```sql
SELECT process_sale_distribution_safe('<financial_entry_id>');
```

Se não houver PROs com status `sold`, retorna `{ skipped: true, reason: 'no_eligible_sold' }`.

---

## Passo 7 — Teste Ponto por QR (Referral do Ponto)

1. Abra `/ponto/mb` (simula scan de QR Code)
2. Clique **Comprar 1 PRO (R$ 1)** — a compra deve carregar `collection_point_slug=mb`
3. Complete o pagamento
4. Validar:

```sql
SELECT id, amount, product_key, status, attribution
FROM financial_entries
WHERE attribution->>'source' = 'collection_point'
ORDER BY created_at DESC LIMIT 5;
```

5. No Admin → aba **QA / Go-Live** → seção "Compras atribuídas a pontos" deve listar a compra.

---

## Passo 8 — Contato e Redes Sociais

No Supabase SQL Editor, configure os dados de contato:

```sql
INSERT INTO site_settings (key, value) VALUES
  ('contact_whatsapp', '{"value": "5519999999999"}'::jsonb),
  ('contact_email', '{"value": "contato@clubedoadubo.com.br"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

Validar:
- `/contato` → WhatsApp e email visíveis + link Instagram @clubedoadubo
- Rodapé → link @clubedoadubo visível

---

## Roteiro de Teste Client

### Criar usuário de teste:
1. Cadastrar `cliente.teste@gmail.com`
2. Completar perfil com endereço completo em `/perfil`
3. Cadastrar chave Pix

### Telas a validar:
- `/dashboard` — KPIs, PROs no ciclo, sonhos, copy correto
- `/fifo` — Fila FIFO, modal "Ver meus resíduos no ciclo", formato PRO #101 · CODIGO
- `/ciclo` — Passo a passo alinhado com ciclo real (ativar PRO, compostagem, venda, pagamento)
- `/dreams` — Sonhos
- `/assinatura` — Plano ativo
- `/indicacoes` — Link de indicação, indicados
- `/perfil` — Dados pessoais, endereço completo

### Fluxo de compra via ponto vs referral pessoal:
1. **Via ponto**: `/ponto/mb` → Comprar → `financial_entries.attribution.source = "collection_point"`
2. **Via referral**: `/u/CODIGO` → Comprar → `financial_entries.referral_code = "CODIGO"`
3. Ambos devem coexistir sem conflito.

---

## Checklist Final

- [ ] Reset executado e banco limpo
- [ ] MP_ACCESS_TOKEN de produção configurado
- [ ] APP_BASE_URL configurado
- [ ] env_mode = production
- [ ] Reset bloqueado na UI
- [ ] Seed de 200 PROs gerado
- [ ] Compra pro_avulso testada
- [ ] Compra plano testada (pro_credits gerados)
- [ ] convert_pro_credits executado (PROs criados)
- [ ] Compra via ponto testada (attribution ok)
- [ ] /contato com dados reais
- [ ] Instagram @clubedoadubo visível
- [ ] Mobile testado (iPhone + Android)
- [ ] /painel-publico com KPIs
- [ ] HIBP Check ativado no Auth

> **process_sale_distribution / mp-webhook / FIFO engine: INALTERADOS** ✅

# Clube do Adubo — GO-LIVE CHECKLIST

> ⚠️ **ATENÇÃO**: NÃO alterar `process_sale_distribution`, `mp-webhook`, ou a lógica FIFO/ordem/pagamentos em nenhuma circunstância.

---

## GO LIVE SHIELD — Proteções Ativas

| Proteção | Descrição |
|----------|-----------|
| `idx_unique_provider_payment_id` | Índice UNIQUE em `financial_entries(provider_payment_id)` — impede webhook duplicado |
| `guard_pro_creation_rate()` | Bloqueia criação de PROs se >500 em 60s |
| `FOR UPDATE SKIP LOCKED` | `consume_pro_activations()` usa lock pessimista para evitar corrida no pool |
| `trg_pros_set_sold_at` | Trigger único que registra `sold_at` automaticamente |
| `trg_create_user_pros_from_confirmed_payment` | Trigger único para criação de créditos/ativações |
| `process_sale_distribution_safe()` | Wrapper QA que valida elegibilidade antes de distribuir |
| `system_health_check()` | RPC de monitoramento: pool, FIFO, créditos, última distribuição |
| `env_mode = production` | Bloqueia reset sandbox na UI |

**Triggers removidos (duplicados):**
- `trg_create_user_pros_from_payment` (substituído por `trg_create_user_pros_from_confirmed_payment`)
- `trg_set_sold_at` (substituído por `trg_pros_set_sold_at`)

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
| `MP_ACCESS_TOKEN` | Token de sandbox (fallback / legado) |
| `MP_ACCESS_TOKEN_PROD` | Token de **PRODUÇÃO** do Mercado Pago |
| `MP_ENV` | `production` (ativa chaves de produção nas Edge Functions) |
| `APP_BASE_URL` | Domínio final (ex: `https://clubedoadubo.lovable.app`) |

> **Rollback:** basta setar `MP_ENV=sandbox` (ou removê-lo) para voltar ao comportamento anterior. O suporte a sandbox é mantido.

---

## Passo 3 — env_mode = production

```sql
UPDATE site_settings
SET value = '{"mode":"production"}'::jsonb
WHERE key = 'env_mode';
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
SELECT code, count(*) FROM pros GROUP BY code HAVING count(*) > 1 LIMIT 5;
SELECT position, count(*) FROM fifo_queue GROUP BY position HAVING count(*) > 1 LIMIT 5;
```

---

## Passo 5 — Teste E2E Pagamento (PRO Avulso)

1. Como **cliente de teste**, acesse `/planos`
2. Clique **Comprar** no PRO Avulso
3. Complete o pagamento no Mercado Pago
4. Validar:

```sql
SELECT id, status, product_key, is_distributed, external_reference, attribution
FROM financial_entries ORDER BY created_at DESC LIMIT 1;

SELECT * FROM sale_distributions ORDER BY created_at DESC LIMIT 1;
SELECT * FROM pro_payouts ORDER BY paid_at DESC LIMIT 5;
```

---

## Passo 6 — Validação de Planos (Créditos)

Quando um pagamento com `product_key IN ('plano_semente','plano_muda','plano_arvore')` é confirmado:

1. O trigger cria um registro em `pro_credits`:

```sql
SELECT id, user_id, product_key, quantity_total, quantity_remaining, created_at
FROM pro_credits ORDER BY created_at DESC LIMIT 5;
```

2. A Edge Function `convert-pro-credits` converte créditos em PROs:

```sql
SELECT * FROM convert_pro_credits(200);
SELECT * FROM pro_activations ORDER BY created_at DESC LIMIT 10;
SELECT count(*) FROM pros WHERE pro_type = 'direct';
```

3. Quantidades: Semente=10, Muda=25, Árvore=50

### Health Check

```sql
SELECT system_health_check();
```

Retorna: pool, fifo, créditos pendentes, última distribuição.

---

## Passo 7 — Teste Ponto por QR (Referral do Ponto)

1. Abra `/ponto/mb`
2. Clique **Comprar 1 PRO (R$ 1)**
3. Complete o pagamento
4. Validar:

```sql
SELECT id, amount, product_key, status, attribution
FROM financial_entries
WHERE attribution->>'source' = 'collection_point'
ORDER BY created_at DESC LIMIT 5;
```

---

## Passo 8 — Contato e Redes Sociais

```sql
INSERT INTO site_settings (key, value) VALUES
  ('contact_whatsapp', '{"value": "5519999999999"}'::jsonb),
  ('contact_email', '{"value": "contato@clubedoadubo.com.br"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

Validar: `/contato` → WhatsApp, email e Instagram @clubedoadubo visíveis.

---

## Roteiro de Teste Client

### Criar usuário de teste:
1. Cadastrar `cliente.teste@gmail.com`
2. Completar perfil com endereço completo em `/perfil`
3. Cadastrar chave Pix

### Telas a validar:
- `/dashboard` — KPIs, copy "Você já entrou no ciclo"
- `/fifo` — PRO #101 · CODIGO, modal com posição/status
- `/ciclo` — Passo a passo real
- `/dreams` — Sonhos
- `/assinatura` — Plano ativo
- `/indicacoes` — Link de indicação
- `/perfil` — Dados completos

### Fluxo ponto vs referral:
1. **Via ponto**: `/ponto/mb` → `attribution.source = "collection_point"`
2. **Via referral**: `/u/CODIGO` → `referral_code = "CODIGO"`
3. Ambos coexistem sem conflito.

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
- [ ] system_health_check() retorna ok
- [ ] /contato com dados reais
- [ ] Instagram @clubedoadubo visível
- [ ] Mobile testado (iPhone + Android)
- [ ] /painel-publico com KPIs
- [ ] HIBP Check ativado no Auth

> **process_sale_distribution / mp-webhook / FIFO engine: INALTERADOS** ✅

---

## SYSTEM LEDGER

O `system_ledger` registra todos os eventos econômicos do sistema de forma auditável, sem alterar nenhuma lógica financeira.

### Eventos registrados

| Evento | Quando | Dados |
|--------|--------|-------|
| `subscription_credit` | Pagamento de plano confirmado → `pro_credits` criado | `product_key`, quantidade |
| `pro_activated` | `consume_pro_activations()` transfere PRO do pool | PRO id, user_id |
| `adubo_sale` | `financial_entries` com status `confirmed` inserido | amount, financial_entry_id |
| `pro_paid` | `pro_payouts` registrado (via `process_sale_distribution`) | PRO id, amount_paid |

### Triggers

| Trigger | Tabela | Evento |
|---------|--------|--------|
| `trg_ledger_adubo_sale` | `financial_entries` | AFTER INSERT |
| `trg_ledger_pro_paid` | `pro_payouts` | AFTER INSERT |

### Consultas de auditoria

```sql
-- Últimos eventos do ledger
SELECT * FROM system_ledger ORDER BY created_at DESC LIMIT 20;

-- Resumo por tipo
SELECT event_type, count(*), sum(amount)
FROM system_ledger
GROUP BY event_type;

-- Eventos de um usuário
SELECT * FROM system_ledger
WHERE user_id = 'UUID'
ORDER BY created_at DESC;
```

### Finalidade

- Ledger financeiro auditável
- Histórico completo de eventos econômicos
- Rastreamento de ponta a ponta
- Base para transparência pública

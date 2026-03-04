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

## Passo 5 — Teste E2E Pagamento

### 5.1 Compra pro_avulso (R$ 1)

1. Como **cliente de teste**, acesse `/planos`
2. Clique **Comprar** no PRO Avulso
3. Complete o pagamento no Mercado Pago
4. Validar:

```sql
-- Financial entry criada e confirmada
SELECT id, status, product_key, is_distributed, external_reference, attribution
FROM financial_entries
ORDER BY created_at DESC LIMIT 1;

-- Distribuição processada
SELECT * FROM sale_distributions ORDER BY created_at DESC LIMIT 1;

-- Pagamentos efetuados
SELECT * FROM pro_payouts ORDER BY paid_at DESC LIMIT 5;
```

### 5.2 Compra plano_muda (R$ 50)

```sql
SELECT id, user_id, plan_key, status, started_at
FROM subscriptions
ORDER BY updated_at DESC LIMIT 1;
```

---

## Passo 6 — Teste Ponto por QR (Referral do Ponto)

1. Abra `/ponto/mb` (simula scan de QR Code)
2. Clique **Comprar 1 PRO (R$ 1)** — a compra deve carregar `collection_point_slug=mb`
3. Complete o pagamento
4. Validar:

```sql
-- Deve ter attribution com source=collection_point e slug=mb
SELECT id, amount, product_key, status, attribution
FROM financial_entries
WHERE attribution->>'source' = 'collection_point'
ORDER BY created_at DESC LIMIT 5;
```

5. No Admin → aba **QA / Go-Live** → seção "Compras atribuídas a pontos" deve listar a compra.

---

## Passo 7 — Contato

No Supabase SQL Editor, configure os dados de contato:

```sql
INSERT INTO site_settings (key, value) VALUES
  ('contact_whatsapp', '{"value": "5519999999999"}'::jsonb),
  ('contact_email', '{"value": "contato@clubedoadubo.com.br"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

Validar: acesse `/contato` e confirme que WhatsApp e email estão visíveis.

---

## Roteiro de Teste Client

### Telas a validar:
- `/dashboard` — KPIs, PROs no ciclo, sonhos
- `/fifo` — Fila FIFO, modal "Ver meus resíduos no ciclo"
- `/ciclo` — Ciclo visual
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
- [ ] Compra plano testada
- [ ] Compra via ponto testada (attribution ok)
- [ ] /contato com dados reais
- [ ] Mobile testado (iPhone + Android)
- [ ] /painel-publico com KPIs
- [ ] HIBP Check ativado no Auth

> **process_sale_distribution / mp-webhook / FIFO engine: INALTERADOS** ✅

# 📋 DOCUMENTO MESTRE — Clube do Adubo

> Catálogo completo de tudo que existe no site, textos, funcionalidades e o que está faltando.
> Última atualização: 17/02/2026

---

## 📌 SUMÁRIO

1. [Estrutura de Rotas](#1-estrutura-de-rotas)
2. [Páginas Públicas](#2-páginas-públicas)
3. [Área Logada (Cliente)](#3-área-logada-cliente)
4. [Painel Administrativo](#4-painel-administrativo)
5. [Componentes Compartilhados](#5-componentes-compartilhados)
6. [Edge Functions (Backend)](#6-edge-functions-backend)
7. [Banco de Dados (Supabase)](#7-banco-de-dados-supabase)
8. [SEO e Metadados](#8-seo-e-metadados)
9. [O que está faltando](#9-o-que-está-faltando)

---

## 1. ESTRUTURA DE ROTAS

### Rotas Públicas (com Header + Footer público)
| Rota | Página | Status |
|------|--------|--------|
| `/` | Landing Page (Home) | ✅ Implementada |
| `/planos` | Planos e Preços | ✅ Implementada |
| `/transparencia` | Transparência | ✅ Implementada |
| `/faq` | Perguntas Frequentes | ✅ Implementada |
| `/contato` | Contato | ✅ Implementada |
| `/economia-circular` | Regras do Sistema (7 regras) | ✅ Implementada |

### Rotas Standalone (sem layout)
| Rota | Página | Status |
|------|--------|--------|
| `/auth` | Login / Cadastro | ✅ Implementada |
| `/alterar-senha` | Alterar Senha (protegida) | ✅ Implementada |
| `/u/:codigo` | Perfil Público do Indicador | ✅ Implementada |
| `/ponto/:slug` | Página Pública do Ponto de Coleta | ✅ Implementada |

### Rotas Protegidas (área logada com AppHeader)
| Rota | Página | Status |
|------|--------|--------|
| `/dashboard` | Passo a Passo (Hub Central) | ✅ Implementada |
| `/dreams` | Meus Sonhos | ✅ Implementada |
| `/indicacoes` | Minhas Indicações | ✅ Implementada |
| `/fifo` | Fila FIFO | ✅ Implementada |
| `/perfil` | Meu Perfil | ✅ Implementada |
| `/admin` | Painel Administrativo | ✅ Implementada |

### Rota 404
| Rota | Página | Status |
|------|--------|--------|
| `*` | Not Found | ✅ Implementada |

---

## 2. PÁGINAS PÚBLICAS

### 2.1 Landing Page (`/`)

**Seções (na ordem):**

1. **HERO** — "Participe de um ciclo que transforma resíduo em adubo, ajuda o meio ambiente e gera valor"
   - Badge: "♻️ Economia Circular Urbana"
   - Subtexto: "O Clube do Adubo conecta pessoas a um ciclo urbano simples e transparente..."
   - CTAs: "Quero participar" | "Entender como funciona"

2. **O PROBLEMA** — "🚯 O problema do resíduo orgânico urbano"
   - 4 cards: Aterros lotados, Emissão de gases, Nutrientes desperdiçados, Custo ambiental
   - Frase: "Isso não é um problema do futuro. É um problema de agora."

3. **A SOLUÇÃO** — "🌱 Economia circular real"
   - 4 cards: Ciclo fechado, Impacto mensurável, Rastreabilidade total, Participação coletiva

4. **ECONOMIA CIRCULAR** — "Como o ciclo funciona na prática"
   - Fluxograma visual (imagem)
   - Frases: "Cada venda paga quem está na vez. Cada venda ajuda a próxima pessoa."
   - CTA: "Entender todas as regras do ciclo" → `/economia-circular`

5. **CICLO VISUAL** — "🔄 O ciclo do Clube do Adubo"
   - Componente `CycleVisual` interativo
   - Frase: "O ciclo se repete. Um sistema contínuo, urbano e sustentável."

6. **PASSO A PASSO** — "✅ Simples, transparente e rastreável"
   - 4 etapas: Ative PROs → Resíduo vira adubo → Venda do adubo → Valor distribuído
   - Nota: "Nada acontece sem resíduo orgânico real."

7. **FILA FIFO x ONDAS** — "🧭 Uma fila de pagamento. Muitas ondas de impacto."
   - 2 cards lado a lado: Fila FIFO (Pagamento) vs Ondas de Impacto (Engajamento)
   - Frase: "Fila é dinheiro. Ondas são impacto."

8. **POR QUE PARTICIPAR** — "🌱 Por que fazer parte do Clube do Adubo?"
   - 6 itens: Impacto real, Economia circular, Transparência, Sonhos, Participação coletiva, Ciclo contínuo

9. **CONFIANÇA E AÇÃO** — "✅ Escolha como participar — com clareza total"
   - 4 cards-link: Planos, Transparência, FAQ, Contato

10. **CTA FINAL** — "Pronto para participar do ciclo?"
    - CTAs: "Criar minha conta" | "Entender melhor" | "Falar com o Clube"

11. **JORNADA DO HERÓI** — "📘 Quer ir mais fundo? A Jornada do Herói do ciclo urbano"
    - 7 steps accordion: O Chamado, A Virada, O Mentor, As Provas, A Recompensa, O Retorno, A Nova Fase
    - Frase final: "Você já faz parte dessa jornada."

---

### 2.2 Planos (`/planos`)

**Categorias (toggle):**
- **Compra Avulsa**: Adubos (Granulado R$15, Líquido R$10) + PRO (R$1/PRO)
- **Assinaturas PRO**: Semente (10 PROs R$10/mês), Muda (25 PROs R$25/mês), Árvore (50 PROs R$50/mês), Livre
- **Assinaturas Adubo**: Granulado R$15/mês, Líquido R$10/mês, Combo R$22/mês
- **Fechar o Ciclo**: Semente R$25/mês, Muda R$50/mês, Árvore R$90/mês (PROs + Adubos)
- **Kits**: Kit Iniciante R$50, Kit Jardim Completo (preço não definido no código)
- **Presentes**: Cards de presente (implementado)
- **Todos**: Visualização unificada

**Links de checkout**: Nexano (checkout.nexano.com.br)

---

### 2.3 Transparência (`/transparencia`)

**Seções:**
1. Hero: "Como o Clube do Adubo funciona"
2. Ciclo Completo: 4 etapas visuais (Coleta → Processamento → Produção → Venda)
3. Fila Única e Global: Cronológica, Transparente, Imutável
4. O que NÃO existe: sem pagamento para acelerar, sem hierarquias, sem promessas
5. Fila ≠ Ondas: comparativo visual
6. Frase-Âncora: "Aqui o resíduo não é tratado. Ele é processado, transformado e reinserido."
7. Compromisso: "O Clube do Adubo existe para transformar resíduo em valor de forma justa..."

---

### 2.4 FAQ (`/faq`)

**8 perguntas:**
1. O que é um PRO?
2. Isso é investimento financeiro? (NÃO)
3. De onde vem o dinheiro?
4. O que é a Fila FIFO?
5. O que são Ondas de Impacto?
6. Quanto tempo demora para receber?
7. Posso perder meu PRO?
8. Como funcionam as metas progressivas?

---

### 2.5 Contato (`/contato`)

**Canais:**
- WhatsApp: `5511999999999` ⚠️ **PLACEHOLDER — precisa trocar pelo número real**
- Email: `contato@clubedoadubo.com.br` ⚠️ **PLACEHOLDER — precisa confirmar**

---

### 2.6 Economia Circular (`/economia-circular`)

**Conteúdo:**
- Fluxograma visual (imagem)
- 7 Regras do Ciclo (accordion):
  1. Origem do ciclo (resíduo real)
  2. PRO = 100g de resíduo
  3. Valor nasce na venda do adubo
  4. Distribuição: R$2 ao PRO + R$1 para avanço
  5. Fila FIFO única e imutável
  6. Fila avança com vendas
  7. Indicações aceleram, não criam atalhos
- Princípio final: "Venda real → Pagamento real → Avanço justo → Impacto contínuo"

---

### 2.7 Header Público

- Logo + "Clube do Adubo" + "Economia Circular Urbana"
- Menu: Início, Planos, Transparência, FAQ, Contato
- CTAs: "Criar conta" | "Entrar"
- Micro-selo: "♻️ Ciclo transparente • Dados reais • Sem atalhos"
- Menu mobile responsivo

### 2.8 Footer Público

- 5 colunas: Identidade, Participação (Planos), Confiança (Transparência), Educação (FAQ), Humano (Contato)
- Microcopy sob cada link
- Frase: "Transparência não é um detalhe. Ela sustenta o ciclo."

---

## 3. ÁREA LOGADA (Cliente)

### 3.1 Autenticação (`/auth`)

- Login por email/senha
- Cadastro: nome, email, senha, WhatsApp (opcional)
- Login social (Google/Apple): **preparado no código, mas DESATIVADO**
- Validação com Zod
- "Esqueci minha senha": ⚠️ **Mostra toast "em desenvolvimento"**
- Link para Termos de Uso: ⚠️ **Link `/termos` não existe (404)**
- Redirect: admin → `/admin`, cliente → `/dashboard`

### 3.2 Guards de Proteção

- **ProtectedRoute**: bloqueia acesso não-autenticado
- **PasswordChangeGuard**: força troca de senha se `password_change_required = true`
- **ProfileDeadlineGuard**: força preenchimento do perfil dentro do prazo

### 3.3 Navegação Logada (AppHeader)

**Menu numerado (desktop e mobile):**
1. Passo a passo → `/dashboard`
2. Meus Sonhos → `/dreams`
3. Minhas Indicações → `/indicacoes`
4. Fila FIFO → `/fifo`
- Botão "Meus PROs" → `/dashboard`

**Dropdown do usuário:** Meu Perfil, Painel Admin (se admin/staff), Sair

---

### 3.4 Dashboard — Passo a Passo (`/dashboard`)

**Componentes (na ordem):**
1. **DashboardHeader**: saudação + botão PIX + QR Code
2. **FloatingAddProsCTA**: CTA flutuante para ativar PROs
3. **ImpactMissionsSection**: missões rotativas (controlável pelo admin)
4. **CollectiveImpactCard**: impacto ambiental coletivo (controlável pelo admin)
5. **LevelProgressCard**: progresso de nível
6. **DreamsResumeCard**: resumo dos sonhos
7. **CloseCycleSection**: seção "Fechar o Ciclo" (assinaturas/produtos)
8. **DailyHistoryCard**: diário de impacto (vinculado ao toggle de missões)
9. **FifoEducationCard**: educação sobre FIFO

**Modals:**
- AddProsPixModal: ativação de PROs via PIX
- QrCodeModal: QR Code do link de indicação

---

### 3.5 Meus Sonhos (`/dreams`)

**Funcionalidades:**
- Criar sonhos com título e meta (valor em R$)
- Cards com progresso por níveis
- Impacto agregado (PROs em sonhos, sonhos totais, concluídos)
- Próximo nível
- Alocar PROs a sonhos
- Coleções de sonhos temáticas
- Reativação automática (toast, sem persistência real)
- Frase-guia: "Um passo por vez, todos os dias, até o impacto máximo."

---

### 3.6 Minhas Indicações (`/indicacoes`)

**Abas:**
1. **Meu Impacto**: cards de PROs diretos, recorrentes, globais, posição FIFO, nível, badge
2. **Comissão**: seletor de preferência de comissão (PROs ou dinheiro)
3. **Simulador**: simulador de comissões
4. **Minha Rede**: lista de indicados

**Card de Link**: link de indicação copiável
**Métricas**: grid de impacto (indicações ativas, total de indicados, etc.)

---

### 3.7 Fila FIFO (`/fifo`)

**Zona 1 — Educação:**
1. FifoHeroSection
2. FifoFluxogramaSection (fluxograma)
3. FifoExplanationBlock (por que é justa)
4. RealDoCicloBlock (como o dinheiro entra)
5. CTA "Ver minha posição"

**Divisor**: "A fila se move com impacto real, não com promessas."

**Zona 2 — Fila Ativa:**
6. CycleStagesBlock (etapas clicáveis com contadores)
7. Busca e filtro (por código/nome, "Meus PROs")
8. FifoQueueColumns (visualização em colunas)
9. FifoFooter (mensagem motivacional)

**Modals:**
- ProSummaryModal: resumo de um PRO
- MyPositionModal: posição do usuário na fila

---

### 3.8 Meu Perfil (`/perfil`)

**Campos:**
- Nome completo, Gênero, CPF (com validação), Data de nascimento
- Email (readonly), WhatsApp (com verificação OTP)
- Chave PIX

**Funcionalidades:**
- Verificação de WhatsApp por OTP
- Validação de CPF
- Prazo para completar perfil (ProfileDeadlineGuard)

---

## 4. PAINEL ADMINISTRATIVO (`/admin`)

### Abas (10 total):

| # | Aba | Componente | Acesso |
|---|-----|-----------|--------|
| 0 | Visão Geral | OverviewDashboard | Admin + Staff |
| 1 | Gerar PROs | GenerateProsPanel | Admin only |
| 2 | Pesagem | WeighingsManagement | Admin + Staff |
| 3 | Produção | BatchesManagement | Admin only |
| 4 | Distribuição | DistributionManagement | Admin + Staff |
| 5 | Financeiro | FinancialManagement | Admin only |
| 6 | Pontos de Coleta | CollectionPointsManagement | Admin + Staff |
| 7 | Usuários | UsersManagement | Admin only |
| 8 | Indicações | ReferralsManagement | Admin only |
| 9 | Site | SiteManagement | Admin only |

### 4.1 Visão Geral (0)
- Dashboard com métricas financeiras e pipeline visual do ciclo

### 4.2 Gerar PROs (1)
- Gerar PROs em lote para usuários

### 4.3 Pesagem (2)
- Registrar pesagens em pontos de coleta

### 4.4 Produção (3)
- Gerenciar lotes (batches): composting/vermicomposting, status, peso

### 4.5 Distribuição (4)
- Registrar distribuições: pacotes granulados, garrafas líquidas, outros itens
- Vinculado a pontos de venda (sales_points)

### 4.6 Financeiro (5)
- Entradas financeiras (vendas de adubo)
- Controle de distribuição de valores

### 4.7 Pontos de Coleta (6)
- CRUD de pontos de coleta com endereço, cidade, estado, horário, telefone, WhatsApp
- Página pública opcional (has_public_page + slug)

### 4.8 Usuários (7)
- Gerenciamento de perfis, bloqueio, roles

### 4.9 Indicações (8)
- **Sub-abas**: Indicações (tabela), Vínculos PRO (auditoria), Níveis (editor de comissões), Logs
- Overview com métricas agregadas

### 4.10 Site (9)
- **Toggles de módulos:**
  - Missões de Impacto (missions_enabled) — controla também o Diário de Impacto
  - Impacto Ambiental Coletivo (collective_impact_enabled)

---

## 5. COMPONENTES COMPARTILHADOS

- **HelpTooltip**: tooltip de ajuda reutilizável
- **ProtectedRoute**: guard de autenticação
- **PasswordChangeGuard**: guard de troca de senha
- **ProfileDeadlineGuard**: guard de prazo do perfil

---

## 6. EDGE FUNCTIONS (Backend)

| Função | Descrição | Status |
|--------|-----------|--------|
| `generate-pros` | Gera PROs em lote | ✅ |
| `delete-pros-batch` | Deleta PROs em lote | ✅ |
| `webhook-purchase` | Webhook de compra aprovada (Nexano) | ✅ |
| `webhook-purchase-declined` | Webhook de compra recusada | ✅ |

---

## 7. BANCO DE DADOS (Supabase)

### Tabelas:
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `profiles` | Perfis de usuários | ✅ |
| `user_roles` | Roles (admin/staff/client) | ✅ |
| `pros` | Unidades PRO (100g resíduo) | ✅ |
| `fifo_queue` | Fila FIFO global | ✅ |
| `dreams` | Sonhos dos usuários | ✅ |
| `batches` | Lotes de compostagem | ✅ |
| `weighings` | Pesagens registradas | ✅ |
| `distributions` | Distribuições de adubo | ✅ |
| `financial_entries` | Entradas financeiras | ✅ |
| `collection_points` | Pontos de coleta | ✅ |
| `sales_points` | Pontos de venda | ✅ |
| `commission_levels` | Níveis de comissão | ✅ |
| `referral_stats` | Estatísticas de indicação | ✅ |
| `referral_logs` | Logs de indicação | ✅ |
| `subscriptions` | Assinaturas | ✅ |
| `impact_missions` | Missões de impacto | ✅ |
| `otp_codes` | Códigos OTP | ✅ |
| `site_settings` | Configurações do site | ✅ |

### Views:
- `public_profiles`: perfil público (nome, código, data de entrada)

### Functions (RPC):
- `generate_pros_batch`, `generate_pro_code`, `generate_referral_code`
- `get_fifo_queue_public`, `get_next_fifo_position`
- `get_commission_level`, `count_active_referrals`
- `get_public_profile_data`, `get_collection_point_public`
- `get_referral_overview`, `lookup_referral_code`
- `has_role`, `is_admin`, `is_staff`
- `generate_otp_code`, `generate_slug`

---

## 8. SEO E METADADOS

- **Título**: "Clube do Adubo | Economia Circular Urbana" (no index.html)
- **Meta description**: presente
- **Schema JSON-LD**: Organization + Product (PRO)
- **sitemap.xml**: ✅ presente em `/public/sitemap.xml`
- **robots.txt**: ✅ presente em `/public/robots.txt`
- **Helmet** (react-helmet-async): usado na página de Economia Circular
- **Favicon**: `.ico` e `.webp`
- **OG tags**: ⚠️ **Não verificado se completas em todas as páginas**

---

## 9. ❌ O QUE ESTÁ FALTANDO

### 🔴 Crítico (funcionalidade quebrada ou placeholder)

1. **Página "Termos de Uso" (`/termos`)** — Link existe no rodapé do Auth, mas a página NÃO existe (dá 404)
2. **"Esqueci minha senha"** — Exibe apenas um toast "em desenvolvimento". Não funciona.
3. **Dados de Contato reais** — WhatsApp (`5511999999999`) e email (`contato@clubedoadubo.com.br`) são placeholders no código
4. **Login Social (Google/Apple)** — Código preparado mas desativado. Providers precisam ser habilitados no Supabase.

### 🟡 Importante (funcionalidade incompleta)

5. **Página de Transparência com dados reais** — Hoje é estática. Poderia mostrar dados reais do banco (total de PROs, posição da fila, resíduo processado, etc.)
6. **Notificações** — WhatsApp/email de notificação (fila avançou, PRO pago, etc.) — não implementado
7. **Pagamentos automáticos** — O fluxo de pagamento real (PIX para o usuário quando PRO é pago) não parece estar automatizado
8. **Reativação automática de sonhos** — Salva apenas toast, sem persistência no banco
9. **Compra avulsa de PROs** — O botão "Ativar PROs" abre modal PIX, mas sem link de checkout como os planos
10. **Kits e Presentes** — Cards existem, mas sem links de checkout reais (chamam `onGetStarted` genérico)

### 🟢 Melhorias sugeridas

11. **Dashboard de Transparência pública** — Painel público com dados reais (não apenas texto)
12. **Página "Sobre Nós" / "Quem Somos"** — Não existe
13. **Blog / Conteúdo educativo** — Não existe
14. **Política de Privacidade** — Não existe
15. **Dark mode** — Tokens CSS existem mas não há toggle visível
16. **PWA / App mobile** — Não implementado
17. **Helmet/SEO em todas as páginas** — Apenas Economia Circular usa `<Helmet>`. Faltam nas demais.
18. **Testes automatizados** — Existe apenas `example.test.ts` (placeholder)
19. **i18n / Internacionalização** — Tudo hardcoded em PT-BR
20. **Relatórios / Exportação** — Admin não tem exportação CSV/PDF
21. **Logs de atividade do usuário** — Sem histórico de ações no dashboard
22. **Busca global** — Não existe
23. **Acessibilidade (a11y)** — Não auditada formalmente
24. **Página de Status/Uptime** — Não existe
25. **Integração com meios de pagamento direto** — Sem Stripe/PIX automático nativo

---

## 📊 RESUMO QUANTITATIVO

| Categoria | Quantidade |
|-----------|-----------|
| Páginas públicas | 6 |
| Páginas logadas (cliente) | 5 |
| Páginas standalone | 4 |
| Abas admin | 10 |
| Tabelas no banco | 18 |
| Edge functions | 4 |
| Componentes UI (shadcn) | 40+ |
| Componentes de feature | 60+ |
| Links de checkout externos | 10+ |

---

*Documento gerado automaticamente a partir da análise do código-fonte do projeto Clube do Adubo.*

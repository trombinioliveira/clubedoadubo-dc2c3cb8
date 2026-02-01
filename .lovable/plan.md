

# Plano: Adicionar "Indicações" ao Sistema

## Visão Geral

O sistema de indicações do Clube do Adubo já está implementado na página `/indicacoes`. Este plano adiciona o acesso a essa página através do dropdown do usuário e cria um painel administrativo completo para gestão do sistema de indicações.

---

## O Que Será Feito

### 1. Adicionar Link "Indicações" no Dropdown do Usuário

Adicionar um item de menu no dropdown do avatar do usuário (tanto desktop quanto mobile) que leva à página `/indicacoes`.

**Localização**: `src/components/layout/AppHeader.tsx`

**Mudanças**:
- Importar ícone `Share2` do Lucide
- Adicionar item de menu "Indicações" após "Meu Perfil"
- Adicionar link no menu mobile também

---

### 2. Criar Painel Administrativo de Indicações

Nova aba no painel administrativo (`/admin`) para gestão completa do sistema de indicações.

**Funcionalidades**:

#### 2.1 Visão Geral de Indicações
Cards com métricas globais:
- Total de usuários com links ativos
- Total de usuários com indicados
- Total de PROs Diretos gerados
- Total de PROs Recorrentes gerados
- Total de PROs Globais gerados
- Total de assinaturas ativas

#### 2.2 Lista de Indicações por Usuário
Tabela mostrando para cada usuário:
- Nome e email
- Código de indicação
- Número de indicados diretos
- Número de indicados ativos (que compraram)
- PROs por tipo (Direto/Recorrente/Global)
- Nível de comissão atual
- Vendas associadas ao link

#### 2.3 Gestão de Níveis de Comissão
Interface para editar os níveis de comissão:
- Visualizar níveis existentes
- Editar faixas (min/max referrals)
- Editar percentuais
- Ativar/desativar níveis
- Adicionar novos níveis

#### 2.4 Logs de Eventos
Histórico de:
- Geração de PRO Global
- Movimentações na fila FIFO
- Conclusão de metas
- Mudanças de nível
- Alterações manuais do admin

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/layout/AppHeader.tsx` | Modificar | Adicionar link "Indicações" no dropdown |
| `src/features/admin/components/ReferralsManagement.tsx` | Criar | Componente principal do painel admin |
| `src/features/admin/components/ReferralsOverview.tsx` | Criar | Cards de visão geral |
| `src/features/admin/components/ReferralsTable.tsx` | Criar | Tabela de indicações por usuário |
| `src/features/admin/components/CommissionLevelsEditor.tsx` | Criar | Editor de níveis de comissão |
| `src/features/admin/components/ReferralLogs.tsx` | Criar | Histórico de eventos |
| `src/features/admin/components/index.ts` | Modificar | Exportar novos componentes |
| `src/features/admin/pages/AdminDashboard.tsx` | Modificar | Adicionar nova aba "Indicações" |

---

## Estrutura Visual do Painel Admin

```text
┌─────────────────────────────────────────────────────────────┐
│  Painel Administrativo                                      │
├─────────────────────────────────────────────────────────────┤
│  [Visão Geral] [Gerar PROs] [Pesagem] ... [Indicações] ...  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Links      │ │ PROs        │ │ PROs        │           │
│  │ Ativos     │ │ Diretos     │ │ Globais     │           │
│  │   150      │ │   487       │ │   1.230     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  [Indicações] [Níveis de Comissão] [Logs]                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Usuário     │ Código  │ Indicados │ Nível   │ PROs  │   │
│  ├─────────────┼─────────┼───────────┼─────────┼───────┤   │
│  │ João Silva  │ ABC123  │ 12 (8)    │ Ativo   │ 45    │   │
│  │ Maria...    │ DEF456  │ 5 (3)     │ Inic.   │ 12    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detalhes Técnicos

### Queries do Banco de Dados

1. **Visão Geral**: Usar a função `get_referral_overview()` já existente
2. **Lista de Indicações**: Join entre `profiles` e `referral_stats`
3. **Níveis de Comissão**: CRUD na tabela `commission_levels`
4. **Logs**: Select da tabela `referral_logs`

### Componentes UI Utilizados
- Cards, Tabelas, Tabs, Dialogs (já existentes no projeto)
- Badge para status e níveis
- Input, Select para edição de níveis

---

## Estimativa

- **Dropdown do usuário**: 5 minutos
- **Painel administrativo**: 30-40 minutos

---

## Resultado Final

- Usuários terão acesso fácil à página de indicações pelo dropdown
- Administradores terão controle total sobre o sistema de indicações
- Configuração de níveis de comissão será dinâmica
- Histórico completo de eventos para auditoria


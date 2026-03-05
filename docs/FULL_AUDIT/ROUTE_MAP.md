# ROUTE MAP — Clube do Adubo

> Inventário completo de rotas, componentes, estados e permissões.

---

## Rotas Públicas (sem login)

| Rota | Nome | Objetivo | Componentes principais | Permissão |
|------|------|----------|----------------------|-----------|
| `/` | Home / Landing | Converter visitantes em participantes | HeroSection, PricingSection, CircularEconomySection, ImpactCards, CycleVisual | public |
| `/planos` | Planos & Compra | Exibir planos e iniciar checkout | PricingSection, PurchaseProModal, CommissionSimulator | public |
| `/faq` | Perguntas Frequentes | Esclarecer dúvidas comuns | Accordion FAQ | public |
| `/transparencia` | Transparência | Apresentar visão geral do ciclo | Texto institucional | public |
| `/contato` | Contato | Canal de comunicação + Instagram | Formulário/info de contato | public |
| `/economia-circular` | Economia Circular | Educar sobre o modelo | Fluxograma, texto educativo | public |
| `/termos` | Termos de Uso | Conformidade jurídica | Texto legal | public |
| `/politica-de-privacidade` | Política de Privacidade | Conformidade LGPD | Texto legal | public |
| `/politica-de-riscos` | Política de Riscos | Disclaimer financeiro | Texto legal | public |
| `/natureza-do-pro` | Natureza do PRO | Explicar que PRO não é investimento | Texto legal/educativo | public |
| `/painel-publico` | Painel Público | Transparência com dados reais | KPIs públicos (RPC get_public_transparency_kpis) | public |
| `/compra/sucesso` | Checkout — Sucesso | Confirmar pagamento aprovado | CheckoutResultPage (status=sucesso) | public |
| `/compra/pendente` | Checkout — Pendente | Informar pagamento aguardando | CheckoutResultPage (status=pendente) | public |
| `/compra/erro` | Checkout — Erro | Informar falha no pagamento | CheckoutResultPage (status=erro) | public |
| `/auth` | Login / Cadastro | Autenticação | Formulário login/signup | public (standalone) |
| `/alterar-senha` | Alterar Senha | Troca de senha obrigatória | ChangePasswordPage | public (standalone) |

## Rotas Públicas Dinâmicas

| Rota | Nome | Objetivo | Dependências | Permissão |
|------|------|----------|-------------|-----------|
| `/u/:codigo` | Perfil Público | Exibir dados públicos do participante | RPC get_public_profile_data | public (standalone) |
| `/ponto/:slug` | Ponto de Coleta | Página pública do ponto | RPC get_collection_point_public | public (standalone) |

## Rotas Logadas (client)

| Rota | Nome | Objetivo | Guards | Componentes principais |
|------|------|----------|--------|----------------------|
| `/dashboard` | Dashboard | Visão geral do participante | ProtectedRoute(clientOnly), PasswordChangeGuard, ProfileDeadlineGuard | DashboardHeader, StatsOverview, CycleResumeCard, QuickActionsCard, ImpactMissionsSection |
| `/ciclo` | Ciclo | Explicar as 6 etapas do ciclo real | ProtectedRoute(clientOnly), PasswordChangeGuard, ProfileDeadlineGuard | CicloPage (6 etapas) |
| `/dreams` | Sonhos | Gerenciar metas financeiras | ProtectedRoute(clientOnly), PasswordChangeGuard, ProfileDeadlineGuard | DreamCard, CreateDreamModal, AllocateProModal |
| `/assinatura` | Assinatura | Gerenciar plano recorrente | ProtectedRoute(clientOnly), PasswordChangeGuard, ProfileDeadlineGuard | AssinaturaPage |
| `/fifo` | Fila FIFO | Visualizar posição no ciclo | ProtectedRoute(clientOnly), PasswordChangeGuard, ProfileDeadlineGuard | FifoHeroSection, FifoQueueColumns, MyPositionModal |
| `/indicacoes` | Indicações | Gerenciar link de indicação e rede | ProtectedRoute(clientOnly), PasswordChangeGuard, ProfileDeadlineGuard | ReferralLinkCard, ReferredUsersList, ImpactMetricsGrid |
| `/perfil` | Meu Perfil | Editar dados pessoais | ProtectedRoute(clientOnly), PasswordChangeGuard | MyProfilePage |

## Rotas Admin/Staff

| Rota | Nome | Objetivo | Guard |
|------|------|----------|-------|
| `/admin` | Painel Administrativo | Gestão completa da plataforma | ProtectedRoute(requireStaff) |

### Abas do Admin

| Aba | Componente | Permissão |
|-----|-----------|-----------|
| Visão Geral | OverviewDashboard | Admin + Staff |
| Gerar PROs | GenerateProsPanel | Admin only |
| Pesagem | WeighingsManagement | Admin + Staff |
| Produção | BatchesManagement | Admin only |
| Distribuição | DistributionManagement | Admin + Staff |
| Financeiro | FinancialManagement | Admin only |
| Distribuições por Venda | SaleDistributionsManagement | Admin only |
| Pontos de Coleta | CollectionPointsManagement | Admin + Staff |
| Usuários | UsersManagement | Admin only |
| Indicações | ReferralsManagement | Admin only |
| Site | SiteManagement | Admin only |
| Notificações | NotificationsManagement | Admin only |
| Assinaturas | SubscriptionsManagement | Admin + Staff |
| Reset Sandbox | ResetSandbox | Admin only |
| QA / Go-Live | QAGoLivePanel | Admin only |
| **Audit (Full QA)** | **AuditPanel** | **Admin only** |

## Rota Catch-All

| Rota | Nome | Objetivo |
|------|------|----------|
| `*` | 404 | Página não encontrada |

---

## Estados por página (padrão esperado)

Toda página deve implementar:
- **Loading**: Skeleton ou spinner centralizado
- **Empty**: Mensagem orientativa + próximo passo
- **Error**: Mensagem + botão "Tentar novamente"
- **Success**: Confirmação + próximo passo

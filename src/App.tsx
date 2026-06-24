import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// @ts-ignore - QueryClient type drift
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AppLayout, PublicLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/shared";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";
import DreamsPage from "./pages/DreamsPage";
import MyProfilePage from "./pages/MyProfilePage";
import NotFound from "./pages/NotFound";
import LandingCompra from "./pages/LandingCompra";
import FaqPage from "./pages/FaqPage";
import TransparenciaPage from "./pages/TransparenciaPage";
import ContatoPage from "./pages/ContatoPage";
import EconomiaCircularPage from "./pages/EconomiaCircularPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CollectionPointPage from "./pages/CollectionPointPage";
import TermosPage from "./pages/TermosPage";
import PoliticaPrivacidadePage from "./pages/PoliticaPrivacidadePage";
import PoliticaRiscosPage from "./pages/PoliticaRiscosPage";
import NaturezaProPage from "./pages/NaturezaProPage";
import PublicTransparencyDashboard from "./pages/PublicTransparencyDashboard";
import PublicFilaPage from "./pages/PublicFilaPage";
import CheckoutResultPage from "./pages/CheckoutResultPage";
import CicloPage from "./pages/CicloPage";
import AssinaturaPage from "./pages/AssinaturaPage";
import JornadaPage from "./pages/JornadaPage";
import TutorialPage from "./pages/TutorialPage";
import ConvitePage from "./pages/ConvitePage";
import CheckinPage from "./pages/CheckinPage";
import PointPublicPage from "./pages/PointPublicPage";
import GamePage from "./pages/GamePage";

// Feature Pages
import { AdminDashboard } from "@/features/admin";
import { FifoQueuePage } from "@/features/fifo";
import { ReferralsPage, PublicProfilePage } from "@/features/referrals";
import { ProfileDeadlineGuard } from "@/components/shared/ProfileDeadlineGuard";
import { PasswordChangeGuard } from "@/components/shared/PasswordChangeGuard";

// Loja (vitrine virtual)
import { LojaLayout, LojaPage, ProductPage, CartPage, AduboDigitalPage, AduboLiquidoPage, ServicosAdubacaoPage, LojaAdminPage } from "@/features/loja";
import { GoogleTagManager } from "@/features/loja/components/GoogleTagManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleTagManager />
          <Routes>
            {/* Auth pages - standalone */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/alterar-senha" element={<ChangePasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            {/* Public profile page - standalone (no layout) */}
            <Route path="/u/:codigo" element={<PublicProfilePage />} />
            <Route path="/ponto/:slug" element={<CollectionPointPage />} />
            {/* Pontos de coleta / check-in — sistema operacional, mantidos tecnicamente */}
            <Route path="/checkin/:pointSlug" element={<CheckinPage />} />
            <Route path="/p/:pointSlug" element={<PointPublicPage />} />

            {/* Loja virtual — única experiência pública nesta fase */}
            <Route path="/loja" element={<LojaLayout />}>
              <Route index element={<LojaPage />} />
              <Route path="adubo-digital" element={<AduboDigitalPage />} />
              <Route path="adubo-liquido" element={<AduboLiquidoPage />} />
              <Route path="servicos-de-adubacao" element={<ServicosAdubacaoPage />} />
              <Route path="produto/:slug" element={<ProductPage />} />
              <Route path="carrinho" element={<CartPage />} />
              <Route path="admin" element={
                <ProtectedRoute requireStaff>
                  <LojaAdminPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Raiz redireciona para a loja */}
            <Route path="/" element={<Navigate to="/loja" replace />} />

            {/* CONTENÇÃO PÚBLICA: páginas antigas redirecionadas para a loja.
                Componentes preservados no código (imports mantidos) para reativação futura. */}
            <Route path="/inicio" element={<Navigate to="/loja" replace />} />
            <Route path="/planos" element={<Navigate to="/loja" replace />} />
            <Route path="/faq" element={<Navigate to="/loja" replace />} />
            <Route path="/transparencia" element={<Navigate to="/loja" replace />} />
            <Route path="/contato" element={<Navigate to="/loja" replace />} />
            <Route path="/economia-circular" element={<Navigate to="/loja" replace />} />
            <Route path="/natureza-do-pro" element={<Navigate to="/loja" replace />} />
            <Route path="/politica-de-riscos" element={<Navigate to="/loja" replace />} />
            <Route path="/painel-publico" element={<Navigate to="/loja" replace />} />
            <Route path="/painel-publico/fila" element={<Navigate to="/loja" replace />} />
            <Route path="/convite" element={<Navigate to="/loja" replace />} />
            <Route path="/game" element={<Navigate to="/loja" replace />} />
            <Route path="/u/:codigo" element={<Navigate to="/loja" replace />} />
            <Route path="/ponto/:slug" element={<Navigate to="/loja" replace />} />

            {/* Páginas legais — mantidas públicas e acessíveis (necessárias à loja) */}
            <Route element={<PublicLayout />}>
              <Route path="/termos" element={<TermosPage />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidadePage />} />
              {/* Resultados de checkout — necessários ao fluxo de compra */}
              <Route path="/compra/sucesso" element={<CheckoutResultPage status="sucesso" />} />
              <Route path="/compra/pendente" element={<CheckoutResultPage status="pendente" />} />
              <Route path="/compra/erro" element={<CheckoutResultPage status="erro" />} />
            </Route>
            
            {/* Protected pages with AppLayout (logged-in header) */}
            <Route element={<AppLayout />}>
              
              <Route path="/jornada" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <JornadaPage />
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/perfil" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <MyProfilePage />
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <DashboardPage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/ciclo" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <CicloPage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/dreams" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <DreamsPage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sonhos" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <DreamsPage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/assinatura" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <AssinaturaPage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/fifo" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <FifoQueuePage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/indicacoes" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <ReferralsPage />
                    </ProfileDeadlineGuard>
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/tutorial" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <TutorialPage />
                  </PasswordChangeGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requireStaff>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

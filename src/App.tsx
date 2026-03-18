import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// @ts-ignore - QueryClient type drift
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Feature Pages
import { AdminDashboard } from "@/features/admin";
import { FifoQueuePage } from "@/features/fifo";
import { ReferralsPage, PublicProfilePage } from "@/features/referrals";
import { ProfileDeadlineGuard } from "@/components/shared/ProfileDeadlineGuard";
import { PasswordChangeGuard } from "@/components/shared/PasswordChangeGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth pages - standalone */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/alterar-senha" element={<ChangePasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            {/* Public profile page - standalone (no layout) */}
            <Route path="/u/:codigo" element={<PublicProfilePage />} />
            <Route path="/ponto/:slug" element={<CollectionPointPage />} />
            
            {/* Public pages with PublicLayout (header + footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/planos" element={<LandingCompra />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/transparencia" element={<TransparenciaPage />} />
              <Route path="/contato" element={<ContatoPage />} />
              <Route path="/economia-circular" element={<EconomiaCircularPage />} />
              <Route path="/termos" element={<TermosPage />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidadePage />} />
              <Route path="/politica-de-riscos" element={<PoliticaRiscosPage />} />
              <Route path="/natureza-do-pro" element={<NaturezaProPage />} />
              <Route path="/painel-publico" element={<PublicTransparencyDashboard />} />
              <Route path="/painel-publico/fila" element={<PublicFilaPage />} />
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import CollectionPointPage from "./pages/CollectionPointPage";

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
            <Route path="/alterar-senha" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />
            
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
            </Route>
            
            {/* Protected pages with AppLayout (logged-in header) */}
            <Route element={<AppLayout />}>
              
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
              
              <Route path="/dreams" element={
                <ProtectedRoute clientOnly>
                  <PasswordChangeGuard>
                    <ProfileDeadlineGuard>
                      <DreamsPage />
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

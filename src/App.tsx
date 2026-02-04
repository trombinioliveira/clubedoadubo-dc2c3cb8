import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AppLayout } from "@/components/layout";
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

// Feature Pages
import { AdminDashboard } from "@/features/admin";
import { FifoQueuePage } from "@/features/fifo";
import { ReferralsPage } from "@/features/referrals";
import { ProfileDeadlineGuard } from "@/components/shared/ProfileDeadlineGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/planos" element={<LandingCompra />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/transparencia" element={<TransparenciaPage />} />
            <Route path="/contato" element={<ContatoPage />} />
            
            <Route element={<AppLayout />}>
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProfileDeadlineGuard>
                    <DashboardPage />
                  </ProfileDeadlineGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/dreams" element={
                <ProtectedRoute>
                  <ProfileDeadlineGuard>
                    <DreamsPage />
                  </ProfileDeadlineGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/fifo" element={
                <ProtectedRoute>
                  <ProfileDeadlineGuard>
                    <FifoQueuePage />
                  </ProfileDeadlineGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/indicacoes" element={
                <ProtectedRoute>
                  <ProfileDeadlineGuard>
                    <ReferralsPage />
                  </ProfileDeadlineGuard>
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

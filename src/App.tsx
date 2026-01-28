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
import NotFound from "./pages/NotFound";

// Feature Pages
import { AdminDashboard } from "@/features/admin";
import { FifoQueuePage } from "@/features/fifo";
import { ReferralsPage } from "@/features/referrals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/dreams" element={
                <ProtectedRoute>
                  <DreamsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/fifo" element={
                <ProtectedRoute>
                  <FifoQueuePage />
                </ProtectedRoute>
              } />
              
              <Route path="/indicacoes" element={
                <ProtectedRoute>
                  <ReferralsPage />
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

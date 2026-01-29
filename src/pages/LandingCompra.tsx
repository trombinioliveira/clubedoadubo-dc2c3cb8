import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { PricingSection } from '@/components/PricingSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Leaf } from 'lucide-react';

const LandingCompra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg earth-gradient flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Clube do Adubo</span>
              </div>
            </div>
            <Button onClick={handleGetStarted} variant="default">
              {user ? 'Ir para Dashboard' : 'Entrar'}
            </Button>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <PricingSection onGetStarted={handleGetStarted} />

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg earth-gradient flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Clube do Adubo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Clube do Adubo. Economia Circular Urbana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingCompra;

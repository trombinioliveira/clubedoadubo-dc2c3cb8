import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { PricingSection } from '@/components/PricingSection';

const LandingCompra = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/jornada');
    } else {
      navigate('/auth');
    }
  };

  return <PricingSection onGetStarted={handleGetStarted} />;
};

export default LandingCompra;

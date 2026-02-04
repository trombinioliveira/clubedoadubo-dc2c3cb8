import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { PricingSection } from '@/components/PricingSection';

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

  return <PricingSection onGetStarted={handleGetStarted} />;
};

export default LandingCompra;

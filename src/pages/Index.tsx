import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
};

export default Index;

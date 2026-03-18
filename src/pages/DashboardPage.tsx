import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Dashboard foi redistribuído para /jornada.
// Esta rota redireciona automaticamente.
const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/jornada', { replace: true });
  }, [navigate]);

  return null;
};

export default DashboardPage;

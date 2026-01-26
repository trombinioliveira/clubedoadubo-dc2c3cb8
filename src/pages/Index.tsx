import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';

type View = 'landing' | 'dashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView}
        onNavigate={setCurrentView}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      
      {currentView === 'landing' ? (
        <LandingPage onGetStarted={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default Index;

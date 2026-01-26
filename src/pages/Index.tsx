import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { DreamsPage } from '@/components/DreamsPage';

type View = 'landing' | 'dashboard' | 'dreams';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [menuOpen, setMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentView('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'dreams':
        return <DreamsPage />;
      default:
        return <LandingPage onGetStarted={() => setCurrentView('dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView}
        onNavigate={setCurrentView}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      
      {renderView()}
    </div>
  );
};

export default Index;

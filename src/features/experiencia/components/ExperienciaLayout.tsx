import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedbackModal } from './FeedbackModal';

export const ExperienciaLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/experiencia', label: 'Início', end: true },
    { to: '/experiencia/ciclo', label: 'O ciclo', end: false },
    { to: '/experiencia/transparencia', label: 'Transparência', end: false },
    { to: '/experiencia/participar', label: 'Participar', end: false },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      {/* Nav bar */}
      <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: 'rgba(250,250,247,0.9)', borderColor: '#e8e5de', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/experiencia')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4a7c3f' }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>Clube do Adubo</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    isActive
                      ? 'font-medium'
                      : 'hover:bg-black/5'
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? '#4a7c3f' : '#6b6b6b',
                  backgroundColor: isActive ? '#4a7c3f14' : undefined,
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hover:bg-black/5 transition-colors" style={{ color: '#6b6b6b' }}>
              <User className="w-4 h-4" />
              <span>Minha conta</span>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: '#e8e5de', backgroundColor: '#FAFAF7' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive ? 'font-medium' : 'hover:bg-black/5'
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? '#4a7c3f' : '#4a4a4a',
                  backgroundColor: isActive ? '#4a7c3f0a' : undefined,
                })}
              >
                {item.label}
              </NavLink>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm w-full hover:bg-black/5" style={{ color: '#4a4a4a' }}>
              <User className="w-4 h-4" />
              Minha conta
            </button>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <Outlet />
      </main>

      {/* Floating feedback button */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        style={{ backgroundColor: '#4a7c3f' }}
      >
        <MessageCircle className="w-4 h-4" />
        O que achou desta página?
      </button>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Search, Recycle } from 'lucide-react';

const cards = [
  {
    emoji: <Leaf className="w-6 h-6" style={{ color: '#4a7c3f' }} />,
    title: 'Entender o ciclo',
    text: 'Veja como o processo funciona do início ao fim',
    button: 'Ver o ciclo',
    to: '/experiencia/ciclo',
  },
  {
    emoji: <Search className="w-6 h-6" style={{ color: '#4a7c3f' }} />,
    title: 'Ver a transparência',
    text: 'Acompanhe o que já está acontecendo',
    button: 'Ver dados',
    to: '/experiencia/transparencia',
  },
  {
    emoji: <Recycle className="w-6 h-6" style={{ color: '#4a7c3f' }} />,
    title: 'Simular participação',
    text: 'Entenda como seria participar na prática',
    button: 'Simular',
    to: '/experiencia/participar',
  },
];

const ExpHomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#2d2d2d' }}>
          Você já está dentro
        </h1>
        <div className="space-y-3 max-w-2xl">
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            Essa é a primeira rodada real do Clube do Adubo.
          </p>
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            Você pode explorar no seu ritmo. Não existe um caminho obrigatório — a ideia é entender como essa experiência faz sentido para você.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold" style={{ color: '#2d2d2d' }}>
          Por onde começar
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border p-6 space-y-4 hover:shadow-md transition-shadow"
              style={{ backgroundColor: 'white', borderColor: '#e8e5de' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#4a7c3f12' }}>
                {card.emoji}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{card.title}</h3>
                <p className="text-sm" style={{ color: '#6b6b6b' }}>{card.text}</p>
              </div>
              <button
                onClick={() => navigate(card.to)}
                className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                style={{ color: '#4a7c3f', backgroundColor: '#4a7c3f10' }}
              >
                {card.button}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExpHomePage;

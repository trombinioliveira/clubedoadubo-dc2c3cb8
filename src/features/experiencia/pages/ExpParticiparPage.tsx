import React from 'react';
import { Eye, Sprout, Package } from 'lucide-react';

const options = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Acompanhar',
    description: 'Entrar no projeto e observar como o ciclo evolui',
  },
  {
    icon: <Sprout className="w-6 h-6" />,
    title: 'Contribuir com resíduos',
    description: 'Participar enviando matéria orgânica',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Receber adubo',
    description: 'Fechar o ciclo participando do retorno',
  },
];

const ExpParticiparPage = () => {
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#2d2d2d' }}>
          Como você poderia participar
        </h1>
        <p className="text-base leading-relaxed max-w-2xl" style={{ color: '#5a5a5a' }}>
          Mesmo nesta fase inicial, já é possível entender como a participação acontece.
        </p>
      </section>

      {/* Options */}
      <section className="grid sm:grid-cols-3 gap-4">
        {options.map((opt) => (
          <div
            key={opt.title}
            className="rounded-2xl border p-6 space-y-4 text-center hover:shadow-md transition-shadow"
            style={{ backgroundColor: 'white', borderColor: '#e8e5de' }}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
              style={{ backgroundColor: '#4a7c3f12', color: '#4a7c3f' }}
            >
              {opt.icon}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{opt.title}</h3>
              <p className="text-sm" style={{ color: '#6b6b6b' }}>{opt.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Note */}
      <section
        className="rounded-2xl border p-5 text-center"
        style={{ backgroundColor: '#f5f3ee', borderColor: '#e8e5de' }}
      >
        <p className="text-sm" style={{ color: '#6b6b6b' }}>
          Essas opções ainda estão sendo estruturadas e podem evoluir.
        </p>
      </section>
    </div>
  );
};

export default ExpParticiparPage;

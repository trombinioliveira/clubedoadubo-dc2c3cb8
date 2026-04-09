import React from 'react';
import { Scale, Leaf, Users, Activity } from 'lucide-react';

const metrics = [
  { icon: <Scale className="w-5 h-5" />, label: 'Resíduos processados', value: '120 kg', note: 'Acumulado' },
  { icon: <Leaf className="w-5 h-5" />, label: 'Adubo gerado', value: '40 kg', note: 'Acumulado' },
  { icon: <Users className="w-5 h-5" />, label: 'Participantes', value: '12', note: 'Pessoas' },
  { icon: <Activity className="w-5 h-5" />, label: 'Status do projeto', value: 'Primeira rodada', note: 'Em andamento' },
];

const ExpTransparenciaPage = () => {
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#2d2d2d' }}>
          O que já está acontecendo
        </h1>
        <div className="space-y-3 max-w-2xl">
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            Essa área mostra, de forma direta, o estado atual do projeto.
          </p>
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            Como estamos em fase inicial, os dados ainda são simples — mas a ideia é evoluir isso com o tempo.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid sm:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border p-5 space-y-3 hover:shadow-sm transition-shadow"
            style={{ backgroundColor: 'white', borderColor: '#e8e5de' }}
          >
            <div className="flex items-center gap-2" style={{ color: '#4a7c3f' }}>
              {m.icon}
              <span className="text-sm font-medium" style={{ color: '#4a4a4a' }}>{m.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: '#2d2d2d' }}>{m.value}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#4a7c3f15', color: '#4a7c3f' }}>
                {m.note}
              </span>
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
          Esses dados ainda estão em evolução, pois o projeto está em fase inicial.
        </p>
      </section>
    </div>
  );
};

export default ExpTransparenciaPage;

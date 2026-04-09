import React from 'react';
import { ArrowDown } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Entrada de resíduos',
    text: 'Pessoas e locais geram resíduos orgânicos que são coletados e direcionados.',
  },
  {
    number: '2',
    title: 'Processo de transformação',
    text: 'Esses resíduos são coletados e passam por um processo de transformação controlado.',
  },
  {
    number: '3',
    title: 'Geração de adubo',
    text: 'O resultado é adubo — registrado, pesado e rastreável no sistema.',
  },
  {
    number: '4',
    title: 'Retorno ao ciclo',
    text: 'O adubo retorna para o território, e o ciclo recomeça de forma contínua e rastreável.',
  },
];

const ExpCicloPage = () => {
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#2d2d2d' }}>
          Como o ciclo funciona na prática
        </h1>
        <div className="space-y-3 max-w-2xl">
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            O Clube do Adubo organiza um fluxo simples:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            <li>Pessoas e locais geram resíduos orgânicos</li>
            <li>Esses resíduos são coletados e direcionados</li>
            <li>O material passa por um processo de transformação</li>
            <li>O resultado é adubo, que retorna para o território</li>
          </ol>
          <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
            A ideia é criar um ciclo contínuo e rastreável.
          </p>
        </div>
      </section>

      {/* Visual flow */}
      <section className="space-y-1 max-w-lg mx-auto">
        {steps.map((step, i) => (
          <React.Fragment key={step.number}>
            <div
              className="rounded-2xl border p-5 flex gap-4 items-start hover:shadow-sm transition-shadow"
              style={{ backgroundColor: 'white', borderColor: '#e8e5de' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                style={{ backgroundColor: '#4a7c3f' }}
              >
                {step.number}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: '#6b6b6b' }}>{step.text}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="w-4 h-4" style={{ color: '#c5c0b6' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </section>

      {/* Feedback prompt */}
      <section
        className="rounded-2xl border p-6 text-center space-y-2 max-w-lg mx-auto"
        style={{ backgroundColor: '#4a7c3f08', borderColor: '#4a7c3f20' }}
      >
        <p className="text-base font-medium" style={{ color: '#2d2d2d' }}>
          Isso fez sentido para você?
        </p>
        <p className="text-sm" style={{ color: '#6b6b6b' }}>
          Use o botão de feedback para compartilhar sua percepção.
        </p>
      </section>
    </div>
  );
};

export default ExpCicloPage;

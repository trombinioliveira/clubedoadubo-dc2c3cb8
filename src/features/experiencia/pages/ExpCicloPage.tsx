import React from 'react';
import { ArrowDown } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Entrada de resíduos',
    text: 'Resíduos orgânicos são coletados e pesados em pontos definidos.',
  },
  {
    number: '2',
    title: 'Processo de transformação',
    text: 'O material passa por compostagem ou vermicompostagem até se tornar adubo.',
  },
  {
    number: '3',
    title: 'Geração de adubo',
    text: 'O adubo é embalado, pesado e registrado no sistema com rastreabilidade.',
  },
  {
    number: '4',
    title: 'Retorno ao ciclo',
    text: 'Cada venda distribui valor e inicia um novo ciclo de transformação.',
  },
];

const ExpCicloPage = () => {
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#2d2d2d' }}>
          Como o ciclo funciona
        </h1>
        <p className="text-base leading-relaxed max-w-2xl" style={{ color: '#5a5a5a' }}>
          De forma simples, o projeto organiza um fluxo contínuo: resíduos entram, são transformados e retornam como adubo.
        </p>
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Leaf, Sprout, TreePine, Recycle, Users, Eye, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConvitePage = () => {
  const navigate = useNavigate();

  const handleParticipar = () => {
    navigate('/auth');
  };

  const scrollToAbout = () => {
    document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Convite — Primeira rodada real | Clube do Adubo</title>
        <meta name="description" content="Convite para participar da primeira rodada real do Clube do Adubo. Conheça a experiência por dentro e ajude a fortalecer esse ciclo desde o começo." />
      </Helmet>

      <div className="min-h-screen bg-[#FAFAF7]">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f0f5ed] to-[#FAFAF7]" />
          <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f0e4] text-[#4a7c3f] text-sm font-medium mb-8">
              <Sprout className="w-4 h-4" />
              <span>Rodada inicial</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-[#2d3a2e] leading-tight tracking-tight mb-6">
              Primeira rodada real do Clube do Adubo
            </h1>

            <p className="text-lg md:text-xl text-[#5a6b5c] leading-relaxed mb-4">
              Um convite para conhecer por dentro, participar na prática e ajudar a construir esse ciclo desde o começo.
            </p>

            <p className="text-base text-[#6b7c6d] leading-relaxed max-w-2xl mx-auto mb-10">
              Antes de avançarmos para a próxima etapa, estamos abrindo uma rodada com pessoas reais para acompanhar como tudo funciona na prática. Mais do que testar, essa é uma oportunidade de participar desde o início de algo que ainda está sendo construído.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleParticipar}
                className="bg-[#4a7c3f] hover:bg-[#3d6834] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#4a7c3f]/20 transition-all hover:shadow-xl hover:shadow-[#4a7c3f]/30"
              >
                Quero participar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={scrollToAbout}
                className="text-[#4a7c3f] hover:text-[#3d6834] font-medium text-base underline underline-offset-4 decoration-[#4a7c3f]/30 hover:decoration-[#4a7c3f]/60 transition-colors"
              >
                Entender como funciona
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="sobre" className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0e4] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#4a7c3f]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">O que é o Clube do Adubo</h2>
          </div>
          <div className="space-y-4 text-[#5a6b5c] text-base leading-relaxed">
            <p>
              O Clube do Adubo é uma forma prática de transformar resíduos orgânicos em adubo — sem que você precise separar nada na sua casa.
            </p>
            <p>
              Os resíduos vêm de estabelecimentos comerciais e feiras, entrando em um sistema organizado de transformação.
            </p>
            <p>Funciona como um ciclo:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>resíduos entram</li>
              <li>são transformados</li>
              <li>viram adubo</li>
              <li>o adubo retorna para o solo</li>
            </ol>
            <p>
              A proposta é permitir que você participe desse ciclo sem esforço operacional.
            </p>
            <p>
              Você não precisa mudar sua rotina, armazenar resíduos ou fazer qualquer tipo de separação.
            </p>
            <p>
              Em vez disso, você acompanha o processo e participa de um sistema que busca gerar valor a partir dessa transformação.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* What it means to participate */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fef3e2] flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#b8860b]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">O que significa participar</h2>
          </div>
          <p className="text-[#5a6b5c] text-base leading-relaxed mb-6">
            Ao entrar, você poderá:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              'entender como o sistema funciona na prática',
              'acompanhar o ciclo de transformação',
              'acessar uma área de transparência',
              'simular ou realizar uma participação real',
              'compartilhar sua percepção ao final',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#5a6b5c]">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#b8860b] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[#5a6b5c] text-base leading-relaxed">
            Você não precisa saber nada antes. A ideia é justamente descobrir usando.
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* Value and return */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0e4] flex items-center justify-center">
              <Sprout className="w-5 h-5 text-[#4a7c3f]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">Sobre valor e retorno</h2>
          </div>
          <div className="space-y-4 text-[#5a6b5c] text-base leading-relaxed">
            <p>O sistema foi pensado para que a transformação de resíduos gere valor ao longo do tempo.</p>
            <p>Isso abre espaço para que participantes possam se beneficiar desse ciclo de forma passiva, sem precisar operar nada no dia a dia.</p>
            <p>O modelo ainda está em construção, e essa rodada também serve para entender como essa dinâmica deve evoluir.</p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* Why this round */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fef3e2] flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#b8860b]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">Por que estamos abrindo essa rodada</h2>
          </div>
          <p className="text-[#5a6b5c] text-base leading-relaxed mb-6">
            Porque queremos construir isso com base em experiência real — não apenas em planejamento.
          </p>
          <p className="text-[#5a6b5c] text-base leading-relaxed mb-4">
            Queremos entender, com pessoas reais:
          </p>
          <ul className="space-y-3">
            {[
              'o que está claro',
              'o que ainda gera dúvida',
              'o que transmite confiança',
              'o que precisa melhorar',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#5a6b5c]">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#b8860b] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* Experience */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0e4] flex items-center justify-center">
              <Recycle className="w-5 h-5 text-[#4a7c3f]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">O que você vai encontrar ao participar</h2>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              'um ambiente simples para explorar',
              'explicações ao longo do caminho',
              'a possibilidade de interagir com o sistema',
              'espaço para deixar feedback direto',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#5a6b5c]">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#4a7c3f] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-[#8a9a8c] italic border-l-2 border-[#d4ddd2] pl-4">
            Não existe um "jeito certo" de participar. O mais importante é usar com curiosidade e compartilhar sua percepção real.
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* Impact */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fef3e2] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#b8860b]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">O que sua participação ajuda a construir</h2>
          </div>
          <ul className="space-y-3">
            {[
              'clareza da proposta',
              'confiança no sistema',
              'facilidade de uso',
              'entendimento do ciclo',
              'vontade real de participar',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#5a6b5c]">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#b8860b] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* Who is this for */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0e4] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#4a7c3f]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">Quem deve participar</h2>
          </div>
          <ul className="space-y-3">
            {[
              'pessoas interessadas em meio ambiente e resíduos',
              'curiosos sobre soluções práticas',
              'quem valoriza transparência',
              'quem gosta de acompanhar projetos desde o início',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#5a6b5c]">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#4a7c3f] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="max-w-3xl mx-auto px-6"><hr className="border-[#e5e8e3]" /></div>

        {/* Project stage */}
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fef3e2] flex items-center justify-center">
              <TreePine className="w-5 h-5 text-[#b8860b]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e]">Sobre o momento do projeto</h2>
          </div>
          <div className="space-y-4 text-[#5a6b5c] text-base leading-relaxed">
            <p>O Clube do Adubo ainda está em fase inicial.</p>
            <p>
              Isso significa que algumas partes ainda estão sendo ajustadas, e sua experiência pode influenciar diretamente os próximos passos.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-t from-[#e8f0e4] to-[#FAFAF7]">
          <div className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
            <h3 className="text-lg text-[#5a6b5c] font-medium mb-2">Convite</h3>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2e] mb-4">
              Se fizer sentido para você, essa é uma boa hora para entrar.
            </h2>
            <p className="text-[#5a6b5c] text-base leading-relaxed max-w-xl mx-auto mb-10">
              Sem pressão, sem obrigação — apenas a oportunidade de conhecer, participar e contribuir com algo que ainda está ganhando forma.
            </p>
            <Button
              onClick={handleParticipar}
              className="bg-[#4a7c3f] hover:bg-[#3d6834] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#4a7c3f]/20 transition-all hover:shadow-xl hover:shadow-[#4a7c3f]/30"
            >
              Entrar na rodada inicial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default ConvitePage;

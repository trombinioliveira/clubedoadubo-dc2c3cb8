import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const [clarity, setClarity] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [wouldContinue, setWouldContinue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log({ clarity, comment, wouldContinue, page: window.location.pathname });
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setClarity(null);
      setComment('');
      setWouldContinue(null);
      setSubmitted(false);
    }, 300);
  };

  if (!open) return null;

  const clarityOptions = [
    { value: 'clear', label: 'Sim, ficou claro' },
    { value: 'partial', label: 'Mais ou menos' },
    { value: 'unclear', label: 'Não entendi' },
  ];

  const continueOptions = [
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Não' },
    { value: 'unsure', label: 'Não tenho certeza' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: '#FAFAF7' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 transition-colors" style={{ color: '#999' }}>
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: '#4a7c3f20' }}>
              <Check className="w-6 h-6" style={{ color: '#4a7c3f' }} />
            </div>
            <p className="text-lg font-medium" style={{ color: '#2d2d2d' }}>
              Obrigado — isso ajuda a melhorar o projeto.
            </p>
            <button onClick={handleClose} className="text-sm underline" style={{ color: '#6b6b6b' }}>
              Fechar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold" style={{ color: '#2d2d2d' }}>
              Isso fez sentido para você?
            </h3>

            {/* Q1 */}
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: '#4a4a4a' }}>
                Essa página fez sentido para você?
              </p>
              <div className="flex flex-wrap gap-2">
                {clarityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setClarity(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      clarity === opt.value ? 'border-transparent text-white' : 'hover:border-gray-300'
                    )}
                    style={{
                      backgroundColor: clarity === opt.value ? '#4a7c3f' : 'transparent',
                      borderColor: clarity === opt.value ? '#4a7c3f' : '#ddd',
                      color: clarity === opt.value ? 'white' : '#4a4a4a',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: '#4a4a4a' }}>
                O que você percebeu aqui?
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 transition-shadow"
                style={{
                  borderColor: '#ddd',
                  backgroundColor: 'white',
                  color: '#2d2d2d',
                }}
                placeholder="Algo que gostou, não entendeu, ou mudaria..."
              />
            </div>

            {/* Q3 */}
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: '#4a4a4a' }}>
                Você continuaria a partir daqui?
              </p>
              <div className="flex flex-wrap gap-2">
                {continueOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setWouldContinue(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      wouldContinue === opt.value ? 'border-transparent text-white' : 'hover:border-gray-300'
                    )}
                    style={{
                      backgroundColor: wouldContinue === opt.value ? '#4a7c3f' : 'transparent',
                      borderColor: wouldContinue === opt.value ? '#4a7c3f' : '#ddd',
                      color: wouldContinue === opt.value ? 'white' : '#4a4a4a',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!clarity}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: '#4a7c3f' }}
            >
              Enviar percepção
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

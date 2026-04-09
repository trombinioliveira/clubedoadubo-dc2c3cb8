import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Rating = 'claro' | 'mais_ou_menos' | 'confuso';

const ratings: { value: Rating; emoji: string; label: string }[] = [
  { value: 'claro', emoji: '👍', label: 'Claro' },
  { value: 'mais_ou_menos', emoji: '😐', label: 'Mais ou menos' },
  { value: 'confuso', emoji: '👎', label: 'Confuso' },
];

export function FloatingFeedback() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!rating) return;
    setSending(true);
    try {
      const { error } = await supabase.from('feedbacks' as any).insert({
        page_url: location.pathname,
        rating,
        comment: comment.trim() || null,
        user_id: user?.id || null,
      } as any);
      if (error) throw error;
      toast.success('Obrigado — isso ajuda a melhorar o sistema.');
      setOpen(false);
      setRating(null);
      setComment('');
    } catch {
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        aria-label="Enviar feedback"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">O que você achou dessa página?</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Como foi sua experiência? *</p>
              <div className="flex gap-3">
                {ratings.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRating(r.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                      rating === r.value
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-xs font-medium text-muted-foreground">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Se quiser, conte mais:</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva aqui..."
                maxLength={1000}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!rating || sending}
              className="w-full"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

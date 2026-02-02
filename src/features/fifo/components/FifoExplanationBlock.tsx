import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpTooltip } from '@/components/shared';
import { ListOrdered, Shield, Zap } from 'lucide-react';

export function FifoExplanationBlock() {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4 text-center">
        Por que a Fila FIFO é justa?
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
              <ListOrdered className="w-5 h-5" />
              Ordem cronológica
              <HelpTooltip content="Quem ativa o PRO primeiro, entra primeiro na fila." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-emerald-900/80">
            <p>
              A posição na fila é definida pelo momento exato em que o PRO foi ativado.
              Sem exceções.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-800">
              <Shield className="w-5 h-5" />
              Nada fura a fila
              <HelpTooltip content="Não existe atalho, privilégio ou forma de acelerar sua posição." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900/80">
            <p>
              Indicações criam ondas de impacto, mas nunca alteram a ordem da fila.
              Justiça é inegociável.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <Zap className="w-5 h-5" />
              Move com impacto real
              <HelpTooltip content="A fila só avança quando o adubo é vendido e o ciclo se completa." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-900/80">
            <p>
              Cada venda gera o <strong>Real do Ciclo</strong>, que vai para o primeiro da fila.
              Sem promessas, só consequência.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

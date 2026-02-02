import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpTooltip } from '@/components/shared';
import { DollarSign, ArrowDown, Leaf, ShoppingBag, Coins } from 'lucide-react';

export function RealDoCicloBlock() {
  return (
    <div className="mb-10">
      <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl flex items-center justify-center gap-2 text-amber-800">
            <Coins className="w-6 h-6" />
            Como o Dinheiro Entra no Sistema
            <HelpTooltip content="O dinheiro vem exclusivamente da venda real de adubo, nunca da entrada de novas pessoas." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key message */}
          <div className="text-center p-4 bg-white/60 rounded-xl border border-amber-200">
            <p className="text-lg font-bold text-amber-900">
              O dinheiro NÃO entra com novas pessoas.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              O dinheiro entra quando o adubo é vendido.
            </p>
          </div>

          {/* Flow visualization */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-100 rounded-xl w-full max-w-sm">
              <Leaf className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">1. Resíduo vira Adubo</p>
                <p className="text-xs text-emerald-700">Compostagem natural, tempo real</p>
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-amber-500" />

            <div className="flex items-center gap-3 p-3 bg-purple-100 rounded-xl w-full max-w-sm">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-800">2. Adubo é Vendido</p>
                <p className="text-xs text-purple-700">Compra real, cliente real</p>
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-amber-500" />

            <div className="flex items-center gap-3 p-3 bg-amber-100 rounded-xl w-full max-w-sm">
              <DollarSign className="w-8 h-8 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">3. Real do Ciclo é Gerado</p>
                <p className="text-xs text-amber-700">R$ 1,00 vai para o Fundo de Retorno Circular</p>
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-amber-500" />

            <div className="flex items-center gap-3 p-3 bg-emerald-200 rounded-xl w-full max-w-sm border-2 border-emerald-400">
              <Coins className="w-8 h-8 text-emerald-700" />
              <div>
                <p className="font-semibold text-emerald-900">4. Primeiro da Fila Recebe</p>
                <p className="text-xs text-emerald-800">R$ 2,00 por PRO completo</p>
              </div>
            </div>
          </div>

          {/* Terminology box */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-white/80 rounded-xl border border-amber-200">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Nome institucional
              </p>
              <p className="font-bold text-amber-800">Fundo de Retorno Circular</p>
              <p className="text-xs text-amber-700 mt-1">
                Usado em documentos e termos
              </p>
            </div>
            <div className="p-4 bg-white/80 rounded-xl border border-amber-200">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Nome para o usuário
              </p>
              <p className="font-bold text-amber-800">Real do Ciclo</p>
              <p className="text-xs text-amber-700 mt-1">
                Fácil de entender e lembrar
              </p>
            </div>
          </div>

          {/* Fixed phrase */}
          <div className="text-center p-4 bg-gradient-to-r from-emerald-100 to-amber-100 rounded-xl border border-emerald-300">
            <p className="text-emerald-800 font-semibold">
              "O Real do Ciclo move a fila."
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              O dinheiro vem da venda, não de novas pessoas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

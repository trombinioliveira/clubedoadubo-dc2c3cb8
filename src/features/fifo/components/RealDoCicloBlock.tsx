import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpTooltip } from '@/components/shared';
import { DollarSign, ArrowDown, Leaf, ShoppingBag, Coins } from 'lucide-react';

export function RealDoCicloBlock() {
  return (
    <div className="mb-10">
      <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-center gap-2 text-amber-800">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
            Como o dinheiro entra no sistema
            <HelpTooltip content="O dinheiro vem exclusivamente da venda real de adubo, nunca da entrada de novas pessoas." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Key message */}
          <div className="text-center p-3 sm:p-4 bg-white/60 rounded-xl border border-amber-200">
            <p className="text-sm sm:text-base font-bold text-amber-900">
              O dinheiro não entra com novas pessoas.
            </p>
            <p className="text-xs sm:text-sm text-amber-700 mt-1">
              O dinheiro entra quando o adubo é vendido.
            </p>
          </div>

          {/* Etapas do ciclo */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-100 rounded-xl w-full max-w-sm">
              <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm sm:text-base">1️⃣ Resíduo vira adubo</p>
                <p className="text-xs text-emerald-700">Compostagem natural, em tempo real</p>
              </div>
            </div>

            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />

            <div className="flex items-center gap-3 p-3 bg-purple-100 rounded-xl w-full max-w-sm">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-800 text-sm sm:text-base">2️⃣ Adubo é vendido</p>
                <p className="text-xs text-purple-700">Compra real. Cliente real.</p>
              </div>
            </div>

            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />

            <div className="flex items-center gap-3 p-3 bg-amber-100 rounded-xl w-full max-w-sm">
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 text-sm sm:text-base">3️⃣ A fila avança</p>
                <p className="text-xs text-amber-700">A cada venda, R$ 1,00 acelera o avanço da fila FIFO</p>
              </div>
            </div>

            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />

            <div className="flex items-center gap-3 p-3 bg-emerald-200 rounded-xl w-full max-w-sm border-2 border-emerald-400">
              <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-900 text-sm sm:text-base">4️⃣ Quem está na vez recebe</p>
                <p className="text-xs text-emerald-800">A cada venda, R$ 2,00 são pagos ao PRO ativo</p>
              </div>
            </div>
          </div>

          {/* Fixed phrase - Frase-selo */}
          <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-emerald-100 to-amber-100 rounded-xl border border-emerald-300">
            <p className="text-xs sm:text-sm text-emerald-700">
              O dinheiro vem da venda, não de novas pessoas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

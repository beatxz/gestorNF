import { TrendingUp, Percent } from "lucide-react"
import { formatarMoeda } from "../utils/format.js"
import { Spinner } from "./ui/Feedback.jsx"

/**
 * Cartões financeiros do vendedor: valor vendido no mês e comissão do mês.
 */
export default function FinanceCards({ valorMensal, valorComissao, carregando }) {
  const cards = [
    {
      titulo: "Vendas no mês",
      valor: valorMensal,
      icon: TrendingUp,
      cor: "text-accent",
      bg: "bg-accent/10",
    },
    {
      titulo: "Comissão do mês",
      valor: valorComissao,
      icon: Percent,
      cor: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((c) => (
        <div key={c.titulo} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.cor}`}>
              <c.icon size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{c.titulo}</span>
          </div>
          <div className="mt-4 text-2xl font-bold text-foreground">
            {carregando ? <Spinner size={22} /> : formatarMoeda(c.valor)}
          </div>
        </div>
      ))}
    </div>
  )
}

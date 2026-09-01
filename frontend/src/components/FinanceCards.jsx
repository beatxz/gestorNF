import { TrendingUp, Percent, CircleDollarSign } from "lucide-react"
import { formatarMoeda } from "../utils/format.js"
import { Spinner } from "./ui/Feedback.jsx"

/**
 * Cartões financeiros do vendedor:
 * vendas do mês, comissão do vendedor e comissão do usuário.
 */
export default function FinanceCards({
                                       valorMensal,
                                       valorComissao,
                                       valorComissaoUsuario,
                                       percentualVendedor,
                                       percentualUsuario,
                                       carregando,
                                     }) {
  const cards = [
    {
      titulo: "Vendas no mês",
      valor: valorMensal,
      detalhe: null,
      icon: TrendingUp,
      cor: "text-accent",
      bg: "bg-accent/10",
    },
    {
      titulo: "Comissão do vendedor",
      valor: valorComissao,
      detalhe:
          percentualVendedor != null
              ? `${percentualVendedor}%`
              : null,
      icon: Percent,
      cor: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
    },
    {
      titulo: "Sua comissão",
      valor: valorComissaoUsuario,
      detalhe:
          percentualUsuario != null
              ? `${percentualUsuario}%`
              : null,
      icon: CircleDollarSign,
      cor: "text-accent",
      bg: "bg-accent/10",
    },
  ]

  return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
            <div
                key={c.titulo}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.cor}`}
                >
                  <c.icon size={20} />
                </div>

                <span className="text-sm font-medium text-muted-foreground">
              {c.titulo}
            </span>
              </div>

              <div className="mt-4 text-2xl font-bold text-foreground">
                {carregando ? (
                    <Spinner size={22} />
                ) : (
                    formatarMoeda(c.valor)
                )}
              </div>

              {!carregando && c.detalhe && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {c.detalhe}
                  </div>
              )}
            </div>
        ))}
      </div>
  )
}
import {
    TrendingUp,
    Percent,
    CircleDollarSign,
} from "lucide-react"

import { formatarMoeda } from "../utils/format.js"
import { Spinner } from "./ui/Feedback.jsx"


export default function FinanceCards({
                                         valorMensal,
                                         valorComissao,
                                         valorComissaoUsuario,
                                         percentualVendedor,
                                         percentualUsuario,
                                         carregando,
                                         tipo = "todos",
                                     }) {

    const cards = [
        {
            titulo: "Vendas no mês",
            valor: valorMensal,
            detalhe: null,
            icon: TrendingUp,
        },
        {
            titulo: "Comissão do vendedor",
            valor: valorComissao,
            detalhe:
                percentualVendedor != null
                    ? `${percentualVendedor}%`
                    : null,
            icon: Percent,
        },
        {
            titulo: "Sua comissão",
            valor: valorComissaoUsuario,
            detalhe:
                percentualUsuario != null
                    ? `${percentualUsuario}%`
                    : null,
            icon: CircleDollarSign,
        },
    ]

    const cardsExibidos =
        tipo === "principal"
            ? cards.slice(0, 2)
            : tipo === "usuario"
                ? cards.slice(2)
                : cards
    return (
        <div className="flex flex-col gap-4">

            {cardsExibidos.map((card) => {

                const Icon =
                    card.icon

                return (
                    <div
                        key={card.titulo}
                        className="flex min-h-28 items-center rounded-xl border border-border bg-card p-5 shadow-sm"
                    >

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">

                                <Icon size={20} />

                            </div>


                            <div className="min-w-0">

                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.titulo}
                                </p>

                                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">

                                    <div className="text-xl font-bold text-foreground">

                                        {carregando ? (
                                            <Spinner size={18} />
                                        ) : (
                                            formatarMoeda(
                                                card.valor,
                                            )
                                        )}

                                    </div>


                                    {!carregando &&
                                        card.detalhe && (

                                            <span className="text-xs font-medium text-muted-foreground">
                                {card.detalhe}
                              </span>

                                        )}

                                </div>

                            </div>

                        </div>

                    </div>
                )
            })}

        </div>
    )
}
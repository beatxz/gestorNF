import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts"

import { formatarMoeda } from "../utils/format.js"


const CORES = [
    "var(--color-accent)",
    "#9b7cff",
    "#72c7c7",
    "#f0b86e",
    "#7ba7ff",
    "#d98bc3",
]


function TooltipVendedor({
                             active,
                             payload,
                         }) {

    if (!active || !payload?.length) {
        return null
    }

    const vendedor =
        payload[0]?.payload

    return (
        <div className="min-w-36 rounded-lg border border-border bg-card px-3 py-2 shadow-lg">

            <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-foreground">
                {vendedor?.nome}
            </span>

                <strong className="text-sm text-foreground">
                    {Number(
                        vendedor?.percentual ?? 0,
                    ).toFixed(0)}%
                </strong>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
                {formatarMoeda(vendedor?.valor)}
            </p>

        </div>
    )
}


export default function VendasPorVendedorChart({
                                                   vendedores = [],
                                               }) {

    const dados =
        vendedores
            .map((vendedor) => ({
                id:
                vendedor.idVendedor,
                nome:
                vendedor.nomeVendedor,
                valor:
                    Number(
                        vendedor.totalVendas ??
                        0,
                    ),
            }))
            .filter(
                (vendedor) =>
                    vendedor.valor > 0,
            )


    const total =
        dados.reduce(
            (soma, vendedor) =>
                soma +
                vendedor.valor,
            0,
        )


    const dadosComPercentual =
        dados.map((vendedor) => ({
            ...vendedor,

            percentual:
                total > 0
                    ? (
                    vendedor.valor /
                    total
                ) * 100
                    : 0,
        }))


    return (
        <div className="w-full max-w-4xl rounded-xl border border-border bg-card p-5 shadow-sm">

            <h3 className="font-semibold text-foreground">
                Vendas por vendedor
            </h3>


            {dadosComPercentual.length === 0 ? (

                <div className="flex min-h-36 items-center justify-center">

                    <p className="text-sm text-muted-foreground">
                        Nenhuma venda registrada neste mês.
                    </p>

                </div>

            ) : (

                <div className="mt-4 flex min-h-52 flex-col items-center gap-8 lg:flex-row lg:justify-start">

                    {/* Donut */}
                    <div className="relative h-48 w-48 shrink-0 overflow-visible">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        dadosComPercentual
                                    }
                                    dataKey="valor"
                                    nameKey="nome"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="61%"
                                    outerRadius="82%"
                                    paddingAngle={3}
                                    stroke="none"
                                >

                                    {dadosComPercentual.map(
                                        (
                                            vendedor,
                                            index,
                                        ) => (

                                            <Cell
                                                key={
                                                    vendedor.id
                                                }
                                                fill={
                                                    CORES[
                                                    index %
                                                    CORES.length
                                                        ]
                                                }
                                            />

                                        ),
                                    )}

                                </Pie>

                                <Tooltip
                                    content={<TooltipVendedor />}
                                    allowEscapeViewBox={{
                                        x: true,
                                        y: true,
                                    }}
                                    wrapperStyle={{
                                        zIndex: 20,
                                        pointerEvents: "none",
                                    }}
                                    offset={18}
                                />

                            </PieChart>

                        </ResponsiveContainer>


                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">

                            <span className="text-[11px] text-muted-foreground">
                                Vendas totais
                            </span>

                            <strong className="mt-1 text-base text-foreground">
                                {formatarMoeda(
                                    total,
                                )}
                            </strong>

                        </div>

                    </div>


                    {/* Vendedores */}
                    <div className="grid w-full max-w-3xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">

                        {dadosComPercentual.map(
                            (
                                vendedor,
                                index,
                            ) => (

                                <div
                                    key={
                                        vendedor.id
                                    }
                                    className="flex min-w-0 items-center justify-between gap-4 rounded-lg px-2 py-1.5"
                                >

                                    <div className="flex min-w-0 items-center gap-2">

                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    CORES[
                                                    index %
                                                    CORES.length
                                                        ],
                                            }}
                                        />

                                        <span className="truncate text-sm text-foreground">
                                            {vendedor.nome}
                                        </span>

                                    </div>


                                    <strong className="shrink-0 text-sm text-foreground">
                                        {vendedor.percentual.toFixed(
                                            0,
                                        )}
                                        %
                                    </strong>

                                </div>

                            ),
                        )}

                    </div>

                </div>
            )}

        </div>
    )
}
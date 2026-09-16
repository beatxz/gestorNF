import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { formatarMoeda } from "../utils/format.js"


function formatarEixo(valor) {
    const numero = Number(valor || 0)

    if (numero >= 1_000_000) {
        return `${(numero / 1_000_000).toFixed(1)}M`
    }

    if (numero >= 1000) {
        return `${Math.round(numero / 1000)}k`
    }

    return numero
}


function TooltipVendas({
                           active,
                           payload,
                           label,
                       }) {
    if (!active || !payload?.length) {
        return null
    }

    const valor = payload[0]?.value ?? 0

    return (
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
            <p className="text-sm font-semibold text-foreground">
                {label}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                Vendas totais
            </p>

            <p className="mt-1 font-semibold text-foreground">
                {formatarMoeda(valor)}
            </p>
        </div>
    )
}


export default function VendasChart({
                                        dados = [],
                                        ano,
                                    }) {
    return (
        <div className="h-full rounded-xl border border-border bg-card p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-foreground">
                    Vendas
                </h3>

                <span className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground">
          {ano}
        </span>
            </div>

            <div className="mt-6 h-72">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={dados}
                        barCategoryGap="25%"
                    >

                        <CartesianGrid
                            vertical={false}
                            stroke="var(--color-border)"
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="nomeMes"
                            tickLine={false}
                            axisLine={false}
                            tick={{
                                fontSize: 12,
                            }}
                        />

                        <YAxis
                            tickFormatter={formatarEixo}
                            tickLine={false}
                            axisLine={false}
                            width={48}
                            tick={{
                                fontSize: 12,
                            }}
                        />

                        <Tooltip
                            content={<TooltipVendas />}
                            cursor={{
                                fill: "var(--color-muted)",
                                opacity: 0.35,
                            }}
                        />

                        <Bar
                            dataKey="valor"
                            fill="var(--color-accent)"
                            radius={[8, 8, 8, 8]}
                            maxBarSize={42}
                        />

                    </BarChart>
                </ResponsiveContainer>

            </div>

        </div>
    )
}
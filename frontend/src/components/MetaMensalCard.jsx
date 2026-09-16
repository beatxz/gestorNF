import {
    useEffect,
    useState,
} from "react"

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
} from "recharts"

import Button from "./ui/Button.jsx"
import { formatarMoeda } from "../utils/format.js"


export default function MetaMensalCard({
                                           dados,
                                           salvando,
                                           onSalvar,
                                       }) {

    const [editando, setEditando] =
        useState(false)

    const [valor, setValor] =
        useState("")


    useEffect(() => {
        if (dados?.meta != null) {
            setValor(String(dados.meta))
        } else {
            setValor("")
        }
    }, [dados])


    const percentual =
        Number(dados?.percentual ?? 0)

    const percentualVisual =
        Math.min(
            Math.max(percentual, 0),
            100,
        )

    const segmentos = 10

    const segmentosAtivos =
        Math.round(
            (percentualVisual / 100) *
            segmentos,
        )

    const dadosGrafico =
        Array.from(
            { length: segmentos },
            (_, index) => ({
                value: 1,
                ativo: index < segmentosAtivos,
            }),
        )


    async function handleSalvar() {

        const numero =
            Number(
                String(valor)
                    .replace(",", "."),
            )

        if (
            !Number.isFinite(numero) ||
            numero <= 0
        ) {
            return
        }

        await onSalvar(numero)

        setEditando(false)
    }


    if (!dados?.meta && !editando) {

        return (
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">

                <h3 className="font-semibold text-foreground">
                    Meta mensal
                </h3>

                <div className="flex flex-1 flex-col items-center justify-center py-10">

                    <p className="max-w-xs text-center text-sm text-muted-foreground">
                        Você ainda não definiu uma meta para este mês.
                    </p>

                    <Button
                        className="mt-5"
                        onClick={() =>
                            setEditando(true)
                        }
                    >
                        Definir meta
                    </Button>

                </div>

            </div>
        )
    }


    if (editando) {

        return (
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">

                <h3 className="font-semibold text-foreground">
                    Meta mensal
                </h3>

                <label className="mt-6 block text-sm text-muted-foreground">
                    Valor da meta
                </label>

                <input
                    value={valor}
                    onChange={(event) =>
                        setValor(event.target.value)
                    }
                    placeholder="60000"
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-accent"
                />

                <div className="mt-4 flex gap-2">

                    <Button
                        loading={salvando}
                        onClick={handleSalvar}
                    >
                        Salvar
                    </Button>

                    <Button
                        variant="outline"
                        disabled={salvando}
                        onClick={() =>
                            setEditando(false)
                        }
                    >
                        Cancelar
                    </Button>

                </div>

            </div>
        )
    }


    return (
        <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">

                <h3 className="font-semibold text-foreground">
                    Meta mensal
                </h3>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        setEditando(true)
                    }
                >
                    Editar
                </Button>

            </div>


            <div className="relative mt-5 h-44">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <PieChart>

                        <Pie
                            data={dadosGrafico}
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            cx="50%"
                            cy="82%"
                            innerRadius="70%"
                            outerRadius="100%"
                            paddingAngle={4}
                            stroke="none"
                        >

                            {dadosGrafico.map(
                                (item, index) => (

                                    <Cell
                                        key={index}
                                        fill={
                                            item.ativo
                                                ? "var(--color-accent)"
                                                : "var(--color-muted)"
                                        }
                                    />

                                ),
                            )}

                        </Pie>

                    </PieChart>

                </ResponsiveContainer>


                <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center">

                    <p className="text-3xl font-bold text-foreground">
                        {percentual.toFixed(0)}%
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        da meta
                    </p>

                </div>

            </div>


            <div className="mt-auto text-center">

                <p className="text-sm text-muted-foreground">
                    Vendas do mês
                </p>

                <p className="mt-1 font-semibold text-foreground">
                    {formatarMoeda(dados.vendas)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    Meta {formatarMoeda(dados.meta)}
                </p>


                <p className="mt-4 text-sm text-muted-foreground">

                    {dados.valorRestante > 0
                        ? `Faltam ${formatarMoeda(dados.valorRestante)}`
                        : "Meta alcançada!"}

                </p>

            </div>

        </div>
    )
}
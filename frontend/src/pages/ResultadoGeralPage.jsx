import { useEffect, useState } from "react"
import {
    ArrowLeft,
    Download,
    TrendingUp,
    Percent,
    CircleDollarSign,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import Button from "../components/ui/Button.jsx"
import MonthPicker from "../components/MonthPicker.jsx"
import { Spinner, EmptyState } from "../components/ui/Feedback.jsx"

import {
    formatarMoeda,
    mesAtual,
} from "../utils/format.js"

import {
    buscarResultadoGeral,
    exportarResultadoGeralPdf,
} from "../services/notaService.js"

import {
    getFriendlyError,
} from "../services/api.js"

import { useToast } from "../hooks/useToast.jsx"

export default function ResultadoGeralPage() {
    const navigate = useNavigate()
    const toast = useToast()

    const [mes, setMes] = useState(mesAtual())
    const [resultado, setResultado] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [exportando, setExportando] = useState(false)

    useEffect(() => {
        async function carregarResultado() {
            setCarregando(true)

            try {
                const dados = await buscarResultadoGeral(mes)
                setResultado(dados)
            } catch (error) {
                toast.erro(
                    getFriendlyError(
                        error,
                        "Não foi possível carregar o resultado geral.",
                    ),
                )

                setResultado(null)
            } finally {
                setCarregando(false)
            }
        }

        carregarResultado()
    }, [mes])
    async function handleExportarPdf() {
        setExportando(true)

        try {
            const pdf = await exportarResultadoGeralPdf(mes)

            const url = window.URL.createObjectURL(
                new Blob([pdf], {
                    type: "application/pdf",
                }),
            )

            const link = document.createElement("a")

            link.href = url
            link.download = `resultado-geral-${mes}.pdf`

            document.body.appendChild(link)

            link.click()

            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.sucesso("PDF exportado com sucesso!")
        } catch (error) {
            toast.erro(
                getFriendlyError(
                    error,
                    "Não foi possível exportar o resultado geral.",
                ),
            )
        } finally {
            setExportando(false)
        }
    }

    const cards = [
        {
            titulo: "Vendas totais",
            valor: resultado?.vendasTotais,
            icon: TrendingUp,
            cor: "text-accent",
            bg: "bg-accent/10",
        },
        {
            titulo: "Comissões dos vendedores",
            valor: resultado?.comissoesVendedores,
            icon: Percent,
            cor: "text-[var(--color-success)]",
            bg: "bg-[var(--color-success)]/10",
        },
        {
            titulo: "Sua comissão",
            valor: resultado?.comissaoUsuario,
            icon: CircleDollarSign,
            cor: "text-accent",
            bg: "bg-accent/10",
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/")}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Voltar"
                            title="Voltar"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <h1 className="text-lg font-semibold text-foreground">
                                Resultado geral
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Visão consolidada de todos os vendedores
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <MonthPicker
                            value={mes}
                            onChange={setMes}
                        />

                        <Button
                            variant="outline"
                            onClick={handleExportarPdf}
                            loading={exportando}
                            disabled={!resultado || carregando}
                        >
                            <Download size={16} />
                            Exportar PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">

                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.titulo}
                            className="rounded-xl border border-border bg-card p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.cor}`}
                                >
                                    <card.icon size={20} />
                                </div>

                                <span className="text-sm font-medium text-muted-foreground">
                  {card.titulo}
                </span>
                            </div>

                            <div className="mt-4 text-2xl font-bold text-foreground">
                                {carregando ? (
                                    <Spinner size={22} />
                                ) : (
                                    formatarMoeda(card.valor)
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabela */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-5 py-4">
                        <h2 className="font-semibold text-foreground">
                            Resultado por vendedor
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Comissão total da empresa:{" "}
                            {resultado?.comissaoTotalEmpresa ?? "-"}%
                        </p>
                    </div>

                    {carregando ? (
                        <div className="flex justify-center py-12">
                            <Spinner size={24} />
                        </div>
                    ) : !resultado?.vendedores?.length ? (
                        <div className="p-6">
                            <EmptyState
                                titulo="Nenhum vendedor encontrado"
                                descricao="Não há resultados para o mês selecionado."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Vendedor
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Vendas
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Comissão dele
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Sua comissão
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {resultado.vendedores.map((vendedor) => (
                                    <tr
                                        key={vendedor.idVendedor}
                                        className="border-b border-border last:border-b-0"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                {vendedor.nomeVendedor}
                                            </div>

                                            <div className="mt-1 text-xs text-muted-foreground">
                                                ID {vendedor.idVendedor}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-foreground">
                                            {formatarMoeda(
                                                vendedor.totalVendas,
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                {formatarMoeda(
                                                    vendedor.comissaoVendedor,
                                                )}
                                            </div>

                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {
                                                    vendedor.percentualComissaoVendedor
                                                }%
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                {formatarMoeda(
                                                    vendedor.comissaoUsuario,
                                                )}
                                            </div>

                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {
                                                    vendedor.percentualComissaoUsuario
                                                }%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import Modal from "../ui/Modal.jsx"
import Button from "../ui/Button.jsx"
import MonthPicker from "../MonthPicker.jsx"
import { exportarRelatorio } from "../../services/notaService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"

export default function ExportarRelatorioModal({
                                                   open,
                                                   onClose,
                                                   vendedores,
                                                   mes,
                                               }) {
    const [mesRelatorio, setMesRelatorio] = useState(mes)
    const [idVendedor, setIdVendedor] = useState("")
    const [exportando, setExportando] = useState(false)

    const toast = useToast()

    useEffect(() => {
        if (open) {
            setMesRelatorio(mes)
            setIdVendedor("")
        }
    }, [open, mes])

    async function handleExportar() {
        setExportando(true)

        try {
            const pdf = await exportarRelatorio(
                mesRelatorio,
                idVendedor || null
            )

            const url = window.URL.createObjectURL(pdf)

            const link = document.createElement("a")

            link.href = url
            link.download = `relatorio-${mesRelatorio}.pdf`

            document.body.appendChild(link)

            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)

            toast.sucesso("Relatório exportado com sucesso!")

            onClose()
        } catch (error) {
            toast.erro(
                getFriendlyError(
                    error,
                    "Não foi possível exportar o relatório."
                )
            )
        } finally {
            setExportando(false)
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Exportar relatório"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-5">

                <div className="flex flex-col gap-1.5">

                    <span className="text-sm font-medium text-foreground">
                        Mês do relatório
                    </span>

                    <MonthPicker
                        value={mesRelatorio}
                        onChange={setMesRelatorio}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="relatorio-vendedor"
                        className="text-sm font-medium text-foreground"
                    >
                        Vendedor
                    </label>

                    <select
                        id="relatorio-vendedor"
                        value={idVendedor}
                        onChange={(e) => setIdVendedor(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    >
                        <option value="">
                            Todos os vendedores
                        </option>

                        {vendedores.map((vendedor) => (
                            <option
                                key={vendedor.id}
                                value={vendedor.id}
                            >
                                {vendedor.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    O relatório incluirá as notas fiscais do mês selecionado.
                </div>

                <Button
                    onClick={handleExportar}
                    loading={exportando}
                    className="self-end"
                >
                    <Download size={16} />
                    Exportar PDF
                </Button>

            </div>
        </Modal>
    )
}
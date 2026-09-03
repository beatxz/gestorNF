import { useEffect, useRef, useState } from "react"
import { CalendarDays } from "lucide-react"

import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"

import { editarNota } from "../../services/notaService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"

export default function EditNotaModal({
                                          open,
                                          onClose,
                                          onSucesso,
                                          nota,
                                          vendedores,
                                      }) {
    const [numero, setNumero] = useState("")
    const [empresa, setEmpresa] = useState("")
    const [codigoCliente, setCodigoCliente] = useState("")
    const [valor, setValor] = useState("")
    const [data, setData] = useState("")
    const [vendedorId, setVendedorId] = useState("")

    const [erros, setErros] = useState({})
    const [salvando, setSalvando] = useState(false)

    const calendarioRef = useRef(null)

    const toast = useToast()

    /*
     * Toda vez que uma nota for aberta para edição,
     * preenche o formulário com os dados que ela já possui.
     */
    useEffect(() => {
        if (!nota) return

        setNumero(String(nota.numeroNotaFiscal ?? ""))
        setEmpresa(nota.nomeEmpresa ?? "")
        setCodigoCliente(nota.codigoCliente ?? "")

        setValor(
            nota.valorNotaFiscal != null
                ? Number(nota.valorNotaFiscal).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
                : "",
        )

        setData(dataBackendParaTela(nota.dataVenda))

        setVendedorId(
            nota.vendedor?.id != null
                ? String(nota.vendedor.id)
                : "",
        )

        setErros({})
    }, [nota])

    function normalizarValor(valorDigitado) {
        if (!valorDigitado) return ""

        return valorDigitado
            .replace(/\./g, "")
            .replace(",", ".")
    }

    /*
     * Backend:
     * 05-08-2026
     *
     * Tela:
     * 05/08/2026
     */
    function dataBackendParaTela(dataBackend) {
        if (!dataBackend) return ""

        if (/^\d{2}-\d{2}-\d{4}$/.test(dataBackend)) {
            return dataBackend.replaceAll("-", "/")
        }

        return dataBackend
    }

    /*
     * Tela:
     * 05/08/2026
     *
     * Backend:
     * 05-08-2026
     */
    function normalizarData(dataDigitada) {
        if (!dataDigitada) return ""

        const valorData = dataDigitada.trim()

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(valorData)) {
            const [dia, mes, ano] = valorData.split("/")

            const dataTeste = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
            )

            const dataValida =
                dataTeste.getFullYear() === Number(ano) &&
                dataTeste.getMonth() === Number(mes) - 1 &&
                dataTeste.getDate() === Number(dia)

            if (!dataValida) {
                return ""
            }

            return `${dia}-${mes}-${ano}`
        }

        return ""
    }

    function validar() {
        const novos = {}

        if (!numero.trim()) {
            novos.numero = "Informe o número da nota."
        }

        if (!empresa.trim()) {
            novos.empresa = "Informe o nome da empresa."
        }

        if (
            valor === "" ||
            Number(normalizarValor(valor)) <= 0
        ) {
            novos.valor = "Informe um valor válido."
        }

        if (!normalizarData(data)) {
            novos.data = "Informe uma data válida."
        }

        if (!vendedorId) {
            novos.vendedor = "Selecione o vendedor."
        }

        setErros(novos)

        return Object.keys(novos).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!validar()) return

        setSalvando(true)

        try {
            await editarNota(nota.id, {
                vendedorId,
                numeroNotaFiscal: numero,
                nomeEmpresa: empresa.trim(),
                codigoCliente: codigoCliente.trim() || null,
                valorNotaFiscal: normalizarValor(valor),
                dataVenda: normalizarData(data),
            })

            toast.sucesso(
                "Nota fiscal atualizada com sucesso!",
            )

            onSucesso()
        } catch (error) {
            toast.erro(
                getFriendlyError(
                    error,
                    "Não foi possível editar a nota fiscal.",
                ),
            )
        } finally {
            setSalvando(false)
        }
    }

    if (!nota) return null

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Editar nota fiscal"
            maxWidth="max-w-lg"
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        form="form-editar-nota"
                        loading={salvando}
                        disabled={salvando}
                    >
                        Salvar alterações
                    </Button>
                </>
            }
        >
            <form
                id="form-editar-nota"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <Input
                    id="editar-numero"
                    label="Número da nota"
                    type="number"
                    value={numero}
                    onChange={(e) =>
                        setNumero(e.target.value)
                    }
                    error={erros.numero}
                />

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="editar-vendedor"
                        className="text-sm font-medium text-foreground"
                    >
                        Vendedor
                    </label>

                    <select
                        id="editar-vendedor"
                        value={vendedorId}
                        onChange={(e) =>
                            setVendedorId(e.target.value)
                        }
                        className={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
                            erros.vendedor
                                ? "border-[var(--color-destructive)]"
                                : "border-input"
                        }`}
                    >
                        <option value="">
                            Selecione um vendedor
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

                    {erros.vendedor && (
                        <span className="text-xs text-[var(--color-destructive)]">
              {erros.vendedor}
            </span>
                    )}
                </div>

                <Input
                    id="editar-codigo"
                    label="Código do cliente"
                    type="text"
                    value={codigoCliente}
                    onChange={(e) =>
                        setCodigoCliente(e.target.value)
                    }
                />

                <Input
                    id="editar-empresa"
                    label="Empresa"
                    type="text"
                    value={empresa}
                    onChange={(e) =>
                        setEmpresa(e.target.value)
                    }
                    error={erros.empresa}
                />

                <Input
                    id="editar-valor"
                    label="Valor da nota (R$)"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 5.519,20"
                    value={valor}
                    onChange={(e) =>
                        setValor(e.target.value)
                    }
                    error={erros.valor}
                />

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="editar-data"
                        className="text-sm font-medium text-foreground"
                    >
                        Data da venda
                    </label>

                    <div className="relative">
                        <input
                            id="editar-data"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ex: 05/08/2026"
                            value={data}
                            onChange={(e) =>
                                setData(e.target.value)
                            }
                            className={`w-full rounded-lg border bg-card px-3.5 py-2.5 pr-12 text-sm text-foreground outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
                                erros.data
                                    ? "border-[var(--color-destructive)]"
                                    : "border-input"
                            }`}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                calendarioRef.current?.showPicker()
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Abrir calendário"
                            title="Abrir calendário"
                        >
                            <CalendarDays size={18} />
                        </button>

                        <input
                            ref={calendarioRef}
                            type="date"
                            className="pointer-events-none absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 opacity-0"
                            onChange={(e) => {
                                const valorCalendario =
                                    e.target.value

                                if (!valorCalendario) return

                                const [ano, mes, dia] =
                                    valorCalendario.split("-")

                                setData(
                                    `${dia}/${mes}/${ano}`,
                                )
                            }}
                        />
                    </div>

                    {erros.data && (
                        <span className="text-xs text-[var(--color-destructive)]">
              {erros.data}
            </span>
                    )}
                </div>
            </form>
        </Modal>
    )
}
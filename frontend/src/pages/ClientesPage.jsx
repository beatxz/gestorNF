import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Pencil, Ban, RotateCcw, Users } from "lucide-react"
import Button from "../components/ui/Button.jsx"
import { EmptyState } from "../components/ui/Feedback.jsx"
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx"
import ClienteModal from "../components/modals/ClienteModal.jsx"
import { useVendedores } from "../hooks/useVendedores.js"
import { useToast } from "../hooks/useToast.jsx"
import { listarClientes, alterarStatusCliente } from "../services/clienteService.js"
import { getFriendlyError } from "../services/api.js"

export default function ClientesPage() {
    const navigate = useNavigate()
    const toast = useToast()

    const toastRef = useRef(toast)
    toastRef.current = toast
    const notificarErro = useCallback((msg) => toastRef.current.erro(msg), [])

    const { vendedores, carregando: carregandoVendedores } = useVendedores(notificarErro)

    // clientesPorVendedor: { [vendedorId]: { lista: [], carregando: bool } }
    const [clientesPorVendedor, setClientesPorVendedor] = useState({})

    const [modalCliente, setModalCliente] = useState(null) // { vendedorId, cliente | null }
    const [confirmDesativar, setConfirmDesativar] = useState(null) // { vendedorId, cliente }
    const [alterandoStatus, setAlterandoStatus] = useState(false)

    const carregarClientesDoVendedor = useCallback(async (vendedorId) => {
        setClientesPorVendedor((atual) => ({
            ...atual,
            [vendedorId]: { lista: atual[vendedorId]?.lista ?? [], carregando: true },
        }))

        try {
            const dados = await listarClientes(vendedorId)
            setClientesPorVendedor((atual) => ({
                ...atual,
                [vendedorId]: { lista: Array.isArray(dados) ? dados : [], carregando: false },
            }))
        } catch (error) {
            toastRef.current.erro(getFriendlyError(error, "Não foi possível carregar os clientes."))
            setClientesPorVendedor((atual) => ({
                ...atual,
                [vendedorId]: { lista: [], carregando: false },
            }))
        }
    }, [])

    useEffect(() => {
        vendedores.forEach((v) => carregarClientesDoVendedor(v.id))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendedores])

    function aoSalvarCliente() {
        const vendedorId = modalCliente.vendedorId
        setModalCliente(null)
        carregarClientesDoVendedor(vendedorId)
    }

    async function confirmarAlterarStatus() {
        const { vendedorId, cliente } = confirmDesativar
        setAlterandoStatus(true)
        try {
            await alterarStatusCliente(vendedorId, cliente.id, !cliente.ativo)
            toast.sucesso(cliente.ativo ? "Cliente desativado." : "Cliente reativado.")
            setConfirmDesativar(null)
            carregarClientesDoVendedor(vendedorId)
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível alterar o status do cliente."))
        } finally {
            setAlterandoStatus(false)
        }
    }

    async function reativarDireto(vendedorId, cliente) {
        try {
            await alterarStatusCliente(vendedorId, cliente.id, true)
            toast.sucesso("Cliente reativado.")
            carregarClientesDoVendedor(vendedorId)
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível reativar o cliente."))
        }
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
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
                        <h1 className="text-lg font-semibold text-foreground">Clientes</h1>
                        <p className="text-sm text-muted-foreground">Carteira de clientes por vendedor</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                {carregandoVendedores ? (
                    <p className="text-sm text-muted-foreground">Carregando vendedores...</p>
                ) : vendedores.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        titulo="Nenhum vendedor cadastrado"
                        descricao="Cadastre um vendedor para começar a organizar os clientes dele."
                    />
                ) : (
                    <div className="mx-auto flex max-w-3xl flex-col gap-8">
                        {vendedores.map((vendedor) => {
                            const info = clientesPorVendedor[vendedor.id] ?? { lista: [], carregando: true }

                            return (
                                <section key={vendedor.id} className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-foreground">
                                            Clientes de {vendedor.nome}
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setModalCliente({ vendedorId: vendedor.id, cliente: null })}
                                        >
                                            <Plus size={16} />
                                            Adicionar cliente
                                        </Button>
                                    </div>

                                    {info.carregando ? (
                                        <p className="text-sm text-muted-foreground">Carregando clientes...</p>
                                    ) : info.lista.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Nenhum cliente cadastrado para este vendedor ainda.
                                        </p>
                                    ) : (
                                        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
                                            {info.lista.map((cliente) => (
                                                <div key={cliente.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                                    <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {cliente.nomeEmpresa}
                            </span>
                                                        <span className="text-xs text-muted-foreground">
                              Código {cliente.codigoCliente}
                                                            {!cliente.ativo && " · Desativado"}
                            </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setModalCliente({ vendedorId: vendedor.id, cliente })}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                            aria-label="Editar cliente"
                                                            title="Editar cliente"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        {cliente.ativo ? (
                                                            <button
                                                                onClick={() => setConfirmDesativar({ vendedorId: vendedor.id, cliente })}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-[var(--color-destructive)]"
                                                                aria-label="Desativar cliente"
                                                                title="Desativar cliente"
                                                            >
                                                                <Ban size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => reativarDireto(vendedor.id, cliente)}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-[var(--color-success)]"
                                                                aria-label="Reativar cliente"
                                                                title="Reativar cliente"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )
                        })}
                    </div>
                )}
            </div>

            <ClienteModal
                open={Boolean(modalCliente)}
                onClose={() => setModalCliente(null)}
                onSucesso={aoSalvarCliente}
                vendedorId={modalCliente?.vendedorId}
                cliente={modalCliente?.cliente}
            />

            <ConfirmDialog
                open={Boolean(confirmDesativar)}
                onClose={() => setConfirmDesativar(null)}
                onConfirm={confirmarAlterarStatus}
                title="Desativar cliente"
                message={`Tem certeza que deseja desativar "${confirmDesativar?.cliente?.nomeEmpresa}"? Você poderá reativar depois.`}
                confirmLabel="Desativar"
                loading={alterandoStatus}
            />
        </div>
    )
}
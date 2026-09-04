import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Search, Eye, Users } from "lucide-react"
import Button from "../components/ui/Button.jsx"
import { EmptyState } from "../components/ui/Feedback.jsx"
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

    const [clientesPorVendedor, setClientesPorVendedor] = useState({})
    const [buscas, setBuscas] = useState({})
    const [modalCliente, setModalCliente] = useState(null)
    const [alterandoStatus, setAlterandoStatus] = useState(null)

    const carregarClientesDoVendedor = useCallback(async (vendedorId) => {
        setClientesPorVendedor((atual) => ({
            ...atual,
            [vendedorId]: {
                lista: atual[vendedorId]?.lista ?? [],
                carregando: true
            }
        }))

        try {
            const dados = await listarClientes(vendedorId)

            setClientesPorVendedor((atual) => ({
                ...atual,
                [vendedorId]: {
                    lista: Array.isArray(dados) ? dados : [],
                    carregando: false
                }
            }))
        } catch (error) {
            toastRef.current.erro(
                getFriendlyError(error, "Não foi possível carregar os clientes.")
            )

            setClientesPorVendedor((atual) => ({
                ...atual,
                [vendedorId]: {
                    lista: [],
                    carregando: false
                }
            }))
        }
    }, [])

    useEffect(() => {
        vendedores.forEach((vendedor) => carregarClientesDoVendedor(vendedor.id))
    }, [vendedores, carregarClientesDoVendedor])

    function aoSalvarCliente() {
        const vendedorId = modalCliente.vendedorId
        setModalCliente(null)
        carregarClientesDoVendedor(vendedorId)
    }

    function alterarBusca(vendedorId, valor) {
        setBuscas((atual) => ({
            ...atual,
            [vendedorId]: valor
        }))
    }

    function filtrarClientes(clientes, vendedorId) {
        const busca = (buscas[vendedorId] || "").toLowerCase().trim()

        if (!busca) return clientes

        return clientes.filter((cliente) =>
            cliente.nomeEmpresa?.toLowerCase().includes(busca) ||
            cliente.codigoCliente?.toLowerCase().includes(busca) ||
            cliente.cnpj?.toLowerCase().includes(busca) ||
            cliente.municipio?.toLowerCase().includes(busca)
        )
    }

    async function alternarStatus(vendedorId, cliente) {
        setAlterandoStatus(cliente.id)

        try {
            const novoStatus = !cliente.ativo

            await alterarStatusCliente(vendedorId, cliente.id, novoStatus)

            setClientesPorVendedor((atual) => ({
                ...atual,
                [vendedorId]: {
                    ...atual[vendedorId],
                    lista: atual[vendedorId].lista.map((item) =>
                        item.id === cliente.id
                            ? { ...item, ativo: novoStatus }
                            : item
                    )
                }
            }))

            toast.sucesso(
                novoStatus
                    ? "Cliente ativado."
                    : "Cliente desativado."
            )
        } catch (error) {
            toast.erro(
                getFriendlyError(
                    error,
                    "Não foi possível alterar o status do cliente."
                )
            )
        } finally {
            setAlterandoStatus(null)
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
                        <h1 className="text-lg font-semibold text-foreground">
                            Clientes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Carteira de clientes por vendedor
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                {carregandoVendedores ? (
                    <p className="text-sm text-muted-foreground">
                        Carregando vendedores...
                    </p>
                ) : vendedores.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        titulo="Nenhum vendedor cadastrado"
                        descricao="Cadastre um vendedor para começar a organizar os clientes dele."
                    />
                ) : (
                    <div className="mx-auto flex max-w-6xl flex-col gap-10">
                        {vendedores.map((vendedor) => {
                            const info = clientesPorVendedor[vendedor.id] ?? {
                                lista: [],
                                carregando: true
                            }

                            const clientesFiltrados = filtrarClientes(
                                info.lista,
                                vendedor.id
                            )

                            return (
                                <section
                                    key={vendedor.id}
                                    className="flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-base font-semibold text-foreground">
                                                {vendedor.nome}
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                {info.lista.length} cliente
                                                {info.lista.length !== 1 && "s"}
                                            </p>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setModalCliente({
                                                    vendedorId: vendedor.id,
                                                    cliente: null
                                                })
                                            }
                                        >
                                            <Plus size={16} />
                                            Adicionar cliente
                                        </Button>
                                    </div>

                                    <div className="relative">
                                        <Search
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />

                                        <input
                                            type="text"
                                            value={buscas[vendedor.id] || ""}
                                            onChange={(e) =>
                                                alterarBusca(
                                                    vendedor.id,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Buscar por nome, código, CNPJ ou município..."
                                            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
                                        />
                                    </div>

                                    {info.carregando ? (
                                        <p className="text-sm text-muted-foreground">
                                            Carregando clientes...
                                        </p>
                                    ) : info.lista.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Nenhum cliente cadastrado para este vendedor ainda.
                                        </p>
                                    ) : (
                                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="border-b border-border bg-muted/30">
                                                    <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        <th className="px-4 py-3">
                                                            Cód. cliente
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Nome
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Município
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Transportadora
                                                        </th>
                                                        <th className="px-4 py-3 text-center">
                                                            Ativo
                                                        </th>
                                                        <th className="px-4 py-3"></th>
                                                    </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-border">
                                                    {clientesFiltrados.map((cliente) => (
                                                        <tr
                                                            key={cliente.id}
                                                            className={`transition-colors hover:bg-muted/30 ${
                                                                !cliente.ativo
                                                                    ? "opacity-60"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                                                {cliente.codigoCliente || "-"}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                    <span className="text-sm font-medium text-foreground">
                                                                        {cliente.nomeEmpresa || "-"}
                                                                    </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                                                {cliente.municipio || "-"}
                                                            </td>

                                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                {cliente.transportadora || "-"}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            alternarStatus(
                                                                                vendedor.id,
                                                                                cliente
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            alterandoStatus ===
                                                                            cliente.id
                                                                        }
                                                                        className={`relative h-6 w-11 rounded-full transition-colors ${
                                                                            cliente.ativo
                                                                                ? "bg-primary"
                                                                                : "bg-muted-foreground/40"
                                                                        }`}
                                                                        aria-label={
                                                                            cliente.ativo
                                                                                ? "Desativar cliente"
                                                                                : "Ativar cliente"
                                                                        }
                                                                        title={
                                                                            cliente.ativo
                                                                                ? "Cliente ativo"
                                                                                : "Cliente inativo"
                                                                        }
                                                                    >
                                                                            <span
                                                                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                                                                    cliente.ativo
                                                                                        ? "left-6"
                                                                                        : "left-1"
                                                                                }`}
                                                                            />
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    onClick={() =>
                                                                        setModalCliente({
                                                                            vendedorId:
                                                                            vendedor.id,
                                                                            cliente
                                                                        })
                                                                    }
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                    aria-label="Ver detalhes do cliente"
                                                                    title="Ver detalhes"
                                                                >
                                                                    <Eye size={17} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {clientesFiltrados.length === 0 && (
                                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                    Nenhum cliente encontrado.
                                                </div>
                                            )}
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
        </div>
    )
}
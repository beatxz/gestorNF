import { useState } from "react"
import { Search, Plus, Users, X } from "lucide-react"
import Logo from "./Logo.jsx"
import Button from "./ui/Button.jsx"
import { Spinner, EmptyState } from "./ui/Feedback.jsx"

export default function VendedorSidebar({
                                            vendedores,
                                            carregando,
                                            selecionado,
                                            onSelecionar,
                                            onAdicionar,
                                            onBuscarNotaGlobal,
                                            buscando,
                                            onLimparBusca,
                                            aberta,
                                            onFechar,
                                        }) {
    const [termo, setTermo] = useState("")

    const termoLimpo = termo.trim()

    const ehNumero =
        termoLimpo !== "" &&
        /^\d+$/.test(termoLimpo)

    const vendedoresFiltrados =
        termoLimpo && !ehNumero
            ? vendedores.filter((vendedor) =>
                vendedor.nome
                    ?.toLowerCase()
                    .includes(termoLimpo.toLowerCase()),
            )
            : vendedores

    async function handleBusca(e) {
        e.preventDefault()

        if (!termoLimpo || !ehNumero) return

        await onBuscarNotaGlobal(termoLimpo)

        if (window.innerWidth < 1024) {
            onFechar?.()
        }
    }

    function limpar() {
        setTermo("")
        onLimparBusca?.()
    }

    function selecionar(vendedor) {
        onSelecionar(vendedor)

        if (window.innerWidth < 1024) {
            onFechar?.()
        }
    }

    function iniciais(nome) {
        return (nome || "?")
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
    }

    return (
        <>
            {/* Fundo escuro no mobile */}
            {aberta && (
                <button
                    type="button"
                    onClick={onFechar}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    aria-label="Fechar menu"
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 shrink-0 flex-col
          border-r border-border bg-card
          transition-transform duration-300 ease-in-out

          lg:static
          lg:z-auto
          lg:translate-x-0

          ${
                    aberta
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
        `}
            >
                {/* Logo + fechar */}
                <div className="flex items-center justify-between border-b border-border p-5">
                    <Logo />

                    <button
                        type="button"
                        onClick={onFechar}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                        aria-label="Fechar menu lateral"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Busca */}
                <div className="border-b border-border p-4">
                    <form
                        onSubmit={handleBusca}
                        className="relative"
                    >
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            type="text"
                            value={termo}
                            onChange={(e) =>
                                setTermo(e.target.value)
                            }
                            placeholder="Buscar vendedor ou NF"
                            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                        />

                        {termo && (
                            <button
                                type="button"
                                onClick={limpar}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Limpar busca"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>

                    {ehNumero && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Pressione Enter para buscar a NF
                        </p>
                    )}
                </div>

                {/* Título */}
                <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vendedores
          </span>

                    {buscando && <Spinner size={14} />}
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto px-3 pb-3">
                    {carregando ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : vendedoresFiltrados.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            titulo="Nenhum vendedor"
                            descricao="Nenhum vendedor encontrado."
                        />
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {vendedoresFiltrados.map(
                                (vendedor) => {
                                    const ativo =
                                        selecionado?.id === vendedor.id

                                    return (
                                        <li key={vendedor.id}>
                                            <button
                                                onClick={() =>
                                                    selecionar(vendedor)
                                                }
                                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                                    ativo
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-foreground hover:bg-muted"
                                                }`}
                                            >
                        <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                ativo
                                    ? "bg-white/20 text-white"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {iniciais(vendedor.nome)}
                        </span>

                                                <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {vendedor.nome}
                          </span>

                          <span
                              className={`block text-xs ${
                                  ativo
                                      ? "text-white/70"
                                      : "text-muted-foreground"
                              }`}
                          >
                            {vendedor.comissao}% de comissão
                          </span>
                        </span>
                                            </button>
                                        </li>
                                    )
                                },
                            )}
                        </ul>
                    )}
                </div>

                {/* Adicionar vendedor */}
                <div className="border-t border-border p-4">
                    <Button
                        onClick={() => {
                            onAdicionar()

                            if (window.innerWidth < 1024) {
                                onFechar?.()
                            }
                        }}
                        className="w-full"
                    >
                        <Plus size={16} />
                        Adicionar vendedor
                    </Button>
                </div>
            </aside>
        </>
    )
}
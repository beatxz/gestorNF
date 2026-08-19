import { useState } from "react"
import { Search, Plus, Users, X } from "lucide-react"
import Logo from "./Logo.jsx"
import Button from "./ui/Button.jsx"
import { Spinner, EmptyState } from "./ui/Feedback.jsx"

/**
 * Barra lateral com a lista de vendedores, busca por ID e botão de adicionar.
 * Inspirada nos desenhos: nome do vendedor fica destacado quando selecionado.
 */
export default function VendedorSidebar({
  vendedores,
  carregando,
  selecionado,
  onSelecionar,
  onAdicionar,
  onBuscarId,
  buscando,
  buscaAtiva,
  onLimparBusca,
}) {
  const [termoId, setTermoId] = useState("")

  function handleBusca(e) {
    e.preventDefault()
    const id = termoId.trim()
    if (id) onBuscarId(id)
  }

  function limpar() {
    setTermoId("")
    onLimparBusca()
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
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-5">
        <Logo />
      </div>

      {/* Busca por ID de vendedor */}
      <div className="border-b border-border p-4">
        <form onSubmit={handleBusca} className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="number"
            value={termoId}
            onChange={(e) => setTermoId(e.target.value)}
            placeholder="Buscar vendedor por ID"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          {(termoId || buscaAtiva) && (
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
      </div>

      {/* Cabeçalho da lista */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {buscaAtiva ? "Resultado da busca" : "Vendedores"}
        </span>
        {buscando && <Spinner size={14} />}
      </div>

      {/* Lista de vendedores */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {carregando ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : vendedores.length === 0 ? (
          <EmptyState
            icon={Users}
            titulo="Nenhum vendedor"
            descricao={buscaAtiva ? "Nenhum vendedor com esse ID." : "Cadastre seu primeiro vendedor."}
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {vendedores.map((v) => {
              const ativo = selecionado?.id === v.id
              return (
                <li key={v.id}>
                  <button
                    onClick={() => onSelecionar(v)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      ativo ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        ativo ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {iniciais(v.nome)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{v.nome}</span>
                      <span className={`block text-xs ${ativo ? "text-white/70" : "text-muted-foreground"}`}>
                        ID {v.id} · {v.comissao}%
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Adicionar vendedor */}
      <div className="border-t border-border p-4">
        <Button onClick={onAdicionar} className="w-full">
          <Plus size={16} />
          Adicionar vendedor
        </Button>
      </div>
    </aside>
  )
}

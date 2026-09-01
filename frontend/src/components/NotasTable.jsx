import { useState } from "react"
import { Search, Plus, FileText, X } from "lucide-react"
import Button from "./ui/Button.jsx"
import { Spinner, EmptyState } from "./ui/Feedback.jsx"
import { formatarMoeda, formatarData } from "../utils/format.js"

/**
 * Tabela de notas fiscais do vendedor selecionado.
 * Inclui busca por número da nota e botão de adicionar.
 * Ao clicar em uma linha, abre os detalhes/ações da nota.
 */
export default function NotasTable({
                                     notas,
                                     carregando,
                                     onAdicionar,
                                     onSelecionarNota,
                                     onBuscarNumero,
                                     onBuscarCodigo,
                                     buscando,
                                     buscaAtiva,
                                     buscaCodigoAtiva,
                                     onLimparBusca,
                                     onLimparBuscaCodigo,
                                   }) {
  const [numero, setNumero] = useState("")
  const [codigoCliente, setCodigoCliente] = useState("")

  function handleBusca(e) {
    e.preventDefault()
    const n = numero.trim()
    if (n) onBuscarNumero(n)
  }
  function handleBuscaCodigo(e) {
    e.preventDefault()

    const codigo = codigoCliente.trim()

    if (codigo) {
      onBuscarCodigo(codigo)
    }
  }

  function limpar() {
    setNumero("")
    onLimparBusca()
  }

  function limparCodigo() {
    setCodigoCliente("")
    onLimparBuscaCodigo()
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Cabeçalho: título, busca, adicionar */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-foreground">Notas fiscais</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={handleBusca} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Buscar nota por número"
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 sm:w-56"
            />
            {(numero || buscaAtiva) && (
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
          <form onSubmit={handleBuscaCodigo} className="relative">
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
                type="text"
                value={codigoCliente}
                onChange={(e) => setCodigoCliente(e.target.value)}
                placeholder="Buscar por cód. cliente"
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 sm:w-56"
            />

            {(codigoCliente || buscaCodigoAtiva) && (
                <button
                    type="button"
                    onClick={limparCodigo}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Limpar busca por cliente"
                >
                  <X size={16} />
                </button>
            )}
          </form>
          <Button onClick={onAdicionar} size="md">
            <Plus size={16} />
            Adicionar nota
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      {carregando || buscando ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : notas.length === 0 ? (
        <EmptyState
          icon={FileText}
          titulo="Nenhuma nota fiscal"
          descricao={buscaAtiva ? "Nenhuma nota encontrada com esse número." : "Adicione a primeira nota deste vendedor."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nº Nota</th>
                <th className="px-5 py-3 font-medium">Cód. Cliente</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota, idx) => (
                <tr
                  key={nota.numeroNotaFiscal ?? idx}
                  onClick={() => onSelecionarNota(nota)}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-muted"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">{nota.numeroNotaFiscal}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{nota.codigoCliente || "-"}</td>
                  <td className="px-5 py-3.5 text-foreground">{nota.nomeEmpresa}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{formatarMoeda(nota.valorNotaFiscal)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatarData(nota.dataVenda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

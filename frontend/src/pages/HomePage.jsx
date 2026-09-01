import { useState, useEffect, useCallback, useRef } from "react"
import {Settings, LogOut, UserRound, BadgePercent, Hash, Download, Users, ChartNoAxesCombined,} from "lucide-react"
import VendedorSidebar from "../components/VendedorSidebar.jsx"
import FinanceCards from "../components/FinanceCards.jsx"
import MonthPicker from "../components/MonthPicker.jsx"
import NotasTable from "../components/NotasTable.jsx"
import Button from "../components/ui/Button.jsx"
import { EmptyState } from "../components/ui/Feedback.jsx"
import AddVendedorModal from "../components/modals/AddVendedorModal.jsx"
import AddNotaModal from "../components/modals/AddNotaModal.jsx"
import NotaDetalheModal from "../components/modals/NotaDetalheModal.jsx"
import SettingsModal from "../components/modals/SettingsModal.jsx"
import { useVendedores } from "../hooks/useVendedores.js"
import { useAuth } from "../hooks/useAuth.jsx"
import { useToast } from "../hooks/useToast.jsx"
import { buscarVendedorPorId } from "../services/vendedorService.js"
import { buscarUsuarioLogado } from "../services/authService.js"
import {
  listarNotasDoVendedor,
  buscarNota,
  buscarValorMensal,
  buscarValorComissao,
} from "../services/notaService.js"
import { getFriendlyError } from "../services/api.js"
import { mesAtual } from "../utils/format.js"
import ExportarRelatorioModal from "../components/modals/ExportarRelatorioModal.jsx"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const toast = useToast()
  const { sair } = useAuth()
  const navigate = useNavigate()

  // Evita recriar o callback de erro a cada render (usado pelo hook).
  const toastRef = useRef(toast)
  toastRef.current = toast
  const notificarErro = useCallback((msg) => toastRef.current.erro(msg), [])

  const { vendedores, carregando: carregandoVendedores, recarregar } = useVendedores(notificarErro)

  // Vendedor selecionado
  const [selecionado, setSelecionado] = useState(null)

  // Busca de vendedor por ID
  const [buscaVendedor, setBuscaVendedor] = useState(null) // vendedor encontrado
  const [buscandoVendedor, setBuscandoVendedor] = useState(false)

  // Notas
  const [notas, setNotas] = useState([])
  const [carregandoNotas, setCarregandoNotas] = useState(false)
  const [buscaNota, setBuscaNota] = useState(null)
  const [buscaCodigoCliente, setBuscaCodigoCliente] = useState(null)
  const [buscandoNota, setBuscandoNota] = useState(false)

  // Valores financeiros
  const [mes, setMes] = useState(mesAtual())
  const [valorMensal, setValorMensal] = useState(null)
  const [valorComissao, setValorComissao] = useState(null)
  const [comissaoTotal, setComissaoTotal] = useState(null)
  const [carregandoValores, setCarregandoValores] = useState(false)

  // Modais
  const [modalVendedor, setModalVendedor] = useState(false)
  const [modalNota, setModalNota] = useState(false)
  const [modalConfig, setModalConfig] = useState(false)
  const [notaDetalhe, setNotaDetalhe] = useState(null)
  const [modalRelatorio, setModalRelatorio] = useState(false)

  const lista = buscaVendedor ? [buscaVendedor] : vendedores

  // Carrega as notas do vendedor selecionado.
  const carregarNotas = useCallback(
    async (idVendedor) => {
      setCarregandoNotas(true)
      setBuscaNota(null)
      try {
        const dados = await listarNotasDoVendedor(idVendedor)
        setNotas(Array.isArray(dados) ? dados : [])
      } catch (error) {
        toastRef.current.erro(getFriendlyError(error, "Não foi possível carregar as notas."))
        setNotas([])
      } finally {
        setCarregandoNotas(false)
      }
    },
    [],
  )

  // Carrega valor mensal e comissão do vendedor selecionado para o mês escolhido.
  const carregarValores = useCallback(async (idVendedor, mesRef) => {
    setCarregandoValores(true)
    try {
      const [vm, vc] = await Promise.all([
        buscarValorMensal(idVendedor, mesRef),
        buscarValorComissao(idVendedor, mesRef),
      ])
      // A API pode retornar número puro ou objeto; tratamos ambos.
      setValorMensal(typeof vm === "object" && vm !== null ? vm.valor ?? vm.total ?? vm : vm)
      setValorComissao(typeof vc === "object" && vc !== null ? vc.valor ?? vc.total ?? vc : vc)
    } catch (error) {
      toastRef.current.erro(getFriendlyError(error, "Não foi possível carregar os valores do mês."))
      setValorMensal(null)
      setValorComissao(null)
    } finally {
      setCarregandoValores(false)
    }
  }, [])

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const usuario = await buscarUsuarioLogado()
        setComissaoTotal(usuario?.comissaoTotal ?? null)
      } catch (error) {
        toastRef.current.erro(
            getFriendlyError(
                error,
                "Não foi possível carregar a comissão total da empresa.",
            ),
        )
      }
    }

    carregarUsuario()
  }, [])

  // Ao selecionar um vendedor, busca notas e valores.
  useEffect(() => {
    if (selecionado?.id != null) {
      carregarNotas(selecionado.id)
    } else {
      setNotas([])
    }
  }, [selecionado, carregarNotas])

  useEffect(() => {
    if (selecionado?.id != null) {
      carregarValores(selecionado.id, mes)
    } else {
      setValorMensal(null)
      setValorComissao(null)
    }
  }, [selecionado, mes, carregarValores])

  function selecionarVendedor(v) {
    setSelecionado(v)
    setNotaDetalhe(null)
  }

  // Busca de vendedor por ID (sidebar).
  async function handleBuscarVendedorId(id) {
    setBuscandoVendedor(true)
    try {
      const v = await buscarVendedorPorId(id)
      if (v && v.id != null) {
        setBuscaVendedor(v)
        selecionarVendedor(v)
      } else {
        setBuscaVendedor(null)
        toast.info("Nenhum vendedor encontrado com esse ID.")
      }
    } catch (error) {
      setBuscaVendedor(null)
      toast.erro(getFriendlyError(error, "Vendedor não encontrado."))
    } finally {
      setBuscandoVendedor(false)
    }
  }

  function limparBuscaVendedor() {
    setBuscaVendedor(null)
  }

  // Busca de nota por número (dentro do vendedor selecionado).
  async function handleBuscarNota(numero) {
    if (!selecionado) return
    setBuscandoNota(true)
    try {
      const nota = await buscarNota(numero)
      if (nota && nota.numeroNotaFiscal != null) {
        setBuscaNota([nota])
      } else {
        setBuscaNota([])
        toast.info("Nenhuma nota encontrada com esse número.")
      }
    } catch (error) {
      setBuscaNota([])
      toast.erro(getFriendlyError(error, "Nota não encontrada."))
    } finally {
      setBuscandoNota(false)
    }
  }

  function limparBuscaNota() {
    setBuscaNota(null)
  }

  function handleBuscarCodigoCliente(codigo) {
    if (!codigo) return

    const codigoNormalizado = codigo.trim().toLowerCase()

    const encontradas = notas.filter(
        (nota) =>
            String(nota.codigoCliente ?? "")
                .trim()
                .toLowerCase() === codigoNormalizado
    )

    setBuscaNota(null)
    setBuscaCodigoCliente(encontradas)

    if (encontradas.length === 0) {
      toast.info("Nenhuma nota encontrada para esse código de cliente.")
    }
  }

  function limparBuscaCodigoCliente() {
    setBuscaCodigoCliente(null)
  }

  // Atualiza tudo após cadastrar/excluir nota.
  function recarregarNotas() {
    setModalNota(false)
    setNotaDetalhe(null)
    if (selecionado) {
      carregarNotas(selecionado.id)
      carregarValores(selecionado.id, mes)
    }
  }

  // Após adicionar vendedor.
  async function aoAdicionarVendedor(novo) {
    setModalVendedor(false)
    await recarregar()
    if (novo && novo.id != null) selecionarVendedor(novo)
  }

  // Após mudanças nas configurações (comissão, exclusões).
  async function aoMudarVendedores() {
    await recarregar()
    // Se o vendedor selecionado foi excluído, limpa a seleção.
    if (selecionado) {
      try {
        const atual = await buscarVendedorPorId(selecionado.id)
        setSelecionado(atual && atual.id != null ? atual : null)
      } catch {
        setSelecionado(null)
      }
    }
  }

  const percentualUsuario =
      comissaoTotal != null && selecionado?.comissao != null
          ? Math.max(0, Number(comissaoTotal) - Number(selecionado.comissao))
          : null

  const valorComissaoUsuario =
      valorMensal != null && percentualUsuario != null
          ? Number(valorMensal) * (percentualUsuario / 100)
          : null

  const notasDoMes = notas.filter((nota) => {
    if (!nota.dataVenda) return false

    const [, mesNota, anoNota] = nota.dataVenda.split("-")
    const [anoSelecionado, mesSelecionado] = mes.split("-")

    return mesNota === mesSelecionado && anoNota === anoSelecionado
  })

  const notasExibidas =
      buscaNota ??
      buscaCodigoCliente ??
      notasDoMes

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <VendedorSidebar
        vendedores={lista}
        carregando={carregandoVendedores}
        selecionado={selecionado}
        onSelecionar={selecionarVendedor}
        onAdicionar={() => setModalVendedor(true)}
        onBuscarId={handleBuscarVendedorId}
        buscando={buscandoVendedor}
        buscaAtiva={Boolean(buscaVendedor)}
        onLimparBusca={limparBuscaVendedor}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Painel de gestão</h1>
            <p className="text-sm text-muted-foreground">Vendedores e notas fiscais</p>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={() => navigate("/clientes")}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Clientes"
                title="Clientes"
            >

              <Users size={18} />
            </button>
            <button
                onClick={() => navigate("/resultado-geral")}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Resultado geral"
                title="Resultado geral"
            >
              <ChartNoAxesCombined size={18} />
            </button>
            <button
                onClick={() => setModalConfig(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Configurações"
              title="Configurações"
            >
              <Settings size={18} />
            </button>
            <Button variant="outline" onClick={sair}>
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selecionado ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={UserRound}
                titulo="Selecione um vendedor"
                descricao="Escolha um vendedor na lista ao lado para ver suas notas fiscais e valores mensais."
              />
            </div>
          ) : (
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
              {/* Cabeçalho do vendedor */}
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selecionado.nome}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">

      <span className="flex items-center gap-1.5">
        <Hash size={14} /> ID {selecionado.id}
      </span>

                    <span className="flex items-center gap-1.5"><BadgePercent size={14} /> Comissão {selecionado.comissao}%</span>

                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <MonthPicker
                      value={mes}
                      onChange={setMes}
                  />

                  <Button
                      variant="outline"
                      onClick={() => setModalRelatorio(true)}
                  >
                    <Download size={16} />
                    Exportar PDF
                  </Button>

                </div>

              </div>

              {/* Cartões financeiros */}
              <FinanceCards
                  valorMensal={valorMensal}
                  valorComissao={valorComissao}
                  valorComissaoUsuario={valorComissaoUsuario}
                  percentualVendedor={selecionado.comissao}
                  percentualUsuario={percentualUsuario}
                  carregando={carregandoValores}
              />

              {/* Tabela de notas */}
              <NotasTable
                  notas={notasExibidas}
                  carregando={carregandoNotas}
                  onAdicionar={() => setModalNota(true)}
                  onSelecionarNota={(n) => setNotaDetalhe(n)}
                  onBuscarNumero={handleBuscarNota}
                  onBuscarCodigo={handleBuscarCodigoCliente}
                  buscando={buscandoNota}
                  buscaAtiva={Boolean(buscaNota)}
                  buscaCodigoAtiva={buscaCodigoCliente !== null}
                  onLimparBusca={limparBuscaNota}
                  onLimparBuscaCodigo={limparBuscaCodigoCliente}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modais */}
      <AddVendedorModal
        open={modalVendedor}
        onClose={() => setModalVendedor(false)}
        onSucesso={aoAdicionarVendedor}
      />
      <AddNotaModal
        open={modalNota}
        onClose={() => setModalNota(false)}
        onSucesso={recarregarNotas}
        vendedor={selecionado}
      />
      <NotaDetalheModal
        open={Boolean(notaDetalhe)}
        onClose={() => setNotaDetalhe(null)}
        nota={notaDetalhe}
        vendedor={selecionado}
        onExcluida={recarregarNotas}
      />
      <SettingsModal
        open={modalConfig}
        onClose={() => setModalConfig(false)}
        vendedores={vendedores}
        onVendedoresMudaram={aoMudarVendedores}
      />
      <ExportarRelatorioModal
          open={modalRelatorio}
          onClose={() => setModalRelatorio(false)}
          vendedores={vendedores}
          mes={mes}
      />
    </div>
  )
}

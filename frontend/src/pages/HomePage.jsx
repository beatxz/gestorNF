import { useState, useEffect, useCallback, useRef } from "react"
import {Settings, LogOut, BadgePercent, Download, Users, ChartNoAxesCombined,Menu,ShieldCheck} from "lucide-react"
import VendedorSidebar from "../components/VendedorSidebar.jsx"
import FinanceCards from "../components/FinanceCards.jsx"
import MonthPicker from "../components/MonthPicker.jsx"
import NotasTable from "../components/NotasTable.jsx"
import Button from "../components/ui/Button.jsx"
import AddVendedorModal from "../components/modals/AddVendedorModal.jsx"
import AddNotaModal from "../components/modals/AddNotaModal.jsx"
import NotaDetalheModal from "../components/modals/NotaDetalheModal.jsx"
import EditNotaModal from "../components/modals/EditNotaModal.jsx"
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
  buscarVendasAnuais,
  buscarResultadoGeral,
} from "../services/notaService.js"
import { getFriendlyError } from "../services/api.js"
import { mesAtual } from "../utils/format.js"
import ExportarRelatorioModal from "../components/modals/ExportarRelatorioModal.jsx"
import { useNavigate } from "react-router-dom"
import { listarConvites } from "../services/adminService.js"
import {ArrowLeft} from "lucide-react"
import VendasChart from "../components/VendasChart.jsx"
import MetaMensalCard from "../components/MetaMensalCard.jsx"
import MetaVendedorCard from "../components/MetaVendedorCard.jsx"
import VendasPorVendedorChart from "../components/VendasPorVendedorChart.jsx"
import {buscarMetaMensal, salvarMetaMensal, buscarMetaVendedor, salvarMetaVendedor,} from "../services/metaService.js"

export default function HomePage() {
  const toast = useToast()
  const { sair } = useAuth()
  const navigate = useNavigate()
  const [possuiAcessoAdmin, setPossuiAcessoAdmin] = useState(false)
  const [vendasAnuais, setVendasAnuais] = useState([])
  const [resultadoGeral, setResultadoGeral] = useState(null)
  const [metaMensal, setMetaMensal] = useState(null)
  const [carregandoHome, setCarregandoHome] = useState(false)
  const [salvandoMeta, setSalvandoMeta] = useState(false)
  const [metaVendedor, setMetaVendedor] = useState(null)
  const [carregandoMetaVendedor, setCarregandoMetaVendedor] = useState(false)
  const [salvandoMetaVendedor, setSalvandoMetaVendedor] = useState(false)

  // Evita recriar o callback de erro a cada render (usado pelo hook).
  const toastRef = useRef(toast)
  toastRef.current = toast
  const notificarErro = useCallback((msg) => toastRef.current.erro(msg), [])

  const { vendedores, carregando: carregandoVendedores, recarregar } = useVendedores(notificarErro)

  useEffect(() => {
    async function verificarAcessoAdmin() {
      try {
        await listarConvites()

        setPossuiAcessoAdmin(true)
      } catch (error) {
        if (error?.response?.status === 403) {
          setPossuiAcessoAdmin(false)
          return
        }

        setPossuiAcessoAdmin(false)
      }
    }

    verificarAcessoAdmin()
  }, [])

  // Vendedor selecionado
  const [selecionado, setSelecionado] = useState(null)
  const [sidebarAberta, setSidebarAberta] = useState(true)

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
  const [notaEditando, setNotaEditando] = useState(null)
  const [modalRelatorio, setModalRelatorio] = useState(false)

  const lista = buscaVendedor ? [buscaVendedor] : vendedores

  const carregarHome = useCallback(
      async (mesRef) => {

        setCarregandoHome(true)

        try {

          const ano =
              Number(
                  mesRef.split("-")[0],
              )

          const [
            vendas,
            meta,
            resultado,
          ] = await Promise.all([
            buscarVendasAnuais(ano),
            buscarMetaMensal(mesRef),
            buscarResultadoGeral(mesRef),
          ])

          setVendasAnuais(
              Array.isArray(vendas)
                  ? vendas
                  : [],
          )

          setMetaMensal(meta)
          setResultadoGeral(resultado)

        } catch (error) {

          toastRef.current.erro(
              getFriendlyError(
                  error,
                  "Não foi possível carregar a visão geral.",
              ),
          )

        } finally {

          setCarregandoHome(false)
        }
      },
      [],
  )
  useEffect(() => {

    if (!selecionado) {
      carregarHome(mes)
    }

  }, [
    selecionado,
    mes,
    carregarHome,
  ])
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

  // Carrega a meta individual do vendedor para o mês selecionado.
  const carregarMetaVendedor = useCallback(
      async (idVendedor, mesRef) => {

        setCarregandoMetaVendedor(true)

        try {

          const dados =
              await buscarMetaVendedor(
                  idVendedor,
                  mesRef,
              )

          setMetaVendedor(dados)

        } catch (error) {

          toastRef.current.erro(
              getFriendlyError(
                  error,
                  "Não foi possível carregar a meta do vendedor.",
              ),
          )

          setMetaVendedor(null)

        } finally {

          setCarregandoMetaVendedor(false)
        }
      },
      [],
  )

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

  useEffect(() => {

    if (selecionado?.id != null) {

      carregarMetaVendedor(
          selecionado.id,
          mes,
      )

    } else {

      setMetaVendedor(null)
    }

  }, [
    selecionado,
    mes,
    carregarMetaVendedor,
  ])

  function selecionarVendedor(v) {
    setSelecionado(v)
    setNotaDetalhe(null)
  }
  function voltarParaInicio() {

    setSelecionado(null)

    setBuscaVendedor(null)

    setBuscaNota(null)

    setBuscaCodigoCliente(null)

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

  async function handleSalvarMeta(valor) {

    setSalvandoMeta(true)

    try {

      const dados =
          await salvarMetaMensal(
              mes,
              valor,
          )

      setMetaMensal(dados)

      toast.sucesso(
          "Meta mensal salva com sucesso!",
      )

    } catch (error) {

      toast.erro(
          getFriendlyError(
              error,
              "Não foi possível salvar a meta.",
          ),
      )

    } finally {

      setSalvandoMeta(false)
    }
  }
  async function handleSalvarMetaVendedor(valor) {

    if (!selecionado?.id) {
      return
    }

    setSalvandoMetaVendedor(true)

    try {

      const dados =
          await salvarMetaVendedor(
              selecionado.id,
              mes,
              valor,
          )

      setMetaVendedor(dados)

      toast.sucesso(
          "Meta do vendedor salva com sucesso!",
      )

    } catch (error) {

      toast.erro(
          getFriendlyError(
              error,
              "Não foi possível salvar a meta do vendedor.",
          ),
      )

    } finally {

      setSalvandoMetaVendedor(false)
    }
  }

  async function handleBuscarNotaGlobal(numero) {
    if (!numero) return

    try {
      const nota = await buscarNota(numero)

      const idVendedorNota = nota?.vendedor?.id

      if (!idVendedorNota) {
        toast.erro("Não foi possível identificar o vendedor desta nota.")
        return
      }

      const vendedorDaNota = vendedores.find(
          (vendedor) =>
              Number(vendedor.id) === Number(idVendedorNota),
      )

      if (!vendedorDaNota) {
        toast.erro("O vendedor responsável pela nota não foi encontrado.")
        return
      }

      // muda automaticamente para o vendedor verdadeiro
      await selecionarVendedor(vendedorDaNota)

      // mostra somente a NF encontrada
      setBuscaNota([nota])

      // limpa eventual busca anterior por cliente
      setBuscaCodigoCliente(null)

      toast.sucesso(
          `NF encontrada com ${vendedorDaNota.nome}.`,
      )
    } catch (error) {
      toast.erro(
          getFriendlyError(
              error,
              "Nota fiscal não encontrada.",
          ),
      )
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

  function abrirEdicaoNota(nota) {
    setNotaDetalhe(null)
    setNotaEditando(nota)
  }

  // Atualiza tudo após cadastrar/excluir nota.
  function recarregarNotas() {
    setModalNota(false)
    setNotaDetalhe(null)
    setNotaEditando(null)

    setBuscaNota(null)
    setBuscaCodigoCliente(null)

    if (selecionado) {

      carregarNotas(selecionado.id)

      carregarValores(
          selecionado.id,
          mes,
      )

      carregarMetaVendedor(
          selecionado.id,
          mes,
      )
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
        buscando={buscandoVendedor}
        onBuscarNotaGlobal={handleBuscarNotaGlobal}
        onLimparBusca={limparBuscaVendedor}
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          {!sidebarAberta && (
              <button
                  type="button"
                  onClick={() => setSidebarAberta(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Mostrar vendedores"
                  title="Mostrar vendedores"
              >
                <Menu size={20} />
              </button>
          )}

          <div className="flex items-center gap-2">
            {possuiAcessoAdmin && (
                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Administração"
                    title="Administração"
                >
                  <ShieldCheck size={18} />
                </button>
            )}
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
        <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-5">
          {!selecionado ? (

              <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">

                <div className="flex justify-end">


                  <MonthPicker
                      value={mes}
                      onChange={setMes}
                  />

                </div>


                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">

                  <VendasChart
                      dados={vendasAnuais}
                      ano={mes.split("-")[0]}
                  />

                  <MetaMensalCard
                      dados={metaMensal}
                      salvando={salvandoMeta}
                      onSalvar={handleSalvarMeta}
                  />

                </div>

                <div className="flex justify-start">
                  <VendasPorVendedorChart
                      vendedores={resultadoGeral?.vendedores ?? []}
                  />
                </div>

              </div>

          ) : (
              <div className="flex w-full flex-col gap-5">

                {/* Cabeçalho do vendedor */}
                <div className="overflow-hidden rounded-xl border border-accent/15 bg-accent/5 shadow-sm">

                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto]">

                    {/* Informações do vendedor */}
                    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">

                      <button
                          type="button"
                          onClick={voltarParaInicio}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowLeft size={14} />
                        Voltar para início
                      </button>


                      <div className="hidden h-10 w-px bg-border sm:block" />


                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          {selecionado.nome}
                        </h2>

                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <BadgePercent size={12} />
                          Comissão {selecionado.comissao}%
                        </div>
                      </div>

                    </div>


                    {/* Mês e exportação */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-accent/15 px-4 py-3 lg:border-l lg:border-t-0">

                      <MonthPicker
                          value={mes}
                          onChange={setMes}
                      />

                      <Button
                          variant="outline"
                          onClick={() =>
                              setModalRelatorio(true)
                          }
                      >
                        <Download size={16} />
                        Exportar PDF
                      </Button>

                    </div>

                  </div>

                </div>


                {/* Conteúdo principal */}
                <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

                  {/* Notas fiscais */}
                  <div className="min-w-0">

                    <NotasTable
                        notas={notasExibidas}
                        carregando={carregandoNotas}
                        onAdicionar={() =>
                            setModalNota(true)
                        }
                        onSelecionarNota={(n) =>
                            setNotaDetalhe(n)
                        }
                        onBuscarCodigo={
                          handleBuscarCodigoCliente
                        }
                        buscaCodigoAtiva={
                            buscaCodigoCliente !== null
                        }
                        onLimparBuscaCodigo={
                          limparBuscaCodigoCliente
                        }
                    />

                  </div>


                  {/* Resumo financeiro */}
                  <div className="flex min-w-0 flex-col gap-4">

                    <FinanceCards
                        valorMensal={valorMensal}
                        valorComissao={valorComissao}
                        valorComissaoUsuario={
                          valorComissaoUsuario
                        }
                        percentualVendedor={
                          selecionado.comissao
                        }
                        percentualUsuario={
                          percentualUsuario
                        }
                        carregando={
                          carregandoValores
                        }
                        tipo="principal"
                    />


                    <MetaVendedorCard
                        dados={metaVendedor}
                        salvando={
                          salvandoMetaVendedor
                        }
                        onSalvar={
                          handleSalvarMetaVendedor
                        }
                    />


                    <FinanceCards
                        valorMensal={valorMensal}
                        valorComissao={valorComissao}
                        valorComissaoUsuario={
                          valorComissaoUsuario
                        }
                        percentualVendedor={
                          selecionado.comissao
                        }
                        percentualUsuario={
                          percentualUsuario
                        }
                        carregando={
                          carregandoValores
                        }
                        tipo="usuario"
                    />

                  </div>

                </div>

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
          onEditar={abrirEdicaoNota}
      />
      <EditNotaModal
          open={Boolean(notaEditando)}
          onClose={() => setNotaEditando(null)}
          onSucesso={recarregarNotas}
          nota={notaEditando}
          vendedores={vendedores}
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

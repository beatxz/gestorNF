import { useRef, useState } from "react"
import { CalendarDays, FileText, Keyboard, Upload, ArrowLeft,Pencil, Trash2 } from "lucide-react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { cadastrarNota, lerNotasPdf , cadastrarNotasEmLote} from "../../services/notaService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"
import { buscarClientePorCodigo } from "../../services/clienteService.js"

/**
 * Modal para adicionar uma nota fiscal.
 * O vendedor selecionado é usado automaticamente (não editável).
 */
export default function AddNotaModal({ open, onClose, onSucesso, vendedor }) {
  const [numero, setNumero] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [codigoCliente, setCodigoCliente] = useState("")
  const [clienteEncontrado, setClienteEncontrado] = useState(false)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [valor, setValor] = useState("")
  const [data, setData] = useState("")
  const calendarioRef = useRef(null)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [modo, setModo] = useState(null)
  const [arquivos, setArquivos] = useState([])
  const [lendoPdf, setLendoPdf] = useState(false)
  const [notasImportadas, setNotasImportadas] = useState([])
  const [arquivosInvalidos, setArquivosInvalidos] = useState([])
  const [editandoIndice, setEditandoIndice] = useState(null)
  const [notaEditando, setNotaEditando] = useState(null)
  const toast = useToast()

  function limpar() {
    setNumero("")
    setEmpresa("")
    setCodigoCliente("")
    setClienteEncontrado(false)
    setValor("")
    setData("")
    setArquivos([])
    setNotasImportadas([])
    setArquivosInvalidos([])
    setEditandoIndice(null)
    setNotaEditando(null)
    setModo(null)
    setErros({})
  }

  function fechar() {
    limpar()
    onClose()
  }
  function handleChangeCodigo(e) {
    setCodigoCliente(e.target.value)
    setClienteEncontrado(false)
  }

  async function handleBlurCodigo() {
    const codigo = codigoCliente.trim()
    if (!codigo || !vendedor) return

    setBuscandoCliente(true)
    try {
      const cliente = await buscarClientePorCodigo(vendedor.id, codigo)
      if (cliente) {
        setEmpresa(cliente.nomeEmpresa)
        setClienteEncontrado(true)
      } else {
        setClienteEncontrado(false)
      }
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível buscar o cliente."))
    } finally {
      setBuscandoCliente(false)
    }
  }
  function normalizarValor(valorDigitado) {
    if (!valorDigitado) return ""

    return valorDigitado
        .replace(/\./g, "")
        .replace(",", ".")
  }
  function normalizarData(dataDigitada) {
    if (!dataDigitada) return ""

    const valor = dataDigitada.trim()

    // Formato brasileiro: DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      const [dia, mes, ano] = valor.split("/")
      return `${dia}-${mes}-${ano}`
    }

    // Formato do input date: AAAA-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      const [ano, mes, dia] = valor.split("-")
      return `${dia}-${mes}-${ano}`
    }

    return ""
  }

  function validar() {
    const novos = {}
    if (!numero.trim()) novos.numero = "Informe o número da nota."
    if (!empresa.trim()) novos.empresa = "Informe o nome da empresa."
    if (valor === "" || Number(normalizarValor(valor)) <= 0) novos.valor = "Informe um valor válido."
    if (!normalizarData(data)) {novos.data = "Informe a data no formato DD/MM/AAAA."}
    setErros(novos)
    return Object.keys(novos).length === 0
  }
  async function handleLerPdf() {
    if (arquivos.length === 0) {
      toast.erro("Selecione pelo menos uma nota fiscal em PDF.")
      return
    }

    setLendoPdf(true)

    try {
      const dados = await lerNotasPdf(arquivos)

      const validas = dados
          .filter((item) => item.valida && item.nota)
          .map((item, index) => ({
            ...item.nota,
            nomeArquivo: item.nomeArquivo,
            idLocal: `${item.nota.numeroNotaFiscal}-${index}`
          }))

      const invalidas = dados
          .filter((item) => !item.valida)
          .map((item, index) => ({
            nomeArquivo: item.nomeArquivo,
            erro: item.erro || "Arquivo inválido",
            idLocal: `invalido-${index}`
          }))

      setNotasImportadas(validas)
      setArquivosInvalidos(invalidas)

      if (validas.length === 0) {
        toast.erro("Nenhuma nota fiscal válida foi encontrada.")
      }

    } catch (error) {
      toast.erro(
          getFriendlyError(
              error,
              "Não foi possível ler as notas fiscais."
          )
      )
    } finally {
      setLendoPdf(false)
    }
  }
  function excluirNotaImportada(indice) {
    setNotasImportadas((anteriores) =>
        anteriores.filter((_, i) => i !== indice)
    )
  }

  function abrirEdicaoNota(nota, indice) {
    setEditandoIndice(indice)

    setNotaEditando({
      ...nota,
      numeroNotaFiscal: String(nota.numeroNotaFiscal ?? ""),
      codigoCliente: nota.codigoCliente ?? "",
      nomeEmpresa: nota.nomeEmpresa ?? "",
      valorNotaFiscal:
          nota.valorNotaFiscal != null
              ? Number(nota.valorNotaFiscal).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
              : "",
      dataEmissao: nota.dataEmissao
          ? nota.dataEmissao.replaceAll("-", "/")
          : "",
      cnpj: nota.cnpj ?? "",
      municipio: nota.municipio ?? "",
      transportadora: nota.transportadora ?? ""
    })
  }

  function cancelarEdicaoNota() {
    setEditandoIndice(null)
    setNotaEditando(null)
  }

  function salvarEdicaoNota() {
    if (!notaEditando.numeroNotaFiscal.trim()) {
      toast.erro("Informe o número da nota.")
      return
    }

    if (!notaEditando.nomeEmpresa.trim()) {
      toast.erro("Informe o nome da empresa.")
      return
    }

    if (
        !notaEditando.valorNotaFiscal ||
        Number(normalizarValor(notaEditando.valorNotaFiscal)) <= 0
    ) {
      toast.erro("Informe um valor válido.")
      return
    }

    const dataNormalizada = normalizarData(
        notaEditando.dataEmissao
    )

    if (!dataNormalizada) {
      toast.erro("Informe uma data válida.")
      return
    }

    const notaAtualizada = {
      ...notaEditando,
      numeroNotaFiscal: Number(
          notaEditando.numeroNotaFiscal
      ),
      valorNotaFiscal: Number(
          normalizarValor(notaEditando.valorNotaFiscal)
      ),
      dataEmissao: dataNormalizada
    }

    setNotasImportadas((anteriores) =>
        anteriores.map((nota, indice) =>
            indice === editandoIndice
                ? notaAtualizada
                : nota
        )
    )

    setEditandoIndice(null)
    setNotaEditando(null)
  }

  async function handleSubmit(e) {
    e?.preventDefault()

    if (!validar()) return

    setSalvando(true)

    try {
      await cadastrarNota({
        vendedorId: vendedor.id,
        numeroNotaFiscal: numero,
        nomeEmpresa: empresa.trim(),
        codigoCliente: codigoCliente.trim() || null,
        valorNotaFiscal: normalizarValor(valor),
        dataVenda: normalizarData(data),
        cnpj: null,
        municipio: null,
        transportadora: null
      })

      toast.sucesso("Nota fiscal cadastrada com sucesso!")
      limpar()
      onSucesso()
    } catch (error) {
      toast.erro(
          getFriendlyError(
              error,
              "Não foi possível cadastrar a nota."
          )
      )
    } finally {
      setSalvando(false)
    }
  }
  async function handleConfirmarImportacao() {
    if (notasImportadas.length === 0) {
      toast.erro("Nenhuma nota fiscal para importar.")
      return
    }

    setSalvando(true)

    try {
      const notas = notasImportadas.map((nota) => ({
        vendedorId: vendedor.id,
        numeroNotaFiscal: Number(nota.numeroNotaFiscal),
        nomeEmpresa: nota.nomeEmpresa?.trim() || "",
        codigoCliente: nota.codigoCliente?.trim() || null,
        valorNotaFiscal: Number(nota.valorNotaFiscal),
        dataVenda: nota.dataEmissao,
        cnpj: nota.cnpj?.trim() || null,
        municipio: nota.municipio?.trim() || null,
        transportadora: nota.transportadora?.trim() || null
      }))

      const resultado = await cadastrarNotasEmLote(notas)

      const importadas = resultado.filter(
          (item) => item.importada
      )

      const falhas = resultado.filter(
          (item) => !item.importada
      )

      if (falhas.length === 0) {
        toast.sucesso(
            `${importadas.length} ${
                importadas.length === 1
                    ? "nota importada"
                    : "notas importadas"
            } com sucesso!`
        )

        limpar()
        onSucesso()
        return
      }

      const errosPorIndice = new Map(
          falhas.map((item) => [
            item.indice,
            item.erro || "Não foi possível importar esta nota."
          ])
      )

      setNotasImportadas((anteriores) =>
          anteriores
              .map((nota, indice) => ({
                ...nota,
                erroImportacao: errosPorIndice.get(indice)
              }))
              .filter((nota) => nota.erroImportacao)
      )

      if (importadas.length > 0) {
        onSucesso()
      }

      toast.erro(
          `${importadas.length} importadas e ${falhas.length} não importadas. Confira as notas que permaneceram na tela.`
      )

    } catch (error) {
      toast.erro(
          getFriendlyError(
              error,
              "Não foi possível concluir a importação."
          )
      )
    } finally {
      setSalvando(false)
    }
  }
  return (
    <Modal
      open={open}
      onClose={fechar}
      title="Adicionar nota fiscal"
      footer={
        <>
          <Button
              variant="secondary"
              onClick={fechar}
              disabled={salvando || lendoPdf}
          >
            Cancelar
          </Button>

          {modo === "manual" && (
              <Button
                  onClick={handleSubmit}
                  loading={salvando}
              >
                Cadastrar nota
              </Button>
          )}

          {modo === "pdf" &&
              notasImportadas.length > 0 &&
              editandoIndice === null && (
                  <Button
                      onClick={handleConfirmarImportacao}
                      loading={salvando}
                      disabled={notasImportadas.length === 0}
                  >
                    Importar {notasImportadas.length}{" "}
                    {notasImportadas.length === 1 ? "nota" : "notas"}
                  </Button>
              )}
        </>
      }
    >
      {!modo && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        Vendedor
      </span>

              <div className="rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground">
                {vendedor ? vendedor.nome : "-"}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Como deseja adicionar a nota fiscal?
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                  type="button"
                  onClick={() => setModo("manual")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-5 text-sm font-medium text-foreground transition hover:border-primary hover:bg-muted"
              >
                <Keyboard size={24} />
                Digitar manualmente
              </button>

              <button
                  type="button"
                  onClick={() => setModo("pdf")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-5 text-sm font-medium text-foreground transition hover:border-primary hover:bg-muted"
              >
                <FileText size={24} />
                Importar PDF
              </button>
            </div>
          </div>
      )}

      {modo === "manual" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Vendedor selecionado (somente leitura) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Vendedor</span>
          <div className="rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground">
            {vendedor ? `${vendedor.nome} (ID ${vendedor.id})` : "-"}
          </div>
        </div>
        <Input
            id="n-numero"
            label="Número da nota"
            type="number"
            placeholder="Ex: 13678"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            error={erros.numero}
        />
        <div className="flex flex-col gap-1.5">
          <Input
              id="n-codigo-cliente"
              label="Código do cliente (opcional)"
              placeholder="Ex: 123"
              value={codigoCliente}
              onChange={handleChangeCodigo}
              onBlur={handleBlurCodigo}
          />
          {buscandoCliente && (
              <span className="text-xs text-muted-foreground">Buscando cliente...</span>
          )}
          {!buscandoCliente && clienteEncontrado && (
              <span className="text-xs text-[var(--color-success)]">
              Cliente encontrado: nome preenchido automaticamente.
            </span>
          )}
          {!buscandoCliente && codigoCliente.trim() && !clienteEncontrado && (
              <span className="text-xs text-muted-foreground">
              Código novo — informe o nome da empresa abaixo para cadastrá-lo.
            </span>
          )}
        </div>
        <Input
            id="n-empresa"
            label="Nome da empresa"
            placeholder="Ex: Casa do Pneu"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            error={erros.empresa}
            readOnly={clienteEncontrado}
            className={clienteEncontrado ? "cursor-not-allowed bg-muted" : ""}
        />
        <Input
            id="n-valor"
            label="Valor da nota (R$)"
            type="text"
            inputMode="decimal"
            placeholder="Ex: 1.250,50"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            error={erros.valor}
        />
        <div className="flex flex-col gap-1.5">
          <label
              htmlFor="n-data"
              className="text-sm font-medium text-foreground"
          >
            Data da venda
          </label>

          <div className="relative">
            <input
                id="n-data"
                type="text"
                inputMode="numeric"
                placeholder="Ex: 05/08/2026"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pr-12 text-sm text-foreground outline-none transition focus:border-primary"
            />

            <button
                type="button"
                onClick={() => calendarioRef.current?.showPicker()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Abrir calendário"
                title="Abrir calendário"
            >
              <CalendarDays size={18} />
            </button>

            <input
                ref={calendarioRef}
                type="date"
                className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 opacity-0 pointer-events-none"
                onChange={(e) => {
                  const valor = e.target.value

                  if (!valor) return

                  const [ano, mes, dia] = valor.split("-")
                  setData(`${dia}/${mes}/${ano}`)
                }}
            />
          </div>

          {erros.data && (
              <span className="text-xs text-red-500">
      {erros.data}
    </span>
          )}
        </div>
      </form>
      )}
      {modo === "pdf" &&
          notasImportadas.length === 0 &&
          arquivosInvalidos.length === 0 && (
          <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={() => setModo(null)}
                className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>

            <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        Vendedor
      </span>

              <div className="rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground">
                {vendedor ? vendedor.nome : "-"}
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border px-6 py-10 transition hover:border-primary hover:bg-muted/40">
              <Upload size={28} className="text-muted-foreground" />

              <span className="text-sm font-medium text-foreground">
  Selecionar notas fiscais
</span>

              <span className="text-xs text-muted-foreground">
  Selecione até 50 arquivos PDF
</span>

              <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selecionados = Array.from(
                        e.target.files || []
                    )

                    setArquivos(selecionados)
                  }}
              />
            </label>

            {arquivos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground">
                    {arquivos.length}{" "}
                    {arquivos.length === 1
                        ? "arquivo selecionado"
                        : "arquivos selecionados"}
                  </div>

                  <div className="max-h-32 overflow-y-auto rounded-lg border border-border">
                    {arquivos.map((arquivo, indice) => (
                        <div
                            key={`${arquivo.name}-${indice}`}
                            className="border-b border-border px-3 py-2 text-xs text-muted-foreground last:border-b-0"
                        >
                          {arquivo.name}
                        </div>
                    ))}
                  </div>
                </div>
            )}

            <Button
                onClick={handleLerPdf}
                loading={lendoPdf}
                disabled={arquivos.length === 0}
            >
              {arquivos.length <= 1
                  ? "Ler nota fiscal"
                  : `Ler ${arquivos.length} notas fiscais`}
            </Button>
          </div>
      )}
      {modo === "pdf" &&
          (notasImportadas.length > 0 ||
              arquivosInvalidos.length > 0) &&
          editandoIndice === null && (
              <div className="flex flex-col gap-4">

                <button
                    type="button"
                    onClick={() => {
                      setNotasImportadas([])
                      setArquivosInvalidos([])
                      setArquivos([])
                    }}
                    className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Escolher outros PDFs
                </button>

                <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
        <span className="text-xs text-muted-foreground">
          Vendedor
        </span>

                  <p className="text-sm font-medium text-foreground">
                    {vendedor?.nome || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {notasImportadas.length}{" "}
                    {notasImportadas.length === 1
                        ? "nota válida encontrada"
                        : "notas válidas encontradas"}
                  </p>
                  {arquivosInvalidos.length > 0 && (
                      <p className="text-xs text-red-500">
                        {arquivosInvalidos.length}{" "}
                        {arquivosInvalidos.length === 1
                            ? "arquivo não pôde ser importado"
                            : "arquivos não puderam ser importados"}
                      </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Confira os dados antes de importar.
                  </p>
                  {arquivosInvalidos.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {arquivosInvalidos.map((arquivo) => (
                            <div
                                key={arquivo.idLocal}
                                className="rounded-lg border border-red-200 bg-red-50 p-3"
                            >
                              <p className="text-sm font-medium text-red-700">
                                {arquivo.nomeArquivo}
                              </p>

                              <p className="mt-1 text-xs text-red-600">
                                {arquivo.erro}
                              </p>
                            </div>
                        ))}
                      </div>
                  )}
                </div>

                <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border">
                  {notasImportadas.map((nota, indice) => (
                      <div
                          key={nota.idLocal}
                          className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-b-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  NF {nota.numeroNotaFiscal || "-"}
                </span>

                            <span className="text-xs text-muted-foreground">
                  {nota.dataEmissao
                      ? nota.dataEmissao.replaceAll("-", "/")
                      : "-"}
                </span>
                          </div>

                          <p className="truncate text-sm text-foreground">
                            {nota.nomeEmpresa || "Empresa não identificada"}
                          </p>
                          {nota.erroImportacao && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {nota.erroImportacao}
                              </p>
                          )}

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Cliente: {nota.codigoCliente || "-"}
                </span>

                            <span>
                  {Number(
                      nota.valorNotaFiscal || 0
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </span>

                            <span>
                  {nota.municipio || "-"}
                </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                              type="button"
                              onClick={() =>
                                  abrirEdicaoNota(nota, indice)
                              }
                              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              title="Editar nota"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                              type="button"
                              onClick={() =>
                                  excluirNotaImportada(indice)
                              }
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                              title="Excluir da importação"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                  ))}
                </div>

                <div className="flex justify-between rounded-lg bg-muted px-3.5 py-3">
        <span className="text-sm text-muted-foreground">
          Total
        </span>

                  <span className="text-sm font-semibold text-foreground">
          {notasImportadas
              .reduce(
                  (total, nota) =>
                      total +
                      Number(nota.valorNotaFiscal || 0),
                  0
              )
              .toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })}
        </span>
                </div>
              </div>
          )}
      {modo === "pdf" &&
          editandoIndice !== null &&
          notaEditando && (
              <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-2">

                <button
                    type="button"
                    onClick={cancelarEdicaoNota}
                    className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Voltar para a prévia
                </button>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Editar NF {notaEditando.numeroNotaFiscal}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    A alteração será feita somente nesta importação.
                  </p>
                </div>

                <Input
                    label="Número da nota"
                    value={notaEditando.numeroNotaFiscal}
                    onChange={(e) =>
                        setNotaEditando({
                          ...notaEditando,
                          numeroNotaFiscal: e.target.value
                        })
                    }
                />

                <Input
                    label="Código do cliente"
                    value={notaEditando.codigoCliente}
                    onChange={(e) =>
                        setNotaEditando({
                          ...notaEditando,
                          codigoCliente: e.target.value
                        })
                    }
                />

                <Input
                    label="Nome da empresa"
                    value={notaEditando.nomeEmpresa}
                    onChange={(e) =>
                        setNotaEditando({
                          ...notaEditando,
                          nomeEmpresa: e.target.value
                        })
                    }
                />

                <Input
                    label="Valor da nota (R$)"
                    value={notaEditando.valorNotaFiscal}
                    onChange={(e) =>
                        setNotaEditando({
                          ...notaEditando,
                          valorNotaFiscal: e.target.value
                        })
                    }
                />

                <Input
                    label="Data de emissão"
                    value={notaEditando.dataEmissao}
                    onChange={(e) =>
                        setNotaEditando({
                          ...notaEditando,
                          dataEmissao: e.target.value
                        })
                    }
                />

                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    Dados do cliente
                  </p>

                  <div className="flex flex-col gap-4">
                    <Input
                        label="CPF / CNPJ"
                        placeholder="Ex: 759.337.056-91 ou 18.093.226/0001-40"
                        value={notaEditando.cnpj}
                        onChange={(e) =>
                            setNotaEditando({
                              ...notaEditando,
                              cnpj: e.target.value
                            })
                        }
                    />

                    <Input
                        label="Município"
                        value={notaEditando.municipio}
                        onChange={(e) =>
                            setNotaEditando({
                              ...notaEditando,
                              municipio: e.target.value
                            })
                        }
                    />

                    <Input
                        label="Transportadora"
                        value={notaEditando.transportadora}
                        onChange={(e) =>
                            setNotaEditando({
                              ...notaEditando,
                              transportadora: e.target.value
                            })
                        }
                    />
                  </div>
                </div>

                <Button onClick={salvarEdicaoNota}>
                  Salvar alterações
                </Button>
              </div>
          )}
    </Modal>
  )
}

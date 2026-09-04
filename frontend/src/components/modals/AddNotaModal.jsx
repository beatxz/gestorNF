import { useRef, useState } from "react"
import { CalendarDays, FileText, Keyboard, Upload, ArrowLeft } from "lucide-react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { cadastrarNota, lerNotaPdf } from "../../services/notaService.js"
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
  const [arquivo, setArquivo] = useState(null)
  const [lendoPdf, setLendoPdf] = useState(false)
  const [cnpj, setCnpj] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [transportadora, setTransportadora] = useState("")
  const [previaPdf, setPreviaPdf] = useState(false)
  const toast = useToast()

  function limpar() {
    setNumero("")
    setEmpresa("")
    setCodigoCliente("")
    setClienteEncontrado(false)
    setValor("")
    setData("")
    setCnpj("")
    setMunicipio("")
    setTransportadora("")
    setArquivo(null)
    setModo(null)
    setPreviaPdf(false)
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
    if (!arquivo) {
      toast.erro("Selecione uma nota fiscal em PDF.")
      return
    }

    setLendoPdf(true)

    try {
      const dados = await lerNotaPdf(arquivo)

      setNumero(String(dados.numeroNotaFiscal ?? ""))
      setCodigoCliente(dados.codigoCliente ?? "")
      setEmpresa(dados.nomeEmpresa ?? "")
      setValor(
          dados.valorNotaFiscal != null
              ? Number(dados.valorNotaFiscal).toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2,}) : ""
      )
      setData(
          dados.dataEmissao ? dados.dataEmissao.replaceAll("-", "/") : "")
      setCnpj(dados.cnpj ?? "")
      setMunicipio(dados.municipio ?? "")
      setTransportadora(dados.transportadora ?? "")

      setPreviaPdf(true)
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível ler a nota fiscal.")
      )
    } finally {
      setLendoPdf(false)
    }
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
        cnpj: modo === "pdf" ? cnpj.trim() || null : null,
        municipio: modo === "pdf" ? municipio.trim() || null : null,
        transportadora: modo === "pdf" ? transportadora.trim() || null : null
      })
      toast.sucesso("Nota fiscal cadastrada com sucesso!")
      limpar()
      onSucesso()
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível cadastrar a nota."))
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

          {modo === "pdf" && previaPdf && (
              <Button
                  onClick={handleSubmit}
                  loading={salvando}
              >
                Confirmar importação
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
      {modo === "pdf" && !previaPdf && (
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
        Selecionar nota fiscal
      </span>

              <span className="text-xs text-muted-foreground">
        Somente arquivo PDF
      </span>

              <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selecionado = e.target.files?.[0] ?? null
                    setArquivo(selecionado)
                  }}
              />
            </label>

            {arquivo && (
                <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
                  {arquivo.name}
                </div>
            )}

            <Button
                onClick={handleLerPdf}
                loading={lendoPdf}
                disabled={!arquivo}
            >
              Ler nota fiscal
            </Button>
          </div>
      )}
      {modo === "pdf" && previaPdf && (
          <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={() => {
                  setPreviaPdf(false)
                  setArquivo(null)
                }}
                className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Escolher outro PDF
            </button>

            <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
      <span className="text-xs text-muted-foreground">
        Vendedor
      </span>
              <p className="text-sm font-medium text-foreground">
                {vendedor?.nome || "-"}
              </p>
            </div>

            <Input
                id="pdf-numero"
                label="Número da nota"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                error={erros.numero}
            />

            <Input
                id="pdf-codigo"
                label="Código do cliente"
                value={codigoCliente}
                onChange={(e) => setCodigoCliente(e.target.value)}
            />

            <Input
                id="pdf-empresa"
                label="Nome da empresa"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                error={erros.empresa}
            />

            <Input
                id="pdf-valor"
                label="Valor da nota (R$)"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                error={erros.valor}
            />

            <Input
                id="pdf-data"
                label="Data de emissão"
                value={data}
                onChange={(e) => setData(e.target.value)}
                error={erros.data}
            />

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Dados do cliente
              </p>

              <div className="flex flex-col gap-4">
                <Input
                    id="pdf-cnpj"
                    label="CNPJ"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                />

                <Input
                    id="pdf-municipio"
                    label="Município"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                />

                <Input
                    id="pdf-transportadora"
                    label="Transportadora"
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                />
              </div>
            </div>
          </div>
      )}
    </Modal>
  )
}

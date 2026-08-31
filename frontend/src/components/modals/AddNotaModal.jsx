import { useState } from "react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { cadastrarNota } from "../../services/notaService.js"
import { getFriendlyError } from "../../services/api.js"
import { dataInputParaBackend } from "../../utils/format.js"
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
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const toast = useToast()

  function limpar() {
    setNumero("")
    setEmpresa("")
    setCodigoCliente("")
    setClienteEncontrado(false)
    setValor("")
    setData("")
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

  function validar() {
    const novos = {}
    if (!numero.trim()) novos.numero = "Informe o número da nota."
    if (!empresa.trim()) novos.empresa = "Informe o nome da empresa."
    if (valor === "" || Number(valor) <= 0) novos.valor = "Informe um valor válido."
    if (!data) novos.data = "Informe a data da venda."
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setSalvando(true)
    try {
      await cadastrarNota({
        vendedorId: vendedor.id,
        numeroNotaFiscal: numero,
        nomeEmpresa: empresa.trim(),
        codigoCliente: codigoCliente.trim() || null,
        valorNotaFiscal: valor,
        dataVenda: dataInputParaBackend(data),
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
          <Button variant="secondary" onClick={fechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={salvando}>
            Cadastrar nota
          </Button>
        </>
      }
    >
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
          type="number"
          step="0.01"
          placeholder="Ex: 300"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          error={erros.valor}
        />
        <Input
          id="n-data"
          label="Data da venda"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          error={erros.data}
        />
      </form>
    </Modal>
  )
}

import { useState } from "react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { cadastrarVendedor } from "../../services/vendedorService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"

/**
 * Modal para cadastrar um novo vendedor (nome + comissão).
 */
export default function AddVendedorModal({ open, onClose, onSucesso }) {
  const [nome, setNome] = useState("")
  const [comissao, setComissao] = useState("")
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const toast = useToast()

  function limpar() {
    setNome("")
    setComissao("")
    setErros({})
  }

  function fechar() {
    limpar()
    onClose()
  }

  function validar() {
    const novos = {}
    if (!nome.trim()) novos.nome = "Informe o nome."
    if (comissao === "" || Number.isNaN(Number(comissao))) novos.comissao = "Informe a comissão."
    else if (Number(comissao) < 0) novos.comissao = "A comissão não pode ser negativa."
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setSalvando(true)
    try {
      const novo = await cadastrarVendedor({ nome: nome.trim(), comissao })
      toast.sucesso("Vendedor cadastrado com sucesso!")
      limpar()
      onSucesso(novo)
    } catch (error) {
      const mensagemBackend =
          error.response?.data?.message ||
          error.response?.data?.mensagem ||
          error.response?.data

      if (
          typeof mensagemBackend === "string" &&
          mensagemBackend.toLowerCase().includes("comiss")
      ) {
        toast.erro(
            "Cadastre a comissão geral da sua empresa antes de adicionar um vendedor."
        )
      } else {
        toast.erro(
            getFriendlyError(error, "Não foi possível cadastrar o vendedor.")
        )
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={fechar}
      title="Adicionar vendedor"
      footer={
        <>
          <Button variant="secondary" onClick={fechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={salvando} form="form-vendedor">
            Cadastrar vendedor
          </Button>
        </>
      }
    >
      <form id="form-vendedor" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          id="v-nome"
          label="Nome"
          placeholder="Nome do vendedor"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
        />
        <Input
          id="v-comissao"
          label="Comissão (%)"
          type="number"
          step="0.01"
          placeholder="Ex: 5"
          value={comissao}
          onChange={(e) => setComissao(e.target.value)}
          error={erros.comissao}
        />
      </form>
    </Modal>
  )
}

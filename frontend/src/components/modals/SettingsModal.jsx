import { useState } from "react"
import { Percent, UserMinus, Trash2 } from "lucide-react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import ConfirmDialog from "../ui/ConfirmDialog.jsx"
import { alterarComissao, deletarVendedor } from "../../services/vendedorService.js"
import { deletarUsuario } from "../../services/authService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"
import { useAuth } from "../../hooks/useAuth.jsx"

/**
 * Central de configurações (abre pelo ícone de engrenagem).
 * Abas: Alterar comissão, Deletar vendedor, Deletar usuário.
 */
export default function SettingsModal({ open, onClose, vendedores, onVendedoresMudaram }) {
  const [aba, setAba] = useState("comissao")

  const abas = [
    { id: "comissao", rotulo: "Alterar comissão", icon: Percent },
    { id: "delVendedor", rotulo: "Deletar vendedor", icon: UserMinus },
    { id: "delUsuario", rotulo: "Deletar usuário", icon: Trash2 },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Configurações" maxWidth="max-w-lg">
      {/* Navegação por abas */}
      <div className="mb-5 flex gap-1 rounded-lg bg-muted p-1">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              aba === a.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <a.icon size={15} />
            <span className="hidden sm:inline">{a.rotulo}</span>
          </button>
        ))}
      </div>

      {aba === "comissao" && (
        <AbaComissao vendedores={vendedores} onSucesso={onVendedoresMudaram} />
      )}
      {aba === "delVendedor" && (
        <AbaDeletarVendedor vendedores={vendedores} onSucesso={onVendedoresMudaram} />
      )}
      {aba === "delUsuario" && <AbaDeletarUsuario />}
    </Modal>
  )
}

/* --- Alterar comissão --- */
function AbaComissao({ vendedores, onSucesso }) {
  const [id, setId] = useState("")
  const [comissao, setComissao] = useState("")
  const [salvando, setSalvando] = useState(false)
  const toast = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!id) return toast.erro("Selecione um vendedor.")
    if (comissao === "" || Number(comissao) < 0) return toast.erro("Informe uma comissão válida.")
    setSalvando(true)
    try {
      await alterarComissao(id, comissao)
      toast.sucesso("Comissão atualizada com sucesso!")
      setComissao("")
      onSucesso()
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível alterar a comissão."))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SelectVendedor value={id} onChange={setId} vendedores={vendedores} />
      <Input
        id="nova-comissao"
        label="Nova comissão (%)"
        type="number"
        step="0.01"
        placeholder="Ex: 7"
        value={comissao}
        onChange={(e) => setComissao(e.target.value)}
      />
      <Button type="submit" loading={salvando} className="self-end">
        Salvar comissão
      </Button>
    </form>
  )
}

/* --- Deletar vendedor --- */
function AbaDeletarVendedor({ vendedores, onSucesso }) {
  const [id, setId] = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const toast = useToast()

  async function handleExcluir() {
    setExcluindo(true)
    try {
      await deletarVendedor(id)
      toast.sucesso("Vendedor excluído com sucesso!")
      setConfirmando(false)
      setId("")
      onSucesso()
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível excluir o vendedor."))
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SelectVendedor value={id} onChange={setId} vendedores={vendedores} />
      <div className="rounded-lg bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
        A exclusão do vendedor também removerá todas as suas notas fiscais.
      </div>
      <Button
        variant="danger"
        className="self-end"
        disabled={!id}
        onClick={() => setConfirmando(true)}
      >
        <UserMinus size={16} />
        Deletar vendedor
      </Button>

      <ConfirmDialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={handleExcluir}
        title="Deletar vendedor"
        message="Tem certeza? O vendedor e todas as suas notas fiscais serão removidos permanentemente."
        confirmLabel="Deletar"
        loading={excluindo}
      />
    </div>
  )
}

/* --- Deletar usuário --- */
function AbaDeletarUsuario() {
  const [email, setEmail] = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const toast = useToast()
  const { sair } = useAuth()

  async function handleExcluir() {
    setExcluindo(true)
    try {
      await deletarUsuario(email.trim())
      toast.sucesso("Conta excluída. Você será redirecionado.")
      setConfirmando(false)
      setTimeout(() => sair(), 800)
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível excluir o usuário."))
      setExcluindo(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="del-email"
        label="E-mail da conta"
        type="email"
        placeholder="voce@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="rounded-lg bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
        Esta ação é permanente e encerrará sua sessão.
      </div>
      <Button
        variant="danger"
        className="self-end"
        disabled={!email.trim()}
        onClick={() => setConfirmando(true)}
      >
        <Trash2 size={16} />
        Deletar usuário
      </Button>

      <ConfirmDialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={handleExcluir}
        title="Deletar usuário"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
        confirmLabel="Deletar conta"
        loading={excluindo}
      />
    </div>
  )
}

/* --- Seletor de vendedor reutilizável --- */
function SelectVendedor({ value, onChange, vendedores }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="sel-vendedor" className="text-sm font-medium text-foreground">
        Vendedor
      </label>
      <select
        id="sel-vendedor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
      >
        <option value="">Selecione um vendedor</option>
        {vendedores.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nome} (ID {v.id})
          </option>
        ))}
      </select>
    </div>
  )
}

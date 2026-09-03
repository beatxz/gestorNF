import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import Modal from "../ui/Modal.jsx"
import Button from "../ui/Button.jsx"
import ConfirmDialog from "../ui/ConfirmDialog.jsx"
import { deletarNota } from "../../services/notaService.js"
import { getFriendlyError } from "../../services/api.js"
import { formatarMoeda, formatarData } from "../../utils/format.js"
import { useToast } from "../../hooks/useToast.jsx"

/**
 * Modal com os detalhes de uma nota fiscal e as ações "Ver detalhes" / "Excluir nota".
 * A confirmação de exclusão é exibida antes de remover.
 */
export default function NotaDetalheModal({ open, onClose, nota, vendedor, onExcluida,onEditar }) {
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const toast = useToast()

  if (!nota) return null

  const linhas = [
    { rotulo: "Número da nota", valor: nota.numeroNotaFiscal },
    { rotulo: "Empresa", valor: nota.nomeEmpresa },
    { rotulo: "Valor", valor: formatarMoeda(nota.valorNotaFiscal) },
    { rotulo: "Data da venda", valor: formatarData(nota.dataVenda) },
    { rotulo: "Vendedor", valor: vendedor ? `${vendedor.nome} (ID ${vendedor.id})` : "-" },
  ]

  async function handleExcluir() {
    setExcluindo(true)
    try {
      await deletarNota(nota.numeroNotaFiscal)
      toast.sucesso("Nota fiscal excluída com sucesso!")
      setConfirmando(false)
      onExcluida()
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível excluir a nota."))
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Detalhes da nota fiscal"
        footer={
          <>
            <Button
                variant="secondary"
                onClick={onClose}
            >
              Fechar
            </Button>

            <Button
                variant="outline"
                onClick={() => onEditar(nota)}
            >
              <Pencil size={16} />
              Editar nota
            </Button>

            <Button
                variant="danger"
                onClick={() =>
                    setConfirmando(true)
                }
            >
              <Trash2 size={16} />
              Excluir nota
            </Button>
          </>
        }
      >
        <dl className="flex flex-col gap-3">
          {linhas.map((l) => (
            <div key={l.rotulo} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <dt className="text-sm text-muted-foreground">{l.rotulo}</dt>
              <dd className="text-sm font-medium text-foreground">{l.valor}</dd>
            </div>
          ))}
        </dl>
      </Modal>

      <ConfirmDialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={handleExcluir}
        title="Excluir nota fiscal"
        message="Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={excluindo}
      />
    </>
  )
}

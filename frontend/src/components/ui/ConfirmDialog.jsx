import { AlertTriangle } from "lucide-react"
import Modal from "./Modal"
import Button from "./Button"

/**
 * Diálogo de confirmação reutilizável para ações destrutivas.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message,
  confirmLabel = "Confirmar",
  loading = false,
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {danger && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]">
            <AlertTriangle size={20} />
          </div>
        )}
        <p className="text-sm leading-relaxed text-card-foreground text-pretty">{message}</p>
      </div>
    </Modal>
  )
}

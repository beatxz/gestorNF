import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

/**
 * Sistema simples de notificações (toasts) para feedback de ações:
 * sucesso, erro e informação.
 */
const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remover = useCallback((id) => {
    setToasts((atual) => atual.filter((t) => t.id !== id))
  }, [])

  const adicionar = useCallback(
    (mensagem, tipo = "info") => {
      const id = ++idCounter
      setToasts((atual) => [...atual, { id, mensagem, tipo }])
      setTimeout(() => remover(id), 4000)
    },
    [remover],
  )

  const toast = {
    sucesso: (msg) => adicionar(msg, "sucesso"),
    erro: (msg) => adicionar(msg, "erro"),
    info: (msg) => adicionar(msg, "info"),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remover(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const config = {
    sucesso: {
      icon: CheckCircle2,
      classe: "border-l-4 border-l-[var(--color-success)] text-[var(--color-success)]",
    },
    erro: {
      icon: XCircle,
      classe: "border-l-4 border-l-[var(--color-destructive)] text-[var(--color-destructive)]",
    },
    info: {
      icon: Info,
      classe: "border-l-4 border-l-[var(--color-accent)] text-[var(--color-accent)]",
    },
  }
  const { icon: Icon, classe } = config[toast.tipo] || config.info

  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-lg bg-card p-4 shadow-lg ring-1 ring-border animate-fade-in ${classe}`}
      role="status"
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm leading-relaxed text-card-foreground">{toast.mensagem}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider")
  return ctx
}

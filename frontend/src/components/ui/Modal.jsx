import { useEffect } from "react"
import { X } from "lucide-react"

/**
 * Modal genérico centralizado, com overlay e fechamento por ESC ou clique fora.
 */
export default function Modal({ open, onClose, title, children, footer, maxWidth = "max-w-md" }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`w-full ${maxWidth} rounded-xl bg-card shadow-2xl animate-scale-in`}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-card-foreground text-balance">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

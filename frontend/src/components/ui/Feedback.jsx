import { Loader2 } from "lucide-react"

/**
 * Componentes de feedback: carregamento e estado vazio.
 */

export function Spinner({ size = 24, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-accent ${className}`} />
}

export function LoadingBlock({ mensagem = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
      <Spinner size={28} />
      <span className="text-sm">{mensagem}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, titulo, descricao, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="font-medium text-foreground">{titulo}</p>
        {descricao && <p className="mt-1 text-sm text-muted-foreground text-pretty">{descricao}</p>}
      </div>
      {children}
    </div>
  )
}

import { Loader2 } from "lucide-react"

/**
 * Botão reutilizável com variantes de estilo e estado de carregamento.
 * Variantes: primary, secondary, ghost, danger, outline
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"

  const variants = {
    primary: "bg-accent text-accent-foreground hover:brightness-110 shadow-sm",
    secondary: "bg-muted text-foreground hover:bg-border",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:brightness-110 shadow-sm",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

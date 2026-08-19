/**
 * Campo de formulário reutilizável com rótulo e mensagem de erro opcional.
 */
export default function Input({ label, id, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
          error ? "border-[var(--color-destructive)]" : "border-input"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--color-destructive)]">{error}</span>}
    </div>
  )
}

import { rotuloMes } from "../utils/format.js"

/**
 * Seletor de mês/ano. Usa um input nativo type="month" (retorna "yyyy-MM"),
 * exatamente o formato YearMonth esperado pelo backend.
 */
export default function MonthPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="mes" className="text-sm text-muted-foreground">
        Mês:
      </label>
      <div className="relative">
        <input
          id="mes"
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          aria-label={`Mês selecionado: ${rotuloMes(value)}`}
        />
      </div>
    </div>
  )
}

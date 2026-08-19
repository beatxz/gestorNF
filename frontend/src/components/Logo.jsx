import { Receipt } from "lucide-react"

/**
 * Marca do sistema: ícone + nome GestorNF.
 * variant "light" para fundos escuros, "dark" para fundos claros.
 */
export default function Logo({ variant = "dark", size = "md" }) {
  const textColor = variant === "light" ? "text-white" : "text-primary"
  const iconSize = size === "lg" ? 24 : 18
  const iconBox = size === "lg" ? "h-11 w-11" : "h-9 w-9"
  const textSize = size === "lg" ? "text-2xl" : "text-lg"

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex ${iconBox} items-center justify-center rounded-lg bg-accent text-accent-foreground`}>
        <Receipt size={iconSize} />
      </div>
      <span className={`${textSize} font-bold tracking-tight ${textColor}`}>
        Gestor<span className="text-accent">NF</span>
      </span>
    </div>
  )
}

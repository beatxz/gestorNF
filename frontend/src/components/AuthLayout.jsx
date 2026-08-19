import Logo from "./Logo.jsx"

/**
 * Layout das telas de autenticação: painel de marca à esquerda (desktop)
 * e o formulário à direita.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Painel institucional (visível em telas médias para cima) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
        <Logo variant="light" size="lg" />
        <div>
          <h1 className="max-w-md text-4xl font-bold leading-tight text-white text-balance">
            Gerencie vendedores e notas fiscais em um só lugar.
          </h1>
          <p className="mt-4 max-w-sm text-[var(--color-sidebar-foreground)] leading-relaxed text-pretty">
            Acompanhe vendas mensais, comissões e o histórico de notas de cada vendedor com clareza e organização.
          </p>
        </div>
        <p className="text-sm text-[var(--color-sidebar-foreground)]">
          © {new Date().getFullYear()} GestorNF — Sistema de gestão de notas fiscais.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

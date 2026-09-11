import { Link, useSearchParams } from "react-router-dom"

export default function LegalLayout({ titulo, atualizadoEm, children }) {
    const [searchParams] = useSearchParams()

    const origem = searchParams.get("origem")
    const token = searchParams.get("token")

    const veioDoConvite =
        origem === "convite" &&
        typeof token === "string" &&
        token.trim() !== ""

    const rotaPolitica = veioDoConvite
        ? `/politica-de-privacidade?origem=convite&token=${encodeURIComponent(token)}`
        : "/politica-de-privacidade"

    const rotaTermos = veioDoConvite
        ? `/termos-de-uso?origem=convite&token=${encodeURIComponent(token)}`
        : "/termos-de-uso"

    function voltar() {
        if (veioDoConvite) {
            window.close()
            return
        }

        window.location.href = "/login"
    }

    return (
        <main className="min-h-screen bg-background px-4 py-10 text-foreground">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={voltar}
                        className="text-sm font-medium text-accent hover:underline"
                    >
                        {veioDoConvite
                            ? "← Fechar e voltar para a ativação"
                            : "← Voltar para o GestorNF"}
                    </button>

                    <h1 className="mt-5 text-3xl font-bold">
                        {titulo}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Última atualização: {atualizadoEm}
                    </p>
                </div>

                <article className="space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    {children}
                </article>

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                    <Link
                        to={rotaPolitica}
                        className="text-accent hover:underline"
                    >
                        Política de Privacidade
                    </Link>

                    <Link
                        to={rotaTermos}
                        className="text-accent hover:underline"
                    >
                        Termos de Uso
                    </Link>
                </div>
            </div>
        </main>
    )
}

export function SecaoLegal({ titulo, children }) {
    return (
        <section>
            <h2 className="mb-3 text-xl font-semibold">
                {titulo}
            </h2>

            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                {children}
            </div>
        </section>
    )
}
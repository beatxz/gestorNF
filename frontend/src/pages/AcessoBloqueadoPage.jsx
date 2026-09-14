import {
    Clock3,
    LogOut,
    ShieldX,
} from "lucide-react"

import {useNavigate } from "react-router-dom"

import Button from "../components/ui/Button.jsx"
import { useAuth } from "../hooks/useAuth.jsx"

export default function AcessoBloqueadoPage() {
    const navigate = useNavigate()

    const { sair } = useAuth()

    const motivo =
        location.state?.motivo ||
        sessionStorage.getItem(
            "gestornf_motivo_bloqueio",
        ) ||
        "Seu acesso ao GestorNF está temporariamente indisponível."

    const testeEncerrado =
        motivo
            .toLowerCase()
            .includes("período de teste")

    function handleSair() {
        sessionStorage.removeItem(
            "gestornf_motivo_bloqueio",
        )

        sair()

        navigate(
            "/login",
            {
                replace: true,
            },
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">

            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">

                <div className="flex justify-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">

                        {testeEncerrado ? (
                            <Clock3 size={26} />
                        ) : (
                            <ShieldX size={26} />
                        )}

                    </div>

                </div>

                <div className="mt-6 text-center">

                    <h1 className="text-2xl font-bold text-foreground">

                        {testeEncerrado
                            ? "Seu período gratuito terminou"
                            : "Acesso temporariamente suspenso"}

                    </h1>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {motivo}
                    </p>

                </div>

                <div className="mt-8 rounded-xl bg-muted p-4">

                    <p className="text-sm text-muted-foreground">

                        Para continuar utilizando vendedores, clientes,
                        notas fiscais, relatórios e demais recursos do
                        GestorNF, entre em contato com o suporte.

                    </p>

                </div>

                <div className="mt-6 flex flex-col gap-3">

                    <a
                        href="mailto:gestordenotasfiscais@gmail.com"
                        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:brightness-110"
                    >
                        Entrar em contato
                    </a>

                    <Button
                        variant="outline"
                        onClick={handleSair}
                    >
                        <LogOut size={16} />

                        Sair
                    </Button>

                </div>

            </div>

        </div>
    )
}
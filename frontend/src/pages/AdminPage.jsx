import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Mail,
    RefreshCw,
    ShieldCheck,
    Trash2,
} from "lucide-react"

import Button from "../components/ui/Button.jsx"
import Input from "../components/ui/Input.jsx"

import {
    cancelarConvite,
    enviarConvite,
    listarConvites,
} from "../services/adminService.js"

import { getFriendlyError } from "../services/api.js"

function formatarData(data) {
    if (!data) return "-"

    const date = new Date(data)

    if (Number.isNaN(date.getTime())) {
        return "-"
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date)
}

function estiloStatus(status) {
    const estilos = {
        PENDENTE:
            "bg-amber-100 text-amber-800",
        ACEITO:
            "bg-green-100 text-green-800",
        CANCELADO:
            "bg-red-100 text-red-800",
        EXPIRADO:
            "bg-muted text-muted-foreground",
    }

    return (
        estilos[status] ||
        "bg-muted text-muted-foreground"
    )
}

export default function AdminPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [convites, setConvites] = useState([])

    const [carregando, setCarregando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [cancelandoId, setCancelandoId] = useState(null)

    const [erro, setErro] = useState("")
    const [sucesso, setSucesso] = useState("")

    const carregarConvites = useCallback(async () => {
        try {
            setErro("")

            const dados = await listarConvites()

            setConvites(
                Array.isArray(dados) ? dados : [],
            )
        } catch (error) {
            if (error?.response?.status === 403) {
                navigate("/", {
                    replace: true,
                })
                return
            }

            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível carregar os convites.",
                ),
            )
        } finally {
            setCarregando(false)
        }
    }, [navigate])

    useEffect(() => {
        carregarConvites()
    }, [carregarConvites])

    async function handleEnviar(event) {
        event.preventDefault()

        setErro("")
        setSucesso("")

        const emailLimpo = email.trim()

        if (!emailLimpo) {
            setErro("Informe o e-mail que receberá o convite.")
            return
        }

        try {
            setEnviando(true)

            await enviarConvite(emailLimpo)

            setEmail("")

            setSucesso(
                "Convite enviado com sucesso.",
            )

            await carregarConvites()
        } catch (error) {
            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível enviar o convite.",
                ),
            )
        } finally {
            setEnviando(false)
        }
    }

    async function handleCancelar(convite) {
        const confirmou = window.confirm(
            `Deseja cancelar o convite enviado para ${convite.email}?`,
        )

        if (!confirmou) {
            return
        }

        try {
            setErro("")
            setSucesso("")
            setCancelandoId(convite.id)

            await cancelarConvite(convite.id)

            setSucesso(
                "Convite cancelado com sucesso.",
            )

            await carregarConvites()
        } catch (error) {
            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível cancelar o convite.",
                ),
            )
        } finally {
            setCancelandoId(null)
        }
    }
    if (carregando) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground">
                    Verificando acesso...
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft size={16} />
                            Voltar
                        </Button>

                        <div>
                            <h1 className="text-lg font-semibold text-foreground">
                                Administração
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Convites de acesso ao GestorNF
                            </p>
                        </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <ShieldCheck size={20} />
                    </div>
                </div>
            </header>

            <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
                <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-foreground">
                            Convidar novo usuário
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            O usuário receberá um e-mail com um link de ativação válido por 24 horas.
                        </p>
                    </div>

                    <form
                        onSubmit={handleEnviar}
                        className="flex flex-col gap-3 sm:flex-row sm:items-end"
                    >
                        <div className="flex-1">
                            <Input
                                id="emailConvite"
                                label="E-mail"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="cliente@empresa.com"
                                autoComplete="email"
                            />
                        </div>

                        <Button
                            type="submit"
                            loading={enviando}
                            disabled={enviando}
                            className="sm:min-w-40"
                        >
                            <Mail size={16} />
                            Enviar convite
                        </Button>
                    </form>

                    {erro && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-[var(--color-destructive)]">
                                {erro}
                            </p>
                        </div>
                    )}

                    {sucesso && (
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <p className="text-sm text-green-700">
                                {sucesso}
                            </p>
                        </div>
                    )}
                </section>

                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <div>
                            <h2 className="font-semibold text-foreground">
                                Convites
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {convites.length} convite(s)
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={carregarConvites}
                            disabled={carregando}
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    carregando
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Atualizar
                        </Button>
                    </div>

                    {carregando ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Carregando convites...
                        </div>
                    ) : convites.length === 0 ? (
                        <div className="p-8 text-center">
                            <Mail
                                size={28}
                                className="mx-auto mb-3 text-muted-foreground"
                            />

                            <p className="font-medium text-foreground">
                                Nenhum convite enviado
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Seus convites aparecerão aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    <th className="px-6 py-3">
                                        E-mail
                                    </th>

                                    <th className="px-6 py-3">
                                        Status
                                    </th>

                                    <th className="px-6 py-3">
                                        Enviado
                                    </th>

                                    <th className="px-6 py-3">
                                        Expira
                                    </th>

                                    <th className="px-6 py-3">
                                        Aceito
                                    </th>

                                    <th className="px-6 py-3 text-right">
                                        Ações
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {convites.map((convite) => (
                                    <tr
                                        key={convite.id}
                                        className="border-b border-border last:border-b-0"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-foreground">
                                                {convite.email}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                        <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${estiloStatus(
                                convite.status,
                            )}`}
                        >
                          {convite.status}
                        </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {formatarData(
                                                convite.criadoEm,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {formatarData(
                                                convite.expiraEm,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {formatarData(
                                                convite.aceitoEm,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {convite.status ===
                                            "PENDENTE" ? (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    loading={
                                                        cancelandoId ===
                                                        convite.id
                                                    }
                                                    onClick={() =>
                                                        handleCancelar(
                                                            convite,
                                                        )
                                                    }
                                                >
                                                    <Trash2
                                                        size={14}
                                                    />

                                                    Cancelar
                                                </Button>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                            —
                          </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
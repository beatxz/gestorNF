import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import AuthLayout from "../components/AuthLayout.jsx"
import Input from "../components/ui/Input.jsx"
import Button from "../components/ui/Button.jsx"

import {
    aceitarConvite,
    validarConvite,
} from "../services/conviteService.js"

import { validarSenhaForte } from "../utils/password.js"

function obterMensagemErro(error) {
    const data = error?.response?.data

    if (typeof data === "string" && data.trim()) {
        return data
    }

    if (typeof data?.message === "string" && data.message.trim()) {
        return data.message
    }

    if (typeof data?.erro === "string" && data.erro.trim()) {
        return data.erro
    }

    if (typeof data?.error === "string" && data.error.trim()) {
        return data.error
    }

    return "Não foi possível concluir a operação."
}

export default function ConvitePage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const token = searchParams.get("token")

    const [email, setEmail] = useState("")
    const [nome, setNome] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [aceitouDocumentos, setAceitouDocumentos] = useState(false)

    const [carregandoConvite, setCarregandoConvite] = useState(true)
    const [ativando, setAtivando] = useState(false)

    const [erroConvite, setErroConvite] = useState("")
    const [erroFormulario, setErroFormulario] = useState("")
    const [sucesso, setSucesso] = useState(false)

    useEffect(() => {
        async function carregarConvite() {
            if (!token) {
                setErroConvite("O link de convite é inválido.")
                setCarregandoConvite(false)
                return
            }

            try {
                const convite = await validarConvite(token)

                setEmail(convite.email || "")
            } catch (error) {
                setErroConvite(
                    obterMensagemErro(error) ||
                    "Este convite é inválido ou não está mais disponível.",
                )
            } finally {
                setCarregandoConvite(false)
            }
        }

        carregarConvite()
    }, [token])

    async function handleSubmit(event) {
        event.preventDefault()

        setErroFormulario("")

        const nomeLimpo = nome.trim()

        if (!nomeLimpo) {
            setErroFormulario("Informe seu nome.")
            return
        }

        if (nomeLimpo.length < 2) {
            setErroFormulario("O nome deve ter pelo menos 2 caracteres.")
            return
        }

        const erroSenha = validarSenhaForte(senha)

        if (erroSenha) {
            setErroFormulario(erroSenha)
            return
        }

        if (senha !== confirmarSenha) {
            setErroFormulario("As senhas não coincidem.")
            return
        }

        if (!aceitouDocumentos) {
            setErroFormulario(
                "Você precisa aceitar os Termos de Uso e declarar ciência da Política de Privacidade.",
            )
            return
        }

        try {
            setAtivando(true)

            await aceitarConvite({
                token,
                nome: nomeLimpo,
                senha,
            })

            setSucesso(true)

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                })
            }, 2000)
        } catch (error) {
            setErroFormulario(obterMensagemErro(error))
        } finally {
            setAtivando(false)
        }
    }

    if (carregandoConvite) {
        return (
            <AuthLayout>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">
                        Validando convite
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Aguarde um instante...
                    </p>
                </div>
            </AuthLayout>
        )
    }

    if (erroConvite) {
        return (
            <AuthLayout>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <AlertCircle
                            size={24}
                            className="text-[var(--color-destructive)]"
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground">
                        Convite indisponível
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {erroConvite}
                    </p>

                    <Link
                        to="/login"
                        className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
                    >
                        Ir para o login
                    </Link>
                </div>
            </AuthLayout>
        )
    }

    if (sucesso) {
        return (
            <AuthLayout>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle2 size={25} className="text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground">
                        Conta ativada
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Sua conta no GestorNF foi criada com sucesso.
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Você será direcionado para o login.
                    </p>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground">
                    Ativar sua conta
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Complete seus dados para começar a usar o GestorNF.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <Input
                    id="email"
                    label="E-mail"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className="cursor-not-allowed bg-muted"
                />

                <Input
                    id="nome"
                    label="Nome"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Digite seu nome"
                    autoComplete="name"
                    maxLength={100}
                />

                <Input
                    id="senha"
                    label="Senha"
                    type="password"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="Crie uma senha"
                    autoComplete="new-password"
                />

                <Input
                    id="confirmarSenha"
                    label="Confirmar senha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(event) =>
                        setConfirmarSenha(event.target.value)
                    }
                    placeholder="Digite sua senha novamente"
                    autoComplete="new-password"
                />

                <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">
                    Use pelo menos 8 caracteres, incluindo letra maiúscula,
                    minúscula, número e caractere especial.
                </p>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                    <input
                        type="checkbox"
                        checked={aceitouDocumentos}
                        onChange={(event) =>
                            setAceitouDocumentos(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                    />

                    <span className="text-xs leading-relaxed text-muted-foreground">
            Li e concordo com os{" "}
                        <a
                            href={`/termos-de-uso?origem=convite&token=${encodeURIComponent(token)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-accent hover:underline"
                            onClick={(event) => event.stopPropagation()}
                        >
              Termos de Uso
            </a>{" "}
                        e declaro estar ciente da{" "}
                        <a
                            href={`/politica-de-privacidade?origem=convite&token=${encodeURIComponent(token)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-accent hover:underline"
                            onClick={(event) => event.stopPropagation()}
                        >
              Política de Privacidade
            </a>
            .
          </span>
                </label>

                {erroFormulario && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                        <p className="text-sm text-[var(--color-destructive)]">
                            {erroFormulario}
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    size="lg"
                    loading={ativando}
                    disabled={ativando}
                    className="mt-1 w-full"
                >
                    Ativar minha conta
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Já possui uma conta?{" "}
                <Link
                    to="/login"
                    className="font-medium text-accent hover:underline"
                >
                    Entrar
                </Link>
            </p>
        </AuthLayout>
    )
}
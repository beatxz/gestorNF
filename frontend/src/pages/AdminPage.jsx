import {
    useCallback,
    useEffect,
    useState,
} from "react"

import {
    Ban,
    CircleDollarSign,
    Clock3,
    LayoutDashboard,
    LogOut,
    Mail,
    RefreshCw,
    RotateCcw,
    ShieldCheck,
    Trash2,
    Users,
    WalletCards,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

import Button from "../components/ui/Button.jsx"
import Input from "../components/ui/Input.jsx"

import {
    buscarResumoAdmin,
    cancelarConvite,
    configurarAssinatura,
    enviarConvite,
    listarClientesAdmin,
    listarConvites,
    reativarAssinatura,
    suspenderAssinatura,
    registrarPagamento,
} from "../services/adminService.js"

import { getFriendlyError } from "../services/api.js"
import { useAuth } from "../hooks/useAuth.jsx"


function formatarData(data) {

    if (!data) return "-"

    const date = new Date(data)

    if (Number.isNaN(date.getTime())) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        },
    ).format(date)
}


function formatarDataSimples(data) {

    if (!data) return "-"

    const [ano, mes, dia] = data.split("-")

    if (!ano || !mes || !dia) {
        return data
    }

    return `${dia}/${mes}/${ano}`
}


function formatarMoeda(valor) {

    const numero = Number(valor ?? 0)

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    ).format(numero)
}


function formatarTempoTeste(minutos) {

    if (minutos == null) return "-"

    if (minutos <= 0) {
        return "Teste encerrado"
    }

    const dias = Math.floor(
        minutos / 1440,
    )

    const horas = Math.floor(
        (minutos % 1440) / 60,
    )

    const minutosRestantes =
        minutos % 60

    if (dias > 0) {

        return `${dias}d ${horas}h`
    }

    if (horas > 0) {

        return `${horas}h ${minutosRestantes}min`
    }

    return `${minutosRestantes}min`
}


function estiloStatusConvite(status) {

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


function estiloStatusAssinatura(status) {

    const estilos = {

        EM_TESTE:
            "bg-blue-100 text-blue-800",

        ATIVO:
            "bg-green-100 text-green-800",

        SUSPENSO:
            "bg-red-100 text-red-800",

        CANCELADO:
            "bg-muted text-muted-foreground",
    }

    return (
        estilos[status] ||
        "bg-amber-100 text-amber-800"
    )
}


function nomeStatusAssinatura(status) {

    const nomes = {

        EM_TESTE:
            "Em teste",

        ATIVO:
            "Ativo",

        SUSPENSO:
            "Suspenso",

        CANCELADO:
            "Cancelado",
    }

    return nomes[status] || "Sem assinatura"
}


export default function AdminPage() {

    const navigate = useNavigate()

    const { sair } = useAuth()

    const [aba, setAba] =
        useState("resumo")


    /*
     * =========================
     * DADOS GERAIS
     * =========================
     */

    const [
        clientePagamento,
        setClientePagamento,
    ] = useState(null)

    const [
        valorPagamento,
        setValorPagamento,
    ] = useState("")

    const [
        registrandoPagamento,
        setRegistrandoPagamento,
    ] = useState(false)

    const [resumo, setResumo] =
        useState(null)

    const [clientes, setClientes] =
        useState([])

    const [convites, setConvites] =
        useState([])

    const [carregando, setCarregando] =
        useState(true)

    const [erro, setErro] =
        useState("")

    const [sucesso, setSucesso] =
        useState("")


    /*
     * =========================
     * CONVITES
     * =========================
     */

    const [email, setEmail] =
        useState("")

    const [enviando, setEnviando] =
        useState(false)

    const [cancelandoId, setCancelandoId] =
        useState(null)


    /*
     * =========================
     * ASSINATURA
     * =========================
     */

    const [
        clienteConfigurando,
        setClienteConfigurando,
    ] = useState(null)

    const [valorMensal, setValorMensal] =
        useState("")

    const [
        diaVencimento,
        setDiaVencimento,
    ] = useState("")

    const [
        salvandoAssinatura,
        setSalvandoAssinatura,
    ] = useState(false)

    const [
        alterandoStatusId,
        setAlterandoStatusId,
    ] = useState(null)


    /*
     * =========================
     * CARREGAMENTO
     * =========================
     */

    const carregarTudo =
        useCallback(
            async () => {

                try {

                    setErro("")

                    const [
                        dadosResumo,
                        dadosClientes,
                        dadosConvites,
                    ] =
                        await Promise.all([
                            buscarResumoAdmin(),
                            listarClientesAdmin(),
                            listarConvites(),
                        ])

                    setResumo(
                        dadosResumo ?? null,
                    )

                    setClientes(
                        Array.isArray(
                            dadosClientes,
                        )
                            ? dadosClientes
                            : [],
                    )

                    setConvites(
                        Array.isArray(
                            dadosConvites,
                        )
                            ? dadosConvites
                            : [],
                    )

                } catch (error) {

                    if (
                        error?.response
                            ?.status === 403
                    ) {

                        navigate(
                            "/",
                            {
                                replace: true,
                            },
                        )

                        return
                    }

                    setErro(
                        getFriendlyError(
                            error,
                            "Não foi possível carregar a administração.",
                        ),
                    )

                } finally {

                    setCarregando(false)
                }
            },
            [navigate],
        )


    useEffect(
        () => {

            carregarTudo()

        },
        [carregarTudo],
    )


    /*
     * =========================
     * MÉTODO: handleEnviar
     * =========================
     */

    async function handleEnviar(event) {

        event.preventDefault()

        setErro("")
        setSucesso("")

        const emailLimpo =
            email.trim()

        if (!emailLimpo) {

            setErro(
                "Informe o e-mail que receberá o convite.",
            )

            return
        }

        try {

            setEnviando(true)

            await enviarConvite(
                emailLimpo,
            )

            setEmail("")

            setSucesso(
                "Convite enviado com sucesso.",
            )

            await carregarTudo()

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


    /*
     * =========================
     * MÉTODO: handleCancelar
     * =========================
     */

    async function handleCancelar(
        convite,
    ) {

        const confirmou =
            window.confirm(
                `Deseja cancelar o convite enviado para ${convite.email}?`,
            )

        if (!confirmou) {
            return
        }

        try {

            setErro("")
            setSucesso("")

            setCancelandoId(
                convite.id,
            )

            await cancelarConvite(
                convite.id,
            )

            setSucesso(
                "Convite cancelado com sucesso.",
            )

            await carregarTudo()

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


    /*
     * =========================
     * MÉTODO: abrirConfiguracao
     * =========================
     */

    function abrirConfiguracao(
        cliente,
    ) {

        setClienteConfigurando(
            cliente,
        )

        setValorMensal(
            cliente.valorMensal ??
            "",
        )

        setDiaVencimento(
            cliente.diaVencimento ??
            "",
        )

        setErro("")
        setSucesso("")
    }


    /*
     * =========================
     * MÉTODO: fecharConfiguracao
     * =========================
     */

    function fecharConfiguracao() {

        setClienteConfigurando(null)

        setValorMensal("")

        setDiaVencimento("")
    }

    function abrirPagamento(cliente) {

        setClientePagamento(cliente)

        setValorPagamento(
            cliente.valorMensal ?? "",
        )

        setErro("")
        setSucesso("")
    }
    async function handleRegistrarPagamento(
        event,
    ) {

        event.preventDefault()

        if (!clientePagamento) {
            return
        }

        const valor =
            Number(valorPagamento)

        if (!valor || valor <= 0) {

            setErro(
                "Informe um valor de pagamento válido.",
            )

            return
        }

        try {

            setErro("")
            setSucesso("")

            setRegistrandoPagamento(true)

            await registrarPagamento(
                clientePagamento.usuarioId,
                valor,
            )

            setClientePagamento(null)
            setValorPagamento("")

            setSucesso(
                "Pagamento registrado com sucesso.",
            )

            await carregarTudo()

        } catch (error) {

            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível registrar o pagamento.",
                ),
            )

        } finally {

            setRegistrandoPagamento(false)
        }
    }


    /*
     * =========================
     * MÉTODO: handleSalvarAssinatura
     * =========================
     */

    async function handleSalvarAssinatura(
        event,
    ) {

        event.preventDefault()

        if (!clienteConfigurando) {
            return
        }

        const valor =
            Number(valorMensal)

        const dia =
            Number(diaVencimento)

        if (
            !valor ||
            valor <= 0
        ) {

            setErro(
                "Informe um valor mensal válido.",
            )

            return
        }

        if (
            !Number.isInteger(dia) ||
            dia < 1 ||
            dia > 31
        ) {

            setErro(
                "Informe um dia de vencimento entre 1 e 31.",
            )

            return
        }

        try {

            setErro("")
            setSucesso("")

            setSalvandoAssinatura(
                true,
            )

            await configurarAssinatura(
                clienteConfigurando
                    .usuarioId,
                {
                    valorMensal:
                    valor,

                    diaVencimento:
                    dia,
                },
            )

            setSucesso(
                "Assinatura configurada com sucesso.",
            )

            fecharConfiguracao()

            await carregarTudo()

        } catch (error) {

            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível configurar a assinatura.",
                ),
            )

        } finally {

            setSalvandoAssinatura(
                false,
            )
        }
    }


    /*
     * =========================
     * MÉTODO: handleSuspender
     * =========================
     */

    async function handleSuspender(
        cliente,
    ) {

        const confirmou =
            window.confirm(
                `Deseja suspender o acesso de ${cliente.nome}?`,
            )

        if (!confirmou) {
            return
        }

        try {

            setErro("")
            setSucesso("")

            setAlterandoStatusId(
                cliente.usuarioId,
            )

            await suspenderAssinatura(
                cliente.usuarioId,
            )

            setSucesso(
                "Assinatura suspensa com sucesso.",
            )

            await carregarTudo()

        } catch (error) {

            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível suspender a assinatura.",
                ),
            )

        } finally {

            setAlterandoStatusId(
                null,
            )
        }
    }


    /*
     * =========================
     * MÉTODO: handleReativar
     * =========================
     */

    async function handleReativar(
        cliente,
    ) {

        try {

            setErro("")
            setSucesso("")

            setAlterandoStatusId(
                cliente.usuarioId,
            )

            await reativarAssinatura(
                cliente.usuarioId,
            )

            setSucesso(
                "Assinatura reativada com sucesso.",
            )

            await carregarTudo()

        } catch (error) {

            setErro(
                getFriendlyError(
                    error,
                    "Não foi possível reativar a assinatura.",
                ),
            )

        } finally {

            setAlterandoStatusId(
                null,
            )
        }
    }


    /*
     * =========================
     * LOGOUT
     * =========================
     */

    function handleSair() {

        sair()

        navigate(
            "/login",
            {
                replace: true,
            },
        )
    }


    if (carregando) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-background">

                <p className="text-sm text-muted-foreground">
                    Carregando administração...
                </p>

            </div>
        )
    }


    return (
        <div className="min-h-screen bg-background">

            {/* HEADER */}

            <header className="border-b border-border bg-card">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">

                            <ShieldCheck
                                size={20}
                            />

                        </div>

                        <div>

                            <h1 className="text-lg font-semibold text-foreground">
                                Administração
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Gestão do GestorNF
                            </p>

                        </div>

                    </div>


                    <Button
                        variant="outline"
                        onClick={handleSair}
                    >

                        <LogOut
                            size={16}
                        />

                        Sair

                    </Button>

                </div>

            </header>


            <main className="mx-auto flex max-w-7xl flex-col gap-6 p-6">

                {/* ABAS */}

                <div className="flex flex-wrap gap-2">

                    <Button
                        variant={
                            aba === "resumo"
                                ? "primary"
                                : "outline"
                        }
                        onClick={() =>
                            setAba("resumo")
                        }
                    >

                        <LayoutDashboard
                            size={16}
                        />

                        Visão geral

                    </Button>


                    <Button
                        variant={
                            aba === "clientes"
                                ? "primary"
                                : "outline"
                        }
                        onClick={() =>
                            setAba("clientes")
                        }
                    >

                        <Users
                            size={16}
                        />

                        Clientes

                    </Button>


                    <Button
                        variant={
                            aba === "convites"
                                ? "primary"
                                : "outline"
                        }
                        onClick={() =>
                            setAba("convites")
                        }
                    >

                        <Mail
                            size={16}
                        />

                        Convites

                    </Button>


                    <Button
                        variant={
                            aba === "faturamento"
                                ? "primary"
                                : "outline"
                        }
                        onClick={() =>
                            setAba("faturamento")
                        }
                    >

                        <WalletCards
                            size={16}
                        />

                        Faturamento

                    </Button>


                    <Button
                        variant="outline"
                        onClick={
                            carregarTudo
                        }
                    >

                        <RefreshCw
                            size={15}
                        />

                        Atualizar

                    </Button>

                </div>


                {/* FEEDBACK */}

                {erro && (

                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                        <p className="text-sm text-[var(--color-destructive)]">
                            {erro}
                        </p>

                    </div>
                )}


                {sucesso && (

                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                        <p className="text-sm text-green-700">
                            {sucesso}
                        </p>

                    </div>
                )}


                {/* ========================= */}
                {/* VISÃO GERAL */}
                {/* ========================= */}

                {aba === "resumo" && (

                    <div className="flex flex-col gap-6">

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <ResumoCard
                                titulo="Clientes"
                                valor={
                                    resumo?.totalClientes ??
                                    0
                                }
                                icon={Users}
                            />

                            <ResumoCard
                                titulo="Em teste"
                                valor={
                                    resumo?.clientesEmTeste ??
                                    0
                                }
                                icon={Clock3}
                            />

                            <ResumoCard
                                titulo="Ativos"
                                valor={
                                    resumo?.clientesAtivos ??
                                    0
                                }
                                icon={ShieldCheck}
                            />

                            <ResumoCard
                                titulo="Suspensos"
                                valor={
                                    resumo?.clientesSuspensos ??
                                    0
                                }
                                icon={Ban}
                            />

                        </div>


                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">

                            <p className="text-sm text-muted-foreground">
                                Receita mensal prevista
                            </p>

                            <p className="mt-2 text-3xl font-bold text-foreground">

                                {formatarMoeda(
                                    resumo?.faturamentoPrevisto,
                                )}

                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">

                                Soma das mensalidades dos clientes ativos.

                            </p>

                        </section>


                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">

                            <h2 className="font-semibold text-foreground">
                                Testes em andamento
                            </h2>

                            <div className="mt-4 flex flex-col gap-3">

                                {clientes
                                    .filter(
                                        (cliente) =>
                                            cliente.status === "EM_TESTE" &&
                                            !cliente.testeExpirado,
                                    )
                                    .map(
                                        (cliente) => (

                                            <div
                                                key={
                                                    cliente.usuarioId
                                                }
                                                className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                                            >

                                                <div>

                                                    <p className="font-medium text-foreground">
                                                        {cliente.nome}
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        {cliente.email}
                                                    </p>

                                                </div>


                                                <div className="text-sm">

                                                    <span className="font-medium text-foreground">

                                                        {formatarTempoTeste(
                                                            cliente.minutosRestantesTeste,
                                                        )}

                                                    </span>

                                                    <span className="ml-1 text-muted-foreground">
                                                        restantes
                                                    </span>

                                                </div>

                                            </div>

                                        ),
                                    )}


                                {clientes
                                    .filter(
                                        (cliente) =>
                                            cliente.status === "EM_TESTE" &&
                                            !cliente.testeExpirado,
                                    ).length === 0 && (

                                    <p className="text-sm text-muted-foreground">
                                        Nenhum cliente em período de teste.
                                    </p>

                                )}

                            </div>

                        </section>

                    </div>
                )}


                {/* ========================= */}
                {/* CLIENTES */}
                {/* ========================= */}

                {aba === "clientes" && (

                    <div className="flex flex-col gap-6">

                        {clientePagamento && (

                            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">

                                <h2 className="text-lg font-semibold text-foreground">
                                    Registrar pagamento
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {clientePagamento.nome}
                                    {" · "}
                                    {clientePagamento.email}
                                </p>

                                <form
                                    onSubmit={handleRegistrarPagamento}
                                    className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
                                >

                                    <div className="flex-1">

                                        <Input
                                            id="valorPagamento"
                                            label="Valor recebido"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={valorPagamento}
                                            onChange={(event) =>
                                                setValorPagamento(
                                                    event.target.value,
                                                )
                                            }
                                        />

                                    </div>

                                    <Button
                                        type="submit"
                                        loading={registrandoPagamento}
                                    >
                                        Registrar pagamento
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setClientePagamento(null)
                                            setValorPagamento("")
                                        }}
                                    >
                                        Cancelar
                                    </Button>

                                </form>

                            </section>

                        )}

                        {clienteConfigurando && (

                            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">

                                <h2 className="text-lg font-semibold text-foreground">

                                    Configurar assinatura

                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">

                                    {clienteConfigurando.nome}

                                    {" · "}

                                    {clienteConfigurando.email}

                                </p>


                                <form
                                    onSubmit={
                                        handleSalvarAssinatura
                                    }
                                    className="mt-5 grid gap-4 md:grid-cols-2"
                                >

                                    <Input
                                        id="valorMensal"
                                        label="Valor mensal"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            valorMensal
                                        }
                                        onChange={
                                            (event) =>
                                                setValorMensal(
                                                    event.target.value,
                                                )
                                        }
                                        placeholder="50,00"
                                    />


                                    <Input
                                        id="diaVencimento"
                                        label="Dia do vencimento"
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={
                                            diaVencimento
                                        }
                                        onChange={
                                            (event) =>
                                                setDiaVencimento(
                                                    event.target.value,
                                                )
                                        }
                                        placeholder="15"
                                    />


                                    <div className="flex gap-2 md:col-span-2">

                                        <Button
                                            type="submit"
                                            loading={
                                                salvandoAssinatura
                                            }
                                        >

                                            Salvar assinatura

                                        </Button>


                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={
                                                fecharConfiguracao
                                            }
                                        >

                                            Cancelar

                                        </Button>

                                    </div>

                                </form>

                            </section>
                        )}


                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                            <div className="border-b border-border px-6 py-4">

                                <h2 className="font-semibold text-foreground">
                                    Clientes
                                </h2>

                                <p className="text-sm text-muted-foreground">

                                    {clientes.length} cliente(s)

                                </p>

                            </div>


                            {clientes.length === 0 ? (

                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    Nenhum cliente cadastrado.
                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[1100px]">

                                        <thead>

                                        <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">

                                            <th className="px-6 py-3">
                                                Cliente
                                            </th>

                                            <th className="px-6 py-3">
                                                Status
                                            </th>

                                            <th className="px-6 py-3">
                                                Teste
                                            </th>

                                            <th className="px-6 py-3">
                                                Mensalidade
                                            </th>

                                            <th className="px-6 py-3">
                                                Vencimento
                                            </th>

                                            <th className="px-6 py-3">
                                                Uso
                                            </th>

                                            <th className="px-6 py-3 text-right">
                                                Ações
                                            </th>

                                        </tr>

                                        </thead>


                                        <tbody>

                                        {clientes.map(
                                            (cliente) => (

                                                <tr
                                                    key={
                                                        cliente.usuarioId
                                                    }
                                                    className="border-b border-border last:border-b-0"
                                                >

                                                    <td className="px-6 py-4">

                                                        <p className="font-medium text-foreground">
                                                            {cliente.nome}
                                                        </p>

                                                        <p className="text-sm text-muted-foreground">
                                                            {cliente.email}
                                                        </p>

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${estiloStatusAssinatura(
                                                                cliente.status,
                                                            )}`}
                                                        >

                                                            {nomeStatusAssinatura(
                                                                cliente.status,
                                                            )}

                                                        </span>

                                                    </td>


                                                    <td className="px-6 py-4 text-sm text-muted-foreground">

                                                        {cliente.status === "EM_TESTE"
                                                            ? (
                                                                cliente.testeExpirado
                                                                    ? (
                                                                        <span className="font-medium text-destructive">
                                                                            Teste encerrado
                                                                        </span>
                                                                    )
                                                                    : formatarTempoTeste(
                                                                        cliente.minutosRestantesTeste,
                                                                    )
                                                            )
                                                            : "—"}

                                                    </td>


                                                    <td className="px-6 py-4 text-sm text-foreground">

                                                        {cliente.valorMensal !=
                                                        null
                                                            ? formatarMoeda(
                                                                cliente.valorMensal,
                                                            )
                                                            : "—"}

                                                    </td>


                                                    <td className="px-6 py-4 text-sm text-muted-foreground">

                                                        {cliente.diaVencimento
                                                            ? (
                                                                <div>

                                                                    <p>
                                                                        Dia{" "}
                                                                        {
                                                                            cliente.diaVencimento
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs">

                                                                        Próximo:{" "}

                                                                        {formatarDataSimples(
                                                                            cliente.proximoVencimento,
                                                                        )}

                                                                    </p>

                                                                </div>
                                                            )
                                                            : "—"}

                                                    </td>


                                                    <td className="px-6 py-4 text-sm text-muted-foreground">

                                                        <div>
                                                            {
                                                                cliente.quantidadeVendedores
                                                            }{" "}
                                                            vendedor(es)
                                                        </div>

                                                        <div>
                                                            {
                                                                cliente.quantidadeClientes
                                                            }{" "}
                                                            cliente(s)
                                                        </div>

                                                        <div>
                                                            {
                                                                cliente.quantidadeNotas
                                                            }{" "}
                                                            NF(s)
                                                        </div>

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            {(
                                                                cliente.status === "ATIVO" ||
                                                                cliente.status === "SUSPENSO"
                                                            ) && (

                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        abrirPagamento(cliente)
                                                                    }
                                                                >
                                                                    Registrar pagamento
                                                                </Button>

                                                            )}

                                                            <Button
                                                                variant={
                                                                    cliente.testeExpirado ||
                                                                    !cliente.status
                                                                        ? "primary"
                                                                        : "outline"
                                                                }
                                                                size="sm"
                                                                onClick={() =>
                                                                    abrirConfiguracao(
                                                                        cliente,
                                                                    )
                                                                }
                                                            >
                                                                {cliente.testeExpirado ||
                                                                !cliente.status
                                                                    ? "Ativar"
                                                                    : "Editar"}
                                                            </Button>


                                                            {cliente.status ===
                                                                "ATIVO" && (

                                                                    <Button
                                                                        variant="danger"
                                                                        size="sm"
                                                                        loading={
                                                                            alterandoStatusId ===
                                                                            cliente.usuarioId
                                                                        }
                                                                        onClick={() =>
                                                                            handleSuspender(
                                                                                cliente,
                                                                            )
                                                                        }
                                                                    >

                                                                        <Ban
                                                                            size={14}
                                                                        />

                                                                        Suspender

                                                                    </Button>

                                                                )}


                                                            {cliente.status ===
                                                                "SUSPENSO" && (

                                                                    <Button
                                                                        size="sm"
                                                                        loading={
                                                                            alterandoStatusId ===
                                                                            cliente.usuarioId
                                                                        }
                                                                        onClick={() =>
                                                                            handleReativar(
                                                                                cliente,
                                                                            )
                                                                        }
                                                                    >

                                                                        <RotateCcw
                                                                            size={14}
                                                                        />

                                                                        Reativar

                                                                    </Button>

                                                                )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            ),
                                        )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </section>

                    </div>
                )}


                {/* ========================= */}
                {/* CONVITES */}
                {/* ========================= */}

                {aba === "convites" && (

                    <div className="flex flex-col gap-6">

                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">

                            <div className="mb-5">

                                <h2 className="text-lg font-semibold text-foreground">
                                    Convidar novo usuário
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">

                                    O usuário receberá um link de ativação válido por 24 horas.

                                </p>

                            </div>


                            <form
                                onSubmit={
                                    handleEnviar
                                }
                                className="flex flex-col gap-3 sm:flex-row sm:items-end"
                            >

                                <div className="flex-1">

                                    <Input
                                        id="emailConvite"
                                        label="E-mail"
                                        type="email"
                                        value={email}
                                        onChange={
                                            (event) =>
                                                setEmail(
                                                    event.target.value,
                                                )
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

                                    <Mail
                                        size={16}
                                    />

                                    Enviar convite

                                </Button>

                            </form>

                        </section>


                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                            <div className="border-b border-border px-6 py-4">

                                <h2 className="font-semibold text-foreground">
                                    Convites
                                </h2>

                                <p className="text-sm text-muted-foreground">

                                    {convites.length} convite(s)

                                </p>

                            </div>


                            {convites.length === 0 ? (

                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    Nenhum convite enviado.
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

                                        {convites.map(
                                            (convite) => (

                                                <tr
                                                    key={
                                                        convite.id
                                                    }
                                                    className="border-b border-border last:border-b-0"
                                                >

                                                    <td className="px-6 py-4">

                                                        <p className="font-medium text-foreground">
                                                            {convite.email}
                                                        </p>

                                                    </td>


                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${estiloStatusConvite(
                                                                convite.status,
                                                            )}`}
                                                        >

                                                            {
                                                                convite.status
                                                            }

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

                                            ),
                                        )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </section>

                    </div>
                )}


                {/* ========================= */}
                {/* FATURAMENTO */}
                {/* ========================= */}

                {aba === "faturamento" && (

                    <div className="flex flex-col gap-6">

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <ResumoFinanceiroCard
                                titulo="Previsto"
                                valor={
                                    resumo?.faturamentoPrevisto
                                }
                            />

                            <ResumoFinanceiroCard
                                titulo="Recebido"
                                valor={
                                    resumo?.recebidoNoMes
                                }
                            />

                            <ResumoFinanceiroCard
                                titulo="A receber"
                                valor={
                                    resumo?.aReceber
                                }
                            />

                            <ResumoFinanceiroCard
                                titulo="Em atraso"
                                valor={
                                    resumo?.emAtraso
                                }
                            />

                        </div>

                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                            <div className="border-b border-border px-6 py-4">

                                <h2 className="font-semibold text-foreground">
                                    Mensalidades
                                </h2>

                                <p className="text-sm text-muted-foreground">

                                    Valores negociados por cliente

                                </p>

                            </div>


                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[700px]">

                                    <thead>

                                    <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">

                                        <th className="px-6 py-3">
                                            Cliente
                                        </th>

                                        <th className="px-6 py-3">
                                            Status
                                        </th>

                                        <th className="px-6 py-3">
                                            Mensalidade
                                        </th>

                                        <th className="px-6 py-3">
                                            Vencimento
                                        </th>

                                    </tr>

                                    </thead>


                                    <tbody>

                                    {clientes.map(
                                        (cliente) => (

                                            <tr
                                                key={
                                                    cliente.usuarioId
                                                }
                                                className="border-b border-border last:border-b-0"
                                            >

                                                <td className="px-6 py-4">

                                                    <p className="font-medium text-foreground">
                                                        {cliente.nome}
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        {cliente.email}
                                                    </p>

                                                </td>


                                                <td className="px-6 py-4">

                                                    {nomeStatusAssinatura(
                                                        cliente.status,
                                                    )}

                                                </td>


                                                <td className="px-6 py-4">

                                                    {cliente.valorMensal !=
                                                    null
                                                        ? formatarMoeda(
                                                            cliente.valorMensal,
                                                        )
                                                        : "—"}

                                                </td>


                                                <td className="px-6 py-4">

                                                    {cliente.diaVencimento
                                                        ? `Dia ${cliente.diaVencimento}`
                                                        : "—"}

                                                </td>

                                            </tr>

                                        ),
                                    )}

                                    </tbody>

                                </table>

                            </div>

                        </section>


                    </div>
                )}

            </main>

        </div>
    )
}


/*
 * Card da visão geral.
 */
function ResumoCard({
                        titulo,
                        valor,
                        icon: Icon,
                    }) {

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <p className="text-sm text-muted-foreground">
                    {titulo}
                </p>

                <Icon
                    size={18}
                    className="text-muted-foreground"
                />

            </div>

            <p className="mt-3 text-3xl font-bold text-foreground">
                {valor}
            </p>

        </div>
    )
}
function ResumoFinanceiroCard({
                                  titulo,
                                  valor,
                              }) {

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <p className="text-sm text-muted-foreground">
                    {titulo}
                </p>

                <CircleDollarSign
                    size={18}
                    className="text-muted-foreground"
                />

            </div>

            <p className="mt-3 text-2xl font-bold text-foreground">

                {formatarMoeda(
                    valor,
                )}

            </p>

        </div>
    )
}
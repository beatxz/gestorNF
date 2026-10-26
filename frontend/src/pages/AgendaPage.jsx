import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Check, Clock3, ListTodo, Plus, Trash2, X } from "lucide-react"
import { listarEventos, criarEvento, atualizarEvento, excluirEvento } from "../services/agendaService.js"
import { getFriendlyError } from "../services/api.js"

const CATEGORIAS = [
    { nome: "Trabalho", cor: "#60A5FA" },
    { nome: "Pessoal", cor: "#A78BFA" },
    { nome: "Reunião", cor: "#34D399" },
    { nome: "Outros", cor: "#FBBF24" },
]
const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const HORAS = Array.from({ length: 24 }, (_, i) => i)
const dois = (n) => String(n).padStart(2, "0")
const dataISO = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
const dataHora = (d, hora = "09:00") => `${dataISO(d)}T${hora}:00`
const horaCurta = (valor) => valor?.slice(11, 16) ?? ""
const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const adicionarDias = (d, quantidade) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + quantidade)
const inicioSemana = (d) => adicionarDias(inicioDia(d), -d.getDay())
const primeiroCalendario = (d) => inicioSemana(new Date(d.getFullYear(), d.getMonth(), 1))
const fimCalendario = (d) => adicionarDias(primeiroCalendario(d), 42)
const tituloMes = (d) => new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d)
const tituloDia = (d) => new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(d)
const vazio = (dia = new Date(), tipo = "COMPROMISSO") => ({
    titulo: "", descricao: "", inicio: dataHora(dia), fim: dataHora(dia, "10:00"),
    tipo, categoria: "Trabalho", cor: "#60A5FA", concluido: false,
})
const mensagem = (erro, fallback) => getFriendlyError(erro, fallback)

export default function AgendaPage() {
    const navigate = useNavigate()
    const [referencia, setReferencia] = useState(inicioDia(new Date()))
    const [modo, setModo] = useState("mes")
    const [eventos, setEventos] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState("")
    const [aviso, setAviso] = useState("")
    const [filtro, setFiltro] = useState("todos")
    const [editor, setEditor] = useState(null)
    const [excluindo, setExcluindo] = useState(false)

    const intervalo = useMemo(() => {
        let inicio
        let fim
        if (modo === "mes") {
            inicio = primeiroCalendario(referencia)
            fim = fimCalendario(referencia)
        } else if (modo === "semana") {
            inicio = inicioSemana(referencia)
            fim = adicionarDias(inicio, 7)
        } else {
            inicio = inicioDia(referencia)
            fim = adicionarDias(inicio, 1)
        }
        return { inicio: dataHora(inicio, "00:00"), fim: dataHora(fim, "00:00") }
    }, [referencia, modo])

    const carregar = useCallback(async () => {
        setCarregando(true)
        setErro("")
        try {
            const dados = await listarEventos(intervalo.inicio, intervalo.fim)
            setEventos(Array.isArray(dados) ? dados : [])
        } catch (e) {
            setErro(mensagem(e, "Não foi possível carregar a agenda."))
        } finally {
            setCarregando(false)
        }
    }, [intervalo.inicio, intervalo.fim])

    useEffect(() => { carregar() }, [carregar])

    const visiveis = useMemo(() => eventos.filter((e) => filtro === "todos" || e.tipo === filtro), [eventos, filtro])
    // Um evento ocupa cada dia em que seu intervalo cruza o dia civil.
    const eventosDoDia = (dia) => {
        const inicio = dataHora(dia, "00:00")
        const fim = dataHora(adicionarDias(dia, 1), "00:00")
        return visiveis.filter((evento) => evento.inicio &&
            (evento.fim
                ? evento.inicio < fim && evento.fim > inicio
                : evento.inicio >= inicio && evento.inicio < fim))
    }

    const diasMes = useMemo(() => {
        const primeiro = primeiroCalendario(referencia)
        const ultimo = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0)
        const diferenca = Math.round((Date.UTC(ultimo.getFullYear(), ultimo.getMonth(), ultimo.getDate()) -
            Date.UTC(primeiro.getFullYear(), primeiro.getMonth(), primeiro.getDate())) / 86400000) + 1
        const quantidade = Math.ceil(diferenca / 7) * 7
        return Array.from({ length: quantidade }, (_, i) => adicionarDias(primeiro, i))
    }, [referencia])
    const diasSemana = useMemo(() => Array.from({ length: 7 }, (_, i) => adicionarDias(inicioSemana(referencia), i)), [referencia])
    const diasExibidos = modo === "dia" ? [referencia] : diasSemana
    const semanasMes = useMemo(() => Array.from({ length: diasMes.length / 7 },
        (_, i) => diasMes.slice(i * 7, i * 7 + 7)), [diasMes])

    // Cria segmentos contínuos por semana, com linhas independentes para eventos sobrepostos.
    function faixasDaSemana(dias) {
        const inicio = dataHora(dias[0], "00:00")
        const fim = dataHora(adicionarDias(dias[6], 1), "00:00")
        const segmentos = visiveis.filter((evento) => evento.inicio &&
            (evento.fim
                ? evento.inicio < fim && evento.fim > inicio
                : evento.inicio >= inicio && evento.inicio < fim))
            .map((evento) => {
                const ocupados = dias.map((dia, indice) => {
                    const di = dataHora(dia, "00:00")
                    const df = dataHora(adicionarDias(dia, 1), "00:00")
                    const presente = evento.fim
                        ? evento.inicio < df && evento.fim > di
                        : evento.inicio >= di && evento.inicio < df
                    return presente ? indice : -1
                }).filter((indice) => indice !== -1)
                return { evento, inicio: ocupados[0], fim: ocupados[ocupados.length - 1] }
            })
            .filter((item) => item.inicio !== undefined)
            .sort((a, b) => a.inicio - b.inicio || b.fim - a.fim || a.evento.id - b.evento.id)

        const linhas = []
        return segmentos.map((segmento) => {
            let linha = 0
            while (linhas[linha]?.some((outro) => segmento.inicio <= outro.fim && segmento.fim >= outro.inicio)) linha++
            if (!linhas[linha]) linhas[linha] = []
            linhas[linha].push(segmento)
            return { ...segmento, linha }
        })
    }

    function navegar(direcao) {
        const nova = new Date(referencia)
        if (modo === "mes") nova.setMonth(nova.getMonth() + direcao)
        else nova.setDate(nova.getDate() + direcao * (modo === "semana" ? 7 : 1))
        setReferencia(nova)
    }

    function abrirNovo(dia = referencia, tipo = "COMPROMISSO", hora = "09:00") {
        const dados = vazio(dia, tipo)
        dados.inicio = dataHora(dia, hora)
        const horaFim = `${dois((Number(hora.slice(0, 2)) + 1) % 24)}:${hora.slice(3)}`
        dados.fim = dataHora(dia, hora === "23:00" ? "23:59" : horaFim)
        setEditor(dados)
        setAviso("")
    }

    function abrirExistente(evento) {
        setEditor({ ...evento, inicio: evento.inicio?.slice(0, 16) || "", fim: evento.fim?.slice(0, 16) || "" })
        setAviso("")
    }

    async function salvar(e) {
        e.preventDefault()
        if (!editor?.titulo?.trim()) return setAviso("Informe o título.")
        if (!editor?.inicio) return setAviso("Informe a data de início.")
        if (editor.tipo === "COMPROMISSO" && !editor.fim) return setAviso("Informe o horário final.")
        if (editor.fim && editor.fim <= editor.inicio) return setAviso("O horário final deve ser posterior ao inicial.")
        const payload = {
            titulo: editor.titulo.trim(), descricao: editor.descricao || "",
            inicio: editor.inicio.length === 16 ? `${editor.inicio}:00` : editor.inicio,
            fim: editor.tipo === "TAREFA" ? null : (editor.fim.length === 16 ? `${editor.fim}:00` : editor.fim),
            tipo: editor.tipo, categoria: editor.categoria, cor: editor.cor,
            concluido: editor.tipo === "TAREFA" && Boolean(editor.concluido),
        }
        setSalvando(true)
        setAviso("")
        try {
            if (editor.id) await atualizarEvento(editor.id, payload)
            else await criarEvento(payload)
            setEditor(null)
            await carregar()
        } catch (err) {
            setAviso(mensagem(err, "Não foi possível salvar."))
        } finally {
            setSalvando(false)
        }
    }

    async function remover() {
        if (!editor?.id || !window.confirm("Excluir este item da agenda?")) return
        setExcluindo(true)
        try {
            await excluirEvento(editor.id)
            setEditor(null)
            await carregar()
        } catch (e) {
            setAviso(mensagem(e, "Não foi possível excluir."))
        } finally {
            setExcluindo(false)
        }
    }

    async function alternarConclusao(evento) {
        try {
            await atualizarEvento(evento.id, {
                titulo: evento.titulo, descricao: evento.descricao || "", inicio: evento.inicio,
                fim: evento.fim, tipo: evento.tipo, categoria: evento.categoria,
                cor: evento.cor, concluido: !evento.concluido,
            })
            await carregar()
        } catch (e) {
            setErro(mensagem(e, "Não foi possível atualizar a tarefa."))
        }
    }

    const pill = (evento, compacto = false) => (
        <button key={evento.id} type="button" onClick={(e) => { e.stopPropagation(); abrirExistente(evento) }}
                className={`w-full truncate rounded-md px-2 py-1 text-left text-xs font-medium transition-opacity hover:opacity-75 ${evento.concluido ? "line-through opacity-60" : ""}`}
                style={{ backgroundColor: `${evento.cor}25`, color: "var(--color-foreground)", borderLeft: `3px solid ${evento.cor}` }}
                title={`${evento.titulo} — ${evento.categoria}`}>
            {!compacto && <span className="mr-1 opacity-70">{horaCurta(evento.inicio)}</span>}
            {evento.titulo}
        </button>
    )

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-4 md:px-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted" title="Voltar ao início" aria-label="Voltar ao início"><ArrowLeft size={18} /></button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><CalendarDays size={20} /></div>
                    <div><h1 className="text-lg font-bold">Agenda</h1><p className="text-xs text-muted-foreground">Seus compromissos e tarefas</p></div>
                </div>
                <button onClick={() => abrirNovo()} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"><Plus size={16} /> Novo item</button>
            </header>

            <div className="mx-auto grid max-w-[1600px] gap-5 p-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:p-6">
                <aside className="space-y-5">
                    <section className="rounded-xl border border-border bg-card p-4">
                        <p className="mb-3 text-sm font-semibold">Visualização</p>
                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                            {[["mes", "Mês"], ["semana", "Semana"], ["dia", "Dia"]].map(([valor, rotulo]) => <button key={valor} onClick={() => setModo(valor)} className={`rounded-md px-2 py-2 text-xs font-medium ${modo === valor ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{rotulo}</button>)}
                        </div>
                        <button onClick={() => { setReferencia(inicioDia(new Date())) }} className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Ir para hoje</button>
                    </section>
                    <section className="rounded-xl border border-border bg-card p-4">
                        <p className="mb-3 text-sm font-semibold">Mostrar</p>
                        {[["todos", "Tudo"], ["COMPROMISSO", "Compromissos"], ["TAREFA", "Tarefas"]].map(([valor, rotulo]) => <button key={valor} onClick={() => setFiltro(valor)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${filtro === valor ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted"}`}>{valor === "TAREFA" ? <ListTodo size={15} /> : <CalendarDays size={15} />}{rotulo}</button>)}
                    </section>
                    <section className="rounded-xl border border-border bg-card p-4">
                        <p className="mb-3 text-sm font-semibold">Categorias</p>
                        {CATEGORIAS.map((c) => <div key={c.nome} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.cor }} />{c.nome}</div>)}
                        <p className="mt-3 text-xs text-muted-foreground">Nesta versão, as categorias são predefinidas.</p>
                    </section>
                </aside>

                <main className="min-w-0 rounded-xl border border-border bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => navegar(-1)} className="rounded-lg border border-border p-2 hover:bg-muted" aria-label="Anterior"><ChevronLeft size={18} /></button>
                            <button onClick={() => navegar(1)} className="rounded-lg border border-border p-2 hover:bg-muted" aria-label="Próximo"><ChevronRight size={18} /></button>
                            <h2 className="ml-2 text-lg font-semibold capitalize">{modo === "dia" ? tituloDia(referencia) : tituloMes(referencia)}</h2>
                        </div>
                        {carregando && <span className="text-xs text-muted-foreground">Carregando...</span>}
                    </div>
                    {erro && <div role="alert" className="m-4 rounded-lg border border-red-300 p-3 text-sm text-red-600">{erro} <button onClick={carregar} className="ml-2 underline">Tentar novamente</button></div>}

                    {modo === "mes" ? (
                        <div className="overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-border">
                                {SEMANA.map((nome) => <div key={nome} className="px-1 py-3 text-center text-xs font-semibold text-muted-foreground">{nome}</div>)}
                            </div>
                            {semanasMes.map((dias, indiceSemana) => {
                                const faixas = faixasDaSemana(dias)
                                const linhas = Math.max(1, ...faixas.map((faixa) => faixa.linha + 1))
                                return (
                                    <div key={indiceSemana} className="relative border-b border-border" style={{ minHeight: 116 }}>
                                        {/* Fundo ocupa toda a altura, inclusive quando há muitos eventos. */}
                                        <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
                                            {dias.map((dia) => <div key={dataISO(dia)} className={`border-r border-border ${dia.getMonth() !== referencia.getMonth() ? "bg-muted/20" : ""}`} />)}
                                        </div>
                                        <div className="relative grid grid-cols-7 gap-y-1 pb-3" style={{ gridTemplateRows: `44px repeat(${linhas}, 27px)`, minHeight: 116 }}>
                                            {dias.map((dia, indiceDia) => {
                                                const atual = dataISO(dia) === dataISO(new Date())
                                                const fora = dia.getMonth() !== referencia.getMonth()
                                                return (
                                                    <button key={dataISO(dia)} type="button" onClick={() => abrirNovo(dia)}
                                                            style={{ gridColumn: indiceDia + 1, gridRow: 1 }}
                                                            className="z-10 p-2 text-left hover:bg-muted/40" title={`Criar item em ${dataISO(dia)}`}>
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${atual ? "bg-foreground font-bold text-background" : fora ? "text-muted-foreground" : ""}`}>
                              {dia.getDate()}
                            </span>
                                                    </button>
                                                )
                                            })}
                                            {faixas.map(({ evento, inicio, fim, linha }) => {
                                                const continuaAntes = evento.inicio < dataHora(dias[0], "00:00")
                                                const continuaDepois = Boolean(evento.fim && evento.fim > dataHora(adicionarDias(dias[6], 1), "00:00"))
                                                return (
                                                    <button key={`${evento.id}-${indiceSemana}`} type="button" onClick={() => abrirExistente(evento)}
                                                            title={`${evento.titulo} — ${evento.categoria}`}
                                                            style={{
                                                                gridColumn: `${inicio + 1} / ${fim + 2}`,
                                                                gridRow: linha + 2,
                                                                alignSelf: "center",
                                                                backgroundColor: `${evento.cor}35`,
                                                                borderLeft: continuaAntes ? "none" : `4px solid ${evento.cor}`,
                                                            }}
                                                            className={`z-10 mx-0.5 min-w-0 truncate px-2 py-1 text-left text-xs font-semibold hover:brightness-95 ${continuaAntes ? "rounded-l-none" : "rounded-l-md"} ${continuaDepois ? "rounded-r-none" : "rounded-r-md"} ${evento.concluido ? "line-through opacity-60" : ""}`}>
                                                        {continuaAntes ? "↪ " : ""}{evento.titulo}{continuaDepois ? " →" : ""}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[650px]">
                                <div className="grid border-b border-border" style={{ gridTemplateColumns: `65px repeat(${diasExibidos.length}, minmax(0,1fr))` }}>
                                    <div />
                                    {diasExibidos.map((dia) => <button key={dataISO(dia)} onClick={() => { setReferencia(dia); setModo("dia") }} className="border-l border-border py-3 text-sm hover:bg-muted"><span className="text-xs text-muted-foreground">{SEMANA[dia.getDay()]}</span><br /><span className="font-semibold">{dia.getDate()}</span></button>)}
                                </div>
                                <div className="max-h-[680px] overflow-y-auto">
                                    {HORAS.map((hora) => <div key={hora} className="grid" style={{ gridTemplateColumns: `65px repeat(${diasExibidos.length}, minmax(0,1fr))` }}>
                                        <div className="border-b border-border p-2 text-right text-xs text-muted-foreground">{dois(hora)}:00</div>
                                        {diasExibidos.map((dia) => {
                                            const itens = eventosDoDia(dia).filter((e) => Number(horaCurta(e.inicio).slice(0, 2)) === hora)
                                            return <div key={dataISO(dia)} onClick={() => abrirNovo(dia, "COMPROMISSO", `${dois(hora)}:00`)} className="min-h-16 cursor-pointer space-y-1 border-b border-l border-border p-1 hover:bg-muted/40">{itens.map((e) => pill(e))}</div>
                                        })}
                                    </div>)}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
                        <span className="text-xs text-muted-foreground">{visiveis.length} itens no período exibido</span>
                        <button
                            type="button"
                            onClick={() => abrirNovo(referencia, "TAREFA")}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <ListTodo size={16} />
                            Nova tarefa
                        </button>
                    </div>
                    {visiveis.some((e) => e.tipo === "TAREFA") && <div className="border-t border-border p-4"><h3 className="mb-3 text-sm font-semibold">Tarefas deste período</h3><div className="space-y-2">{visiveis.filter((e) => e.tipo === "TAREFA").map((e) => <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border p-2"><button onClick={() => alternarConclusao(e)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border" aria-label={e.concluido ? "Reabrir tarefa" : "Concluir tarefa"}>{e.concluido && <Check size={15} />}</button><button onClick={() => abrirExistente(e)} className={`flex-1 text-left text-sm ${e.concluido ? "text-muted-foreground line-through" : ""}`}>{e.titulo}<span className="ml-2 text-xs text-muted-foreground">{e.inicio?.slice(0, 10)}</span></button></div>)}</div></div>}
                </main>
            </div>

            {editor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditor(null) }}>
                <div role="dialog" aria-modal="true" aria-label={editor.id ? "Editar item" : "Novo item"} className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl">
                    <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editor.id ? "Editar item" : "Novo item"}</h2><button onClick={() => setEditor(null)} aria-label="Fechar" className="rounded-lg p-2 hover:bg-muted"><X size={18} /></button></div>
                    <form onSubmit={salvar} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">{[["COMPROMISSO", "Compromisso"], ["TAREFA", "Tarefa"]].map(([tipo, nome]) => <button key={tipo} type="button" onClick={() => setEditor({ ...editor, tipo, concluido: tipo === "TAREFA" && editor.concluido })} className={`rounded-lg border px-3 py-2 text-sm ${editor.tipo === tipo ? "border-foreground font-semibold" : "border-border text-muted-foreground"}`}>{nome}</button>)}</div>
                        <label className="block text-sm font-medium">Título<input required maxLength={150} value={editor.titulo} onChange={(e) => setEditor({ ...editor, titulo: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2" placeholder="Ex.: Reunião com cliente" /></label>
                        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">{editor.tipo === "TAREFA" ? "Prazo" : "Início"}<input type="datetime-local" required value={editor.inicio} onChange={(e) => setEditor({ ...editor, inicio: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>{editor.tipo === "COMPROMISSO" && <label className="block text-sm font-medium">Fim<input type="datetime-local" required value={editor.fim} onChange={(e) => setEditor({ ...editor, fim: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>}</div>
                        <label className="block text-sm font-medium">Categoria<select value={editor.categoria} onChange={(e) => { const c = CATEGORIAS.find((item) => item.nome === e.target.value); setEditor({ ...editor, categoria: c.nome, cor: c.cor }) }} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2">{CATEGORIAS.map((c) => <option key={c.nome}>{c.nome}</option>)}</select></label>
                        <label className="block text-sm font-medium">Descrição<textarea rows={3} value={editor.descricao || ""} onChange={(e) => setEditor({ ...editor, descricao: e.target.value })} className="mt-1 w-full resize-y rounded-lg border border-input bg-background px-3 py-2" placeholder="Detalhes adicionais" /></label>
                        {editor.tipo === "TAREFA" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editor.concluido} onChange={(e) => setEditor({ ...editor, concluido: e.target.checked })} /> Tarefa concluída</label>}
                        {aviso && <p role="alert" className="text-sm text-red-600">{aviso}</p>}
                        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4"><div>{editor.id && <button type="button" onClick={remover} disabled={excluindo || salvando} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"><Trash2 size={16} /> Excluir</button>}</div><div className="flex gap-2"><button type="button" onClick={() => setEditor(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button><button type="submit" disabled={salvando || excluindo} className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50">{salvando ? "Salvando..." : "Salvar"}</button></div></div>
                    </form>
                </div>
            </div>}
        </div>
    )
}
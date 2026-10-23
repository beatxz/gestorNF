import { useEffect, useState } from "react"
import { Percent, UserMinus, Trash2, FileText  } from "lucide-react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import ConfirmDialog from "../ui/ConfirmDialog.jsx"
import { alterarComissao, desativarVendedor, reativarVendedor, listarVendedoresInativos } from "../../services/vendedorService.js"
import {deletarUsuario, buscarUsuarioLogado, alterarComissaoTotal,} from "../../services/authService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"
import { useAuth } from "../../hooks/useAuth.jsx"
import { Link } from "react-router-dom"

/**
 * Central de configurações (abre pelo ícone de engrenagem).
 * Abas: Alterar comissão, Desativar vendedor, Deletar usuário.
 */
export default function SettingsModal({ open, onClose, vendedores, onVendedoresMudaram }) {
    const [aba, setAba] = useState("comissaoGeral")

    const abas = [
        { id: "comissaoGeral", rotulo: "Comissão geral", icon: Percent },
        { id: "comissao", rotulo: "Comissão vendedor", icon: Percent },
        { id: "delVendedor", rotulo: "Desativar vendedor", icon: UserMinus },
        { id: "delUsuario", rotulo: "Deletar usuário", icon: Trash2 },
        { id: "legal", rotulo: "Privacidade", icon: FileText },

    ]

    return (
        <Modal open={open} onClose={onClose} title="Configurações" maxWidth="max-w-lg">
            {/* Navegação por abas */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:grid-cols-3">
                {abas.map((a) => (
                    <button
                        key={a.id}
                        type="button"
                        onClick={() => setAba(a.id)}
                        className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                            aba === a.id
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <a.icon size={15} className="shrink-0" />

                        <span className="truncate">
        {a.rotulo}
      </span>
                    </button>
                ))}
            </div>

            {aba === "comissaoGeral" && (
                <AbaComissaoGeral />
            )}
            {aba === "comissao" && (
                <AbaComissao vendedores={vendedores} onSucesso={onVendedoresMudaram} />
            )}
            {aba === "delVendedor" && (
                <AbaDesativarVendedor vendedores={vendedores} onSucesso={onVendedoresMudaram} />
            )}
            {aba === "delUsuario" && <AbaDeletarUsuario />}
            {aba === "legal" && <AbaLegal />}
        </Modal>
    )
}
/* --- Comissão geral da empresa --- */
function AbaComissaoGeral() {
    const [comissaoTotal, setComissaoTotal] = useState("")
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)

    const toast = useToast()

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const usuario = await buscarUsuarioLogado()

                setComissaoTotal(
                    usuario?.comissaoTotal != null
                        ? String(usuario.comissaoTotal)
                        : "",
                )
            } catch (error) {
                toast.erro(
                    getFriendlyError(
                        error,
                        "Não foi possível carregar a comissão da empresa.",
                    ),
                )
            } finally {
                setCarregando(false)
            }
        }

        carregarUsuario()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()

        const valor = Number(comissaoTotal)

        if (comissaoTotal === "" || Number.isNaN(valor) || valor < 0) {
            return toast.erro("Informe uma comissão total válida.")
        }

        setSalvando(true)

        try {
            const usuario = await alterarComissaoTotal(valor)

            setComissaoTotal(String(usuario.comissaoTotal))

            toast.sucesso("Comissão total atualizada com sucesso!",)
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível alterar a comissão total.",),)
        } finally {
            setSalvando(false)
        }
    }

    if (carregando) {
        return (
            <div className="py-6 text-center text-sm text-muted-foreground">Carregando configurações...
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <Input
                    id="comissao-total"
                    label="Comissão total da empresa (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 2.5"
                    value={comissaoTotal}
                    onChange={(e) =>
                        setComissaoTotal(e.target.value)
                    }
                />

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Essa porcentagem representa a comissão total da
                    operação. O sistema descontará a comissão de cada
                    vendedor para calcular quanto fica para você.
                </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                    Exemplo
                </p>

                <p className="mt-1 text-sm text-foreground">
                    Comissão total de{" "}
                    <strong>{comissaoTotal || "2,5"}%</strong> menos a
                    comissão do vendedor = sua comissão.
                </p>
            </div>

            <Button
                type="submit"
                loading={salvando}
                className="self-end"
            >
                Salvar alterações
            </Button>
        </form>
    )
}
/* --- Alterar comissão --- */
function AbaComissao({ vendedores, onSucesso }) {
    const [id, setId] = useState("")
    const [comissao, setComissao] = useState("")
    const [salvando, setSalvando] = useState(false)
    const toast = useToast()

    async function handleSubmit(e) {
        e.preventDefault()
        if (!id) return toast.erro("Selecione um vendedor.")
        if (comissao === "" || Number(comissao) < 0) return toast.erro("Informe uma comissão válida.")
        setSalvando(true)
        try {
            await alterarComissao(id, comissao)
            toast.sucesso("Comissão atualizada com sucesso!")
            setComissao("")
            onSucesso()
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível alterar a comissão."))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SelectVendedor value={id} onChange={setId} vendedores={vendedores} />
            <Input
                id="nova-comissao"
                label="Nova comissão (%)"
                type="number"
                step="0.01"
                placeholder="Ex: 7"
                value={comissao}
                onChange={(e) => setComissao(e.target.value)}
            />
            <Button type="submit" loading={salvando} className="self-end">
                Salvar comissão
            </Button>
        </form>
    )
}

/* --- Desativar / reativar vendedores --- */
function AbaDesativarVendedor({ vendedores, onSucesso }) {
    const [id, setId] = useState("")
    const [modo, setModo] = useState("desativar")
    const [destinoId, setDestinoId] = useState("")
    const [confirmando, setConfirmando] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [inativos, setInativos] = useState([])
    const [carregandoInativos, setCarregandoInativos] = useState(false)
    const toast = useToast()

    async function carregarInativos() {
        setCarregandoInativos(true)
        try {
            setInativos(await listarVendedoresInativos())
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível carregar os vendedores inativos."))
        } finally {
            setCarregandoInativos(false)
        }
    }

    useEffect(() => { carregarInativos() }, [])

    const vendedor = vendedores.find(v => String(v.id) === String(id))
    const destino = vendedores.find(v => String(v.id) === String(destinoId))
    const destinos = vendedores.filter(v => String(v.id) !== String(id))
    const podeDesativar = Boolean(id) && (modo === "desativar" || Boolean(destinoId))

    async function confirmarDesativacao() {
        setSalvando(true)
        try {
            await desativarVendedor(id, modo === "transferir" ? destinoId : null)
            toast.sucesso("Vendedor desativado com sucesso! As notas antigas foram preservadas.")
            setConfirmando(false)
            setId("")
            setDestinoId("")
            setModo("desativar")
            await carregarInativos()
            await onSucesso?.()
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível desativar o vendedor."))
        } finally {
            setSalvando(false)
        }
    }

    async function handleReativar(vendedorInativo) {
        setSalvando(true)
        try {
            await reativarVendedor(vendedorInativo.id)
            toast.sucesso(`${vendedorInativo.nome} reativado com sucesso!`)
            await carregarInativos()
            await onSucesso?.()
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível reativar o vendedor."))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <SelectVendedor value={id} onChange={(valor) => { setId(valor); setDestinoId("") }} vendedores={vendedores} />
            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium text-foreground">O que fazer com os clientes?</legend>
                <label className="flex items-start gap-2 text-sm text-foreground">
                    <input type="radio" name="destino-clientes" checked={modo === "desativar"} onChange={() => setModo("desativar")} />
                    Desativar os clientes vinculados a esse vendedor
                </label>
                <label className="flex items-start gap-2 text-sm text-foreground">
                    <input type="radio" name="destino-clientes" checked={modo === "transferir"} onChange={() => setModo("transferir")} />
                    Transferir os clientes para outro vendedor ativo
                </label>
            </fieldset>
            {modo === "transferir" && (
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="vendedor-destino" className="text-sm font-medium text-foreground">Transferir clientes para</label>
                    <select id="vendedor-destino" value={destinoId} onChange={e => setDestinoId(e.target.value)}
                            className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground">
                        <option value="">Selecione o vendedor de destino</option>
                        {destinos.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                    </select>
                </div>
            )}
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                O vendedor deixará de aparecer na lista principal. As notas fiscais antigas e suas comissões serão preservadas.
                {modo === "desativar" ? " Os clientes vinculados ficarão inativos." : " Os clientes serão transferidos e continuarão ativos."}
            </div>
            <Button variant="danger" className="self-end" disabled={!podeDesativar || salvando} onClick={() => setConfirmando(true)}>
                <UserMinus size={16} /> Desativar vendedor
            </Button>
            <ConfirmDialog open={confirmando} onClose={() => setConfirmando(false)} onConfirm={confirmarDesativacao}
                           title="Desativar vendedor"
                           message={`Desativar ${vendedor?.nome || "este vendedor"}? ${modo === "transferir" ? `Os clientes serão transferidos para ${destino?.nome || "o vendedor escolhido"}.` : "Seus clientes ficarão inativos."} As notas antigas serão mantidas.`}
                           confirmLabel="Desativar" loading={salvando} />

            <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Vendedores inativos</h3>
                {carregandoInativos ? <p className="text-sm text-muted-foreground">Carregando...</p>
                    : inativos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum vendedor inativo.</p>
                        : <div className="flex flex-col gap-2">{inativos.map(v => (
                            <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                                <span className="text-sm text-foreground">{v.nome}</span>
                                <Button type="button" disabled={salvando} onClick={() => handleReativar(v)}>Reativar</Button>
                            </div>
                        ))}</div>}
            </div>
        </div>
    )
}

/* --- Deletar usuário --- */
function AbaDeletarUsuario() {
    const [senha, setSenha] = useState("")
    const [confirmando, setConfirmando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)
    const toast = useToast()
    const { sair } = useAuth()

    async function handleExcluir() {
        setExcluindo(true)

        try {
            await deletarUsuario(senha)

            toast.sucesso("Conta excluída. Você será redirecionado.")

            setConfirmando(false)

            setTimeout(() => {
                sair()
            }, 800)

        } catch (error) {
            toast.erro(
                getFriendlyError(
                    error,
                    "Não foi possível excluir o usuário."
                )
            )

            setExcluindo(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">

            <div className="rounded-lg bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
                Esta ação é permanente. Sua conta, vendedores, clientes e notas fiscais
                serão excluídos definitivamente.
            </div>
            <Input
                id="senha-exclusao"
                label="Senha atual"
                type="password"
                placeholder="Digite sua senha para confirmar"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
            />

            <Button
                variant="danger"
                className="self-end"
                disabled={!senha.trim()}
                onClick={() => setConfirmando(true)}
            >
                <Trash2 size={16} />
                Excluir minha conta
            </Button>

            <ConfirmDialog
                open={confirmando}
                onClose={() => setConfirmando(false)}
                onConfirm={handleExcluir}
                title="Excluir minha conta"
                message="Tem certeza que deseja excluir sua conta? Todos os vendedores, notas fiscais e clientes serão excluídos permanentemente. Esta ação não pode ser desfeita."
                confirmLabel="Deletar conta"
                loading={excluindo}
            />

        </div>
    )
}
/* --- Privacidade e documentos legais --- */
function AbaLegal() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-sm font-semibold text-foreground">
                    Privacidade e documentos
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Consulte os documentos que explicam as regras de utilização do
                    GestorNF e como seus dados são tratados.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Link
                    to="/politica-de-privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    Política de Privacidade
                </Link>

                <Link
                    to="/termos-de-uso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    Termos de Uso
                </Link>
            </div>

            <p className="text-xs text-muted-foreground">
                Contato para assuntos de privacidade:
                {" "}
                <strong className="text-foreground">
                    gestordenotasfiscais@gmail.com
                </strong>
            </p>
        </div>
    )
}/* --- Seletor de vendedor reutilizável --- */
function SelectVendedor({ value, onChange, vendedores }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="sel-vendedor" className="text-sm font-medium text-foreground">
                Vendedor
            </label>
            <select
                id="sel-vendedor"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            >
                <option value="">Selecione um vendedor</option>
                {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.nome}
                    </option>
                ))}
            </select>
        </div>
    )
}

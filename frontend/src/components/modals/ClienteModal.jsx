import { useState, useEffect } from "react"
import Modal from "../ui/Modal.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { cadastrarCliente, editarCliente } from "../../services/clienteService.js"
import { getFriendlyError } from "../../services/api.js"
import { useToast } from "../../hooks/useToast.jsx"

export default function ClienteModal({ open, onClose, onSucesso, vendedorId, cliente }) {
    const [codigo, setCodigo] = useState("")
    const [nomeEmpresa, setNomeEmpresa] = useState("")
    const [cnpj, setCnpj] = useState("")
    const [telefone, setTelefone] = useState("")
    const [municipio, setMunicipio] = useState("")
    const [transportadora, setTransportadora] = useState("")
    const [modoEdicao, setModoEdicao] = useState(false)
    const [erros, setErros] = useState({})
    const [salvando, setSalvando] = useState(false)
    const toast = useToast()

    const editando = Boolean(cliente)

    useEffect(() => {
        if (open) {
            setCodigo(cliente?.codigoCliente ?? "")
            setNomeEmpresa(cliente?.nomeEmpresa ?? "")
            setCnpj(cliente?.cnpj ?? "")
            setTelefone(cliente?.telefone ?? "")
            setMunicipio(cliente?.municipio ?? "")
            setTransportadora(cliente?.transportadora ?? "")
            setModoEdicao(!cliente)
            setErros({})
        }
    }, [open, cliente])

    function validar() {
        const novos = {}

        if (!codigo.trim()) novos.codigo = "Informe o código do cliente."
        if (!nomeEmpresa.trim()) novos.nomeEmpresa = "Informe o nome da empresa."

        setErros(novos)
        return Object.keys(novos).length === 0
    }

    function cancelarEdicao() {
        if (!cliente) {
            onClose()
            return
        }

        setCodigo(cliente.codigoCliente ?? "")
        setNomeEmpresa(cliente.nomeEmpresa ?? "")
        setCnpj(cliente.cnpj ?? "")
        setTelefone(cliente.telefone ?? "")
        setMunicipio(cliente.municipio ?? "")
        setTransportadora(cliente.transportadora ?? "")
        setErros({})
        setModoEdicao(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!validar()) return

        setSalvando(true)

        try {
            const dados = {
                codigoCliente: codigo.trim(),
                nomeEmpresa: nomeEmpresa.trim(),
                cnpj: cnpj.trim() || null,
                telefone: telefone.trim() || null,
                municipio: municipio.trim() || null,
                transportadora: transportadora.trim() || null
            }

            if (editando) {
                await editarCliente(vendedorId, cliente.id, dados)
                toast.sucesso("Cliente atualizado com sucesso!")
            } else {
                await cadastrarCliente(vendedorId, dados)
                toast.sucesso("Cliente cadastrado com sucesso!")
            }

            onSucesso()
        } catch (error) {
            toast.erro(
                getFriendlyError(
                    error,
                    "Não foi possível salvar o cliente."
                )
            )
        } finally {
            setSalvando(false)
        }
    }

    function valorDetalhe(valor) {
        return valor || "-"
    }

    if (editando && !modoEdicao) {
        return (
            <Modal
                open={open}
                onClose={onClose}
                title="Detalhes do cliente"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                        >
                            Fechar
                        </Button>

                        <Button
                            onClick={() => setModoEdicao(true)}
                        >
                            Editar
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col divide-y divide-border">
                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Código do cliente
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.codigoCliente)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Nome
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.nomeEmpresa)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            CNPJ
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.cnpj)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Telefone / Celular
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.telefone)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Município
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.municipio)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Transportadora
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.transportadora)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Vendedor
                        </span>
                        <span className="text-right text-sm font-medium text-foreground">
                            {valorDetalhe(cliente.nomeVendedor)}
                        </span>
                    </div>

                    <div className="flex justify-between gap-6 py-3">
                        <span className="text-sm text-muted-foreground">
                            Status
                        </span>

                        <span
                            className={`text-sm font-medium ${
                                cliente.ativo
                                    ? "text-[var(--color-success)]"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {cliente.ativo ? "Ativo" : "Inativo"}
                        </span>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal
            open={open}
            onClose={cancelarEdicao}
            title={editando ? "Editar cliente" : "Adicionar cliente"}
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={cancelarEdicao}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        loading={salvando}
                    >
                        {editando
                            ? "Salvar alterações"
                            : "Cadastrar cliente"}
                    </Button>
                </>
            }
        >
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                noValidate
            >
                <Input
                    id="c-codigo"
                    label="Código do cliente"
                    placeholder="Ex: 128171"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    error={erros.codigo}
                />

                <Input
                    id="c-nome"
                    label="Nome da empresa"
                    placeholder="Ex: Casa do Pneu"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    error={erros.nomeEmpresa}
                />

                <Input
                    id="c-cnpj"
                    label="CNPJ"
                    placeholder="Ex: 18.093.226/0001-40"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                />

                <Input
                    id="c-telefone"
                    label="Telefone / Celular"
                    placeholder="Ex: (31) 99909-3872"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                />

                <Input
                    id="c-municipio"
                    label="Município"
                    placeholder="Ex: Piranga"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                />

                <Input
                    id="c-transportadora"
                    label="Transportadora"
                    placeholder="Ex: AGIL METROPOLITANA LTDA ME"
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                />
            </form>
        </Modal>
    )
}
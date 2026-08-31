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
    const [erros, setErros] = useState({})
    const [salvando, setSalvando] = useState(false)
    const toast = useToast()

    const editando = Boolean(cliente)

    useEffect(() => {
        if (open) {
            setCodigo(cliente?.codigoCliente ?? "")
            setNomeEmpresa(cliente?.nomeEmpresa ?? "")
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

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validar()) return

        setSalvando(true)
        try {
            const dados = { codigoCliente: codigo.trim(), nomeEmpresa: nomeEmpresa.trim() }

            if (editando) {
                await editarCliente(vendedorId, cliente.id, dados)
                toast.sucesso("Cliente atualizado com sucesso!")
            } else {
                await cadastrarCliente(vendedorId, dados)
                toast.sucesso("Cliente cadastrado com sucesso!")
            }

            onSucesso()
        } catch (error) {
            toast.erro(getFriendlyError(error, "Não foi possível salvar o cliente."))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editando ? "Editar cliente" : "Adicionar cliente"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={salvando}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={salvando}>
                        {editando ? "Salvar alterações" : "Cadastrar cliente"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Input
                    id="c-codigo"
                    label="Código do cliente"
                    placeholder="Ex: 123"
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
            </form>
        </Modal>
    )
}
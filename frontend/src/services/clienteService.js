import api from "./api.js"

/**
 * Busca um cliente pelo código dentro da carteira de um vendedor específico.
 * Retorna null quando o código ainda não está cadastrado (204 No Content).
 */
export async function buscarClientePorCodigo(vendedorId, codigo) {
    const response = await api.get(`/cliente/vendedor/${vendedorId}/buscar`, {
        params: { codigo },
    })

    if (response.status === 204) {
        return null
    }

    return response.data
}

/**
 * Lista todos os clientes cadastrados na carteira de um vendedor.
 */
export async function listarClientes(vendedorId) {
    const { data } = await api.get(`/cliente/vendedor/${vendedorId}`)
    return data
}

/**
 * Cadastra um cliente novo na carteira de um vendedor.
 */
export async function cadastrarCliente(vendedorId, dados) {
    const { data } = await api.post(`/cliente/vendedor/${vendedorId}`, dados)
    return data
}

/**
 * Edita o código e/ou nome de um cliente já existente.
 */
export async function editarCliente(vendedorId, id, dados) {
    const { data } = await api.put(`/cliente/vendedor/${vendedorId}/${id}`, dados)
    return data
}

/**
 * Ativa ou desativa um cliente.
 */
export async function alterarStatusCliente(vendedorId, id, ativo) {
    const { data } = await api.patch(`/cliente/vendedor/${vendedorId}/${id}/status`, null, {
        params: { ativo },
    })
    return data
}
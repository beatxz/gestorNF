
import api from "./api"

/**
 * Serviço de vendedores do GestorNF.
 */

// Lista somente os vendedores ativos.
export async function listarVendedores() {
  const { data } = await api.get("/vendedor")
  return data
}

// Lista os vendedores desativados.
export async function listarVendedoresInativos() {
  const { data } = await api.get("/vendedor/inativos")
  return data
}

// Busca um vendedor pelo ID.
export async function buscarVendedorPorId(id) {
  const { data } = await api.get(`/vendedor/${id}`)
  return data
}

// Cadastra um vendedor.
export async function cadastrarVendedor({ nome, comissao }) {
  const { data } = await api.post("/vendedor", {
    nome,
    comissao: Number(comissao),
  })
  return data
}

// Altera a comissão.
export async function alterarComissao(id, comissao) {
  const { data } = await api.patch(
      `/vendedor?id=${id}`,
      Number(comissao)
  )
  return data
}

// Desativa um vendedor.
// Sem transferirParaId: desativa também os clientes.
// Com transferirParaId: transfere os clientes ao vendedor escolhido.
export async function desativarVendedor(id, transferirParaId = null) {
  const config = transferirParaId != null
      ? { params: { transferirParaId } }
      : {}

  const { data } = await api.patch(
      `/vendedor/${id}/desativar`,
      null,
      config
  )

  return data
}

// Reativa um vendedor.
export async function reativarVendedor(id) {
  const { data } = await api.patch(`/vendedor/${id}/reativar`)
  return data
}

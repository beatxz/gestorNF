import api from "./api"

/**
 * Serviço de vendedores.
 * Endpoints:
 *  GET    /vendedor
 *  GET    /vendedor/{id}
 *  POST   /vendedor
 *  PATCH  /vendedor?id={id}
 *  DELETE /vendedor/{id}
 */

// Lista todos os vendedores do usuário autenticado.
export async function listarVendedores() {
  const { data } = await api.get("/vendedor")
  return data
}

// Busca um vendedor específico pelo ID.
export async function buscarVendedorPorId(id) {
  const { data } = await api.get(`/vendedor/${id}`)
  return data
}

// Cadastra um novo vendedor.
export async function cadastrarVendedor({ nome, comissao }) {
  const { data } = await api.post("/vendedor", { nome, comissao: Number(comissao) })
  return data
}

// Altera a comissão de um vendedor -> PATCH /vendedor?id={id}
export async function alterarComissao(id, comissao) {
  const { data } = await api.patch(`/vendedor?id=${id}`, Number(comissao))
  return data
}

// Deleta um vendedor (e suas notas) -> DELETE /vendedor/{id}
export async function deletarVendedor(id) {
  const { data } = await api.delete(`/vendedor/${id}`)
  return data
}

import api, { setToken, clearToken } from "./api"

/**
 * Serviço de autenticação e usuário.
 * Endpoints: POST /usuario, POST /usuario/login, DELETE /usuario/{email}
 */

// Cadastro de usuário -> POST /usuario
export async function cadastrarUsuario({ nome, email, senha }) {
  const { data } = await api.post("/usuario", { nome, email, senha })
  return data
}

// Login -> POST /usuario/login. O backend retorna uma String "Bearer {JWT}".
export async function login({ email, senha }) {
  const { data } = await api.post("/usuario/login", { email, senha })
  // data pode vir como string "Bearer ..." ou objeto { token: "..." }
  const token = typeof data === "string" ? data : data?.token || data?.access_token
  if (!token) {
    throw new Error("Token não retornado pelo servidor.")
  }
  setToken(token)
  return token
}
export async function redefinirSenha({ token, novaSenha }) {
  const { data } = await api.post("/usuario/redefinir-senha", {
    token,
    novaSenha,
  })

  return data
}

// Deletar usuário -> DELETE /usuario/{email}
export async function deletarUsuario(email) {
  const { data } = await api.delete(`/usuario/${encodeURIComponent(email)}`)
  return data
}

export function logout() {
  clearToken()
}

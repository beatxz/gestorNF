import axios from "axios"

/**
 * Cliente HTTP central do GestorNF.
 *
 * Toda a comunicação com o backend Java/Spring Boot passa por aqui.
 * Para trocar o ambiente, basta alterar a variável VITE_API_URL no arquivo .env.properties.
 */

// Chave usada para guardar o token JWT no navegador.
const TOKEN_KEY = "gestornf_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  // O backend retorna algo como "Bearer eyJ...". Guardamos apenas o token puro.
  const clean = token.replace(/^Bearer\s+/i, "").trim()
  localStorage.setItem(TOKEN_KEY, clean)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
})

// Injeta o header Authorization em todas as requisições autenticadas.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Se o backend responder 401/403, o token expirou ou é inválido:
// limpamos o token e mandamos o usuário para o login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const caminhoAtual = window.location.pathname

      const rotaPublica =
          caminhoAtual.includes("/login") ||
          caminhoAtual.includes("/cadastro") ||
          caminhoAtual.includes("/esqueci-senha") ||
          caminhoAtual.includes("/redefinir-senha")

      if ((status === 401 || status === 403) && !rotaPublica) {
        clearToken()

        window.location.href = "/login"
      }

      return Promise.reject(error)
    },
)

/**
 * Traduz um erro do axios em uma mensagem amigável (sem detalhes técnicos).
 */
export function getFriendlyError(error, fallback = "Algo deu errado. Tente novamente.") {
  if (error?.response) {
    const data = error.response.data
    if (typeof data === "string" && data.trim()) return data
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.response.status === 404) return "Registro não encontrado."
    if (error.response.status === 409) return "Este registro já existe."
    return fallback
  }
  if (error?.request) {
    return "Não foi possível conectar ao servidor. Verifique se a API está ativa."
  }
  return fallback
}

export default api

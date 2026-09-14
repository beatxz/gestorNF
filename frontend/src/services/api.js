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
            // caminhoAtual.includes("/cadastro") ||
            caminhoAtual.includes("/esqueci-senha") ||
            caminhoAtual.includes("/redefinir-senha") ||
            caminhoAtual.includes("/convite") ||
            caminhoAtual.includes("/politica-de-privacidade") ||
            caminhoAtual.includes("/termos-de-uso")

      const ignorarLogoutAutomatico =
          error?.config?.skipAutoLogout === true

      if (
          status === 401 &&
          !rotaPublica &&
          !ignorarLogoutAutomatico
      ) {
        clearToken()
        window.location.href = "/login"
      }
      const mensagemBackend =
          typeof error?.response?.data === "string"
              ? error.response.data
              : (
                  error?.response?.data?.message ||
                  error?.response?.data?.menssage ||
                  ""
              )

      const bloqueioAssinatura =
          status === 403 &&
          (mensagemBackend.toLowerCase().includes("período de teste") ||

              mensagemBackend.toLowerCase().includes("acesso está suspenso") ||

              mensagemBackend.toLowerCase().includes("assinatura está cancelada"))

      if (
          bloqueioAssinatura && caminhoAtual !== "/acesso-bloqueado") {
        sessionStorage.setItem("gestornf_motivo_bloqueio", mensagemBackend,)

        window.location.href = "/acesso-bloqueado"
      }

      return Promise.reject(error)
    },
)
/**
 * Traduz um erro do axios em uma mensagem amigável (sem detalhes técnicos).
 */
export function getFriendlyError(error, fallback = "Algo deu errado. Tente novamente.") {
  if (error?.response) {
    const status = error.response.status
    const data = error.response.data

    const mensagemBackend =
        (typeof data === "string" && data.trim()) ||
        data?.message ||
        data?.menssage ||
        data?.error

    if (status === 401) {
      if (error?.config?.skipAutoLogout) {return mensagemBackend || "Senha atual incorreta."
      }
      return "Sua sessão expirou. Faça login novamente."
    }
    if (status === 403) {return (mensagemBackend || "Você não tem permissão para realizar esta operação.")}
    if (status === 404) return "Recurso não encontrado."
    if (status === 429) return mensagemBackend || "Muitas tentativas. Aguarde alguns minutos e tente novamente."
    if (status === 400 || status === 409) return mensagemBackend || fallback
    if (status >= 500) return "Não foi possível concluir a operação. Tente novamente."

    return mensagemBackend || fallback
  }

  if (error?.request) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
  }

  return fallback
}

export default api

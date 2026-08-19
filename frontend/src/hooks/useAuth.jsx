import { createContext, useContext, useState, useCallback } from "react"
import { getToken, clearToken } from "../services/api"

/**
 * Contexto de autenticação.
 * Mantém o estado de "está logado" com base na presença do token JWT.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(() => Boolean(getToken()))

  // Chamado após um login bem-sucedido.
  const entrar = useCallback(() => {
    setAutenticado(true)
  }, [])

  // Remove o token e marca como deslogado.
  const sair = useCallback(() => {
    clearToken()
    setAutenticado(false)
  }, [])

  return <AuthContext.Provider value={{ autenticado, entrar, sair }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}

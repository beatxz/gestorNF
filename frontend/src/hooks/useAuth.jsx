import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

import {
  getToken,
  clearToken,
} from "../services/api"

import {
  buscarUsuarioLogado,
} from "../services/authService.js"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [autenticado, setAutenticado] =
      useState(() => Boolean(getToken()))

  const [usuario, setUsuario] =
      useState(null)

  const [carregandoAuth, setCarregandoAuth] =
      useState(() => Boolean(getToken()))


  /*
   * MÉTODO: carregarUsuario
   */
  const carregarUsuario = useCallback(async () => {

    const token = getToken()

    if (!token) {
      setAutenticado(false)
      setUsuario(null)
      setCarregandoAuth(false)
      return null
    }

    try {

      const dados =
          await buscarUsuarioLogado()

      setUsuario(dados)
      setAutenticado(true)

      return dados

    } catch {

      clearToken()

      setUsuario(null)
      setAutenticado(false)

      return null

    } finally {

      setCarregandoAuth(false)
    }

  }, [])


  /*
   * Ao abrir/recarregar a aplicação
   */
  useEffect(() => {

    carregarUsuario()

  }, [carregarUsuario])


  /*
   * MÉTODO: entrar
   */
  const entrar = useCallback(
      async () => {

        setAutenticado(true)

        return await carregarUsuario()

      },
      [carregarUsuario],
  )


  /*
   * MÉTODO: sair
   */
  const sair = useCallback(() => {

    clearToken()

    setUsuario(null)
    setAutenticado(false)
    setCarregandoAuth(false)

  }, [])


  return (
      <AuthContext.Provider
          value={{
            autenticado,
            usuario,
            carregandoAuth,
            entrar,
            sair,
            carregarUsuario,
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
        "useAuth deve ser usado dentro de AuthProvider",
    )
  }

  return ctx
}
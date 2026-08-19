import { useState, useEffect, useCallback } from "react"
import { listarVendedores } from "../services/vendedorService.js"
import { getFriendlyError } from "../services/api.js"

/**
 * Hook responsável por carregar e manter a lista de vendedores do usuário.
 */
export function useVendedores(onErro) {
  const [vendedores, setVendedores] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const dados = await listarVendedores()
      setVendedores(Array.isArray(dados) ? dados : [])
    } catch (error) {
      onErro?.(getFriendlyError(error, "Não foi possível carregar os vendedores."))
      setVendedores([])
    } finally {
      setCarregando(false)
    }
  }, [onErro])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { vendedores, carregando, recarregar: carregar }
}

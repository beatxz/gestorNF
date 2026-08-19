import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import CadastroPage from "./pages/CadastroPage.jsx"
import HomePage from "./pages/HomePage.jsx"

/**
 * Protege rotas privadas: se não estiver autenticado, redireciona para o login.
 */
function RotaProtegida({ children }) {
  const { autenticado } = useAuth()
  if (!autenticado) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { autenticado } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={autenticado ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/cadastro" element={autenticado ? <Navigate to="/" replace /> : <CadastroPage />} />
      <Route
        path="/"
        element={
          <RotaProtegida>
            <HomePage />
          </RotaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

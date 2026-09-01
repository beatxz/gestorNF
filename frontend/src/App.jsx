import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./hooks/useAuth.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import CadastroPage from "./pages/CadastroPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import RedefinirSenhaPage from "./pages/RedefinirSenhaPage.jsx";
import EsqueciSenhaPage from "./pages/EsqueciSenhaPage.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import ResultadoGeralPage from "./pages/ResultadoGeralPage.jsx";

function RotaProtegida({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { autenticado } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={autenticado ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/cadastro"
        element={autenticado ? <Navigate to="/" replace /> : <CadastroPage />}
      />
      <Route
        path="/esqueci-senha"
        element={
          autenticado ? <Navigate to="/" replace /> : <EsqueciSenhaPage />
        }
      />

      {/* Recuperação de senha */}
      <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

        <Route
            path="/clientes"
            element={
                <RotaProtegida>
                    <ClientesPage />
                </RotaProtegida>
            }
        />
        <Route
            path="/resultado-geral"
            element={
                <RotaProtegida>
                    <ResultadoGeralPage />
                </RotaProtegida>
            }
        />
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
  );
}

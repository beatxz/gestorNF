import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom"

import { useAuth } from "./hooks/useAuth.jsx"

import LoginPage from "./pages/LoginPage.jsx"
import HomePage from "./pages/HomePage.jsx"
import RedefinirSenhaPage from "./pages/RedefinirSenhaPage.jsx"
import EsqueciSenhaPage from "./pages/EsqueciSenhaPage.jsx"
import ClientesPage from "./pages/ClientesPage.jsx"
import ResultadoGeralPage from "./pages/ResultadoGeralPage.jsx"
import PoliticaPrivacidadePage from "./pages/PoliticaPrivacidadePage.jsx"
import TermosUsoPage from "./pages/TermosUsoPage.jsx"
import ConvitePage from "./pages/ConvitePage.jsx"
import AdminPage from "./pages/AdminPage.jsx"
import AcessoBloqueadoPage from "./pages/AcessoBloqueadoPage.jsx"


function CarregandoAuth() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p className="text-sm text-muted-foreground">
                Carregando...
            </p>
        </div>
    )
}


function RotaUsuario({ children }) {

    const {
        autenticado,
        usuario,
        carregandoAuth,
    } = useAuth()

    if (carregandoAuth) {
        return <CarregandoAuth />
    }

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    if (usuario?.role === "ADMIN") {
        return (
            <Navigate
                to="/admin"
                replace
            />
        )
    }

    return children
}


function RotaAdmin({ children }) {

    const {
        autenticado,
        usuario,
        carregandoAuth,
    } = useAuth()

    if (carregandoAuth) {
        return <CarregandoAuth />
    }

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    if (usuario?.role !== "ADMIN") {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    return children
}

function RotaBloqueada({ children }) {
    const {
        autenticado,
        usuario,
        carregandoAuth,
    } = useAuth()

    if (carregandoAuth) {
        return <CarregandoAuth />
    }

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    if (usuario?.role === "ADMIN") {
        return (
            <Navigate
                to="/admin"
                replace
            />
        )
    }

    return children
}


function RotaLogin() {

    const {
        autenticado,
        usuario,
        carregandoAuth,
    } = useAuth()

    if (carregandoAuth) {
        return <CarregandoAuth />
    }

    if (!autenticado) {
        return <LoginPage />
    }

    return (
        <Navigate
            to={
                usuario?.role === "ADMIN"
                    ? "/admin"
                    : "/"
            }
            replace
        />
    )
}


export default function App() {

    return (
        <Routes>

            <Route
                path="/login"
                element={<RotaLogin />}
            />


            <Route
                path="/esqueci-senha"
                element={<EsqueciSenhaPage />}
            />


            <Route
                path="/redefinir-senha"
                element={<RedefinirSenhaPage />}
            />


            <Route
                path="/convite"
                element={<ConvitePage />}
            />


            <Route
                path="/politica-de-privacidade"
                element={<PoliticaPrivacidadePage />}
            />


            <Route
                path="/termos-de-uso"
                element={<TermosUsoPage />}
            />

            <Route
                path="/acesso-bloqueado"
                element={
                    <RotaBloqueada>
                        <AcessoBloqueadoPage />
                    </RotaBloqueada>
                }
            />


            <Route
                path="/clientes"
                element={
                    <RotaUsuario>
                        <ClientesPage />
                    </RotaUsuario>
                }
            />


            <Route
                path="/resultado-geral"
                element={
                    <RotaUsuario>
                        <ResultadoGeralPage />
                    </RotaUsuario>
                }
            />


            <Route
                path="/admin"
                element={
                    <RotaAdmin>
                        <AdminPage />
                    </RotaAdmin>
                }
            />


            <Route
                path="/"
                element={
                    <RotaUsuario>
                        <HomePage />
                    </RotaUsuario>
                }
            />


            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    )
}
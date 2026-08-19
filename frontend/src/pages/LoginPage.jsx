import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import AuthLayout from "../components/AuthLayout.jsx"
import Input from "../components/ui/Input.jsx"
import Button from "../components/ui/Button.jsx"
import { login } from "../services/authService.js"
import { getFriendlyError } from "../services/api.js"
import { useAuth } from "../hooks/useAuth.jsx"
import { useToast } from "../hooks/useToast.jsx"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erros, setErros] = useState({})
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()
  const { entrar } = useAuth()
  const toast = useToast()

  function validar() {
    const novos = {}
    if (!email.trim()) novos.email = "Informe o e-mail."
    if (!senha) novos.senha = "Informe a senha."
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setCarregando(true)
    try {
      await login({ email: email.trim(), senha })
      entrar()
      toast.sucesso("Login realizado com sucesso!")
      navigate("/")
    } catch (error) {
      toast.erro(getFriendlyError(error, "E-mail ou senha inválidos."))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
        <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta para continuar.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          id="email"
          label="E-mail"
          type="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erros.email}
          autoComplete="email"
        />
        <Input
          id="senha"
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={erros.senha}
          autoComplete="current-password"
        />
        <Button type="submit" size="lg" loading={carregando} className="mt-2 w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link to="/cadastro" className="font-medium text-accent hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}

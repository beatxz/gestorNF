import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import AuthLayout from "../components/AuthLayout.jsx"
import Input from "../components/ui/Input.jsx"
import Button from "../components/ui/Button.jsx"
import { cadastrarUsuario } from "../services/authService.js"
import { getFriendlyError } from "../services/api.js"
import { useToast } from "../hooks/useToast.jsx"
import { validarSenhaForte } from "../utils/password.js"

export default function CadastroPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erros, setErros] = useState({})
  const [carregando, setCarregando] = useState(false)
  const [aceitouTermos, setAceitouTermos] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  function validar() {
    const novos = {}
    if (!nome.trim()) novos.nome = "Informe seu nome."
    if (!email.trim()) novos.email = "Informe o e-mail."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) novos.email = "E-mail inválido."
    if (!senha) {
      novos.senha = "Informe a senha."
    } else {
      const erroSenha = validarSenhaForte(senha)

      if (erroSenha) {
        novos.senha = erroSenha
      }
    }

    if (!aceitouTermos) {
      novos.termos = "Você precisa aceitar os Termos de Uso para criar a conta."
    }
    setErros(novos)

    return Object.keys(novos).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setCarregando(true)
    try {
      await cadastrarUsuario({ nome: nome.trim(), email: email.trim(), senha })
      toast.sucesso(
          "Cadastro realizado! Enviamos um e-mail de verificação. Verifique sua caixa de entrada."
      )
      navigate("/login")
    } catch (error) {
      toast.erro(getFriendlyError(error, "Não foi possível concluir o cadastro."))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Criar conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">Comece a gerenciar suas notas fiscais.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          id="nome"
          label="Nome"
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          Use pelo menos 8 caracteres, com letra maiúscula, minúscula,
          número e caractere especial.
        </p>

        <div>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted-foreground">
            <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => {
                  setAceitouTermos(e.target.checked)

                  if (e.target.checked) {
                    setErros((anteriores) => ({
                      ...anteriores,
                      termos: undefined,
                    }))
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-input accent-[var(--color-accent)]"
            />

            <span>
      Li e concordo com os{" "}
              <Link
                  to="/termos-de-uso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
              >
        Termos de Uso
      </Link>{" "}
              e declaro estar ciente da{" "}
              <Link
                  to="/politica-de-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
              >
        Política de Privacidade
      </Link>
      .
    </span>
          </label>

          {erros.termos && (
              <p className="mt-1 text-xs text-[var(--color-destructive)]">
                {erros.termos}
              </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={carregando} className="mt-2 w-full">
          Cadastrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

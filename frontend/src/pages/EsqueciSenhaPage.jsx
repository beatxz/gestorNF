
import { useState } from "react"

import { useNavigate, Link } from "react-router-dom"

import AuthLayout from "../components/AuthLayout.jsx"

import Input from "../components/ui/Input.jsx"

import Button from "../components/ui/Button.jsx"

import api from "../services/api.js"

import { getFriendlyError } from "../services/api.js"

import { useToast } from "../hooks/useToast.jsx"


export default function EsqueciSenhaPage() {

  const [email, setEmail] = useState("")

  const [erros, setErros] = useState({})

  const [carregando, setCarregando] = useState(false)

  const [enviado, setEnviado] = useState(false)

  const navigate = useNavigate()

  const toast = useToast()


  function validar() {

    const novos = {}

    if (!email.trim()) {
      novos.email = "Informe o e-mail."
    }

    setErros(novos)

    return Object.keys(novos).length === 0
  }


  async function handleSubmit(e) {

    e.preventDefault()

    if (!validar()) return

    setCarregando(true)

    try {

      await api.post(
        `/usuario/esqueci-senha?email=${encodeURIComponent(email.trim())}`
      )

      setEnviado(true)

      toast.sucesso("Link de recuperação enviado para seu e-mail.")

    } catch (error) {

      toast.erro(
        getFriendlyError(
          error,
          "Não foi possível enviar o link de recuperação."
        )
      )

    } finally {

      setCarregando(false)

    }

  }


  if (enviado) {

    return (

      <AuthLayout>

        <div className="text-center">

          <h2 className="text-2xl font-bold text-foreground">
            E-mail enviado!
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link para redefinir sua senha.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Verifique sua caixa de entrada e clique no link recebido.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 text-sm font-medium text-accent hover:underline"
          >
            Voltar para o login
          </button>

        </div>

      </AuthLayout>

    )

  }


  return (

    <AuthLayout>

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-foreground">
          Esqueci minha senha
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >

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


        <Button
          type="submit"
          size="lg"
          loading={carregando}
          className="mt-2 w-full"
        >
          Enviar link
        </Button>

      </form>


      <p className="mt-6 text-center text-sm text-muted-foreground">

        Lembrou sua senha?{" "}

        <Link
          to="/login"
          className="font-medium text-accent hover:underline"
        >
          Voltar para o login
        </Link>

      </p>

    </AuthLayout>

  )

}


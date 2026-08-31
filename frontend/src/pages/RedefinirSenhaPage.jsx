
import { useState } from "react"

import { useNavigate, useSearchParams, Link } from "react-router-dom"

import AuthLayout from "../components/AuthLayout.jsx"

import Input from "../components/ui/Input.jsx"

import Button from "../components/ui/Button.jsx"

import { redefinirSenha } from "../services/authService.js"

import { useToast } from "../hooks/useToast.jsx"

import { validarSenhaForte } from "../utils/password.js"


export default function RedefinirSenhaPage() {

  const [novaSenha, setNovaSenha] = useState("")

  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [erros, setErros] = useState({})

  const [carregando, setCarregando] = useState(false)

  const [sucesso, setSucesso] = useState(false)

  const [searchParams] = useSearchParams()

  const navigate = useNavigate()

  const toast = useToast()


  const token = searchParams.get("token")


  function validar() {

    const novos = {}


    if (!token) {
      novos.token = "Link de recuperação inválido ou expirado."
    }


    if (!novaSenha) {
      novos.novaSenha = "Informe a nova senha."
    } else {
      const erroSenha = validarSenhaForte(novaSenha)

      if (erroSenha) {
        novos.novaSenha = erroSenha
      }
    }


    if (!confirmarSenha) {
      novos.confirmarSenha = "Confirme a nova senha."
    } else if (novaSenha !== confirmarSenha) {
      novos.confirmarSenha = "As senhas não coincidem."
    }


    setErros(novos)

    return Object.keys(novos).length === 0
  }


  async function handleSubmit(e) {

    e.preventDefault()


    if (!validar()) return


    setCarregando(true)


    try {

      await redefinirSenha({
        token,
        novaSenha
      })


      setSucesso(true)

      toast.sucesso("Senha redefinida com sucesso!")


      setTimeout(() => {
        navigate("/login")
      }, 2000)


    } catch (error) {

      toast.erro(
        error.response?.data?.message ||
        error.response?.data ||
        "Não foi possível redefinir sua senha."
      )

    } finally {

      setCarregando(false)

    }

  }


  if (sucesso) {

    return (

      <AuthLayout>

        <div className="text-center">

          <h2 className="text-2xl font-bold text-foreground">
            Senha redefinida!
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Sua senha foi alterada com sucesso.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            Você será redirecionado para o login...
          </p>

        </div>

      </AuthLayout>

    )

  }


  return (

    <AuthLayout>

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-foreground">
          Redefinir senha
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Digite sua nova senha para recuperar o acesso à sua conta.
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >

        <Input
          id="novaSenha"
          label="Nova senha"
          type="password"
          placeholder="••••••••"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          error={erros.novaSenha}
          autoComplete="new-password"
        />


        <Input
          id="confirmarSenha"
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          error={erros.confirmarSenha}
          autoComplete="new-password"
        />


        {erros.token && (

          <p className="text-sm text-destructive">
            {erros.token}
          </p>

        )}


        <Button
          type="submit"
          size="lg"
          loading={carregando}
          className="mt-2 w-full"
        >
          Redefinir senha
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


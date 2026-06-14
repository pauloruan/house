import { Loading } from "@/components/shared/Loading"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Captura os dados que vieram na URL
    const token = searchParams.get("token")
    const id = searchParams.get("id")
    const name = searchParams.get("name")
    const picture = searchParams.get("picture")

    if (token) {
      // Salva no localStorage no formato que o nosso Sidebar já espera
      localStorage.setItem("token", token)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id,
          name,
          profile_picture: picture
        })
      )

      // Redireciona para o Dashboard e apaga o histórico (replace: true)
      // para o usuário não voltar pra essa tela se clicar no botão "Voltar" do navegador
      navigate("/dashboard", { replace: true })
    } else {
      // Se por algum motivo chegou aqui sem token, joga pro login
      navigate("/", { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
      <Loading />;
    </div>
  )
}

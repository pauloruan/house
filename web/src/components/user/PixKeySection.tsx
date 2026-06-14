import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/services/user"

interface PixKeySectionProps {
  pixKey: string | null
}

export function PixKeySection({ pixKey }: PixKeySectionProps) {
  const [localPixKey, setLocalPixKey] = useState(pixKey)
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(pixKey || "")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const hasPixKey = localPixKey !== null && localPixKey !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!value.trim()) {
      return
    }

    setIsPending(true)
    setError(null)

    try {
      await updateProfile({ pix_key: value.trim() })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setLocalPixKey(value.trim())
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar chave PIX")
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue(localPixKey || "")
    setError(null)
  }

  if (isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">
            {hasPixKey ? "Editar Chave PIX" : "Cadastrar Chave PIX"}
          </CardTitle>
          <CardDescription>
            {hasPixKey
              ? "Atualize sua chave PIX para receber pagamentos."
              : "Cadastre uma chave PIX para receber pagamentos dos moradores."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Chave PIX</FieldLabel>
                <input
                  type="text"
                  placeholder="Ex: seuemail@banco.com ou CPF"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>
            </FieldGroup>

            {error && <FieldError>{error}</FieldError>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !value.trim()}
                className="flex-1"
              >
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Chave PIX</CardTitle>
        <CardDescription>
          Sua chave para receber pagamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPixKey ? (
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-1">Chave cadastrada</p>
            <p className="text-zinc-900 font-mono">{localPixKey}</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Nenhuma chave PIX cadastrada.
          </p>
        )}

        <Button
          variant="outline"
          onClick={() => {
            setValue(localPixKey || "")
            setIsEditing(true)
          }}
          className="w-full"
        >
          {hasPixKey ? "Editar Chave PIX" : "Cadastrar Chave PIX"}
        </Button>
      </CardContent>
    </Card>
  )
}

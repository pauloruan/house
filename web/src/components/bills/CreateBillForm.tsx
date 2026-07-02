import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useCreateBill } from "@/hooks/useBills"
import { useUserProfile } from "@/hooks/useUser"
import { notify } from "@/components/ui/toast"
import { ResidentSelector } from "./ResidentSelector"

function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (!numbers) return ""
  const cents = parseInt(numbers, 10)
  const reais = cents / 100
  return reais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseCurrencyInput(value: string): number {
  const numbers = value.replace(/\D/g, "")
  if (!numbers) return 0
  return parseInt(numbers, 10) / 100
}

const BILL_TYPES = [
  { value: "service", label: "Serviço (aluguel, luz, internet)" },
  { value: "purchase", label: "Compra (supermercado)" },
]

export function CreateBillForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("service")
  const [amountDisplay, setAmountDisplay] = useState("")
  const [dueDate, setDueDate] = useState("")
  const { profile } = useUserProfile()
  const [residentIDs, setResidentIDs] = useState<string[]>([])
  const { mutate: createBill, isPending, error } = useCreateBill()

  const residents = profile?.user?.house?.residents?.map(r => ({
    id: r.id,
    name: r.name,
    profile_picture: r.profile_picture,
    selected: false,
  })) || []

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const formatted = formatCurrencyInput(raw)
    setAmountDisplay(formatted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseCurrencyInput(amountDisplay)
    if (!name.trim() || !dueDate || amountNum <= 0) return

    createBill(
      { name: name.trim(), type, total_amount: amountNum, due_date: dueDate, resident_ids: residentIDs },
      {
        onSuccess: () => {
          setName("")
          setAmountDisplay("")
          setDueDate("")
          onClose()
          notify("✅ Conta criada", `"${name}" foi cadastrada com sucesso.`)
        },
      }
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Nova Conta</CardTitle>
        <CardDescription>Cadastre uma conta da casa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <input type="text" placeholder="Ex: Aluguel, Luz, Supermercado" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <select value={type} onChange={(e) => setType(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {BILL_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </Field>
            <Field>
              <FieldLabel>Valor</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">R$</span>
                <input type="text" inputMode="numeric" placeholder="0,00" value={amountDisplay} onChange={handleAmountChange} disabled={isPending}
                  className="w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </Field>
            <Field>
              <FieldLabel>Vencimento</FieldLabel>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
          </FieldGroup>

          {residents.length > 0 && (
            <ResidentSelector residents={residents} selectedIds={residentIDs} onChange={setResidentIDs} lockedId={profile?.user?.id} />
          )}

          {error && <FieldError>{error instanceof Error ? error.message : "Erro ao criar conta"}</FieldError>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={isPending || !name.trim() || !dueDate} className="flex-1">
              {isPending ? "Salvando..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

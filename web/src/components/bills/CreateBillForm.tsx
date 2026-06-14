import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useCreateBill } from "@/hooks/useBills"
import { useUserProfile } from "@/hooks/useUser"
import { notify } from "@/components/ui/toast"
import { ResidentSelector } from "./ResidentSelector"

const BILL_TYPES = [
  { value: "service", label: "Serviço (aluguel, luz, internet)" },
  { value: "purchase", label: "Compra (supermercado)" },
]

export function CreateBillForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [type, setType] = useState("service")
  const [amount, setAmount] = useState("")
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!name.trim() || !dueDate || isNaN(amountNum) || amountNum <= 0) return

    createBill(
      { name: name.trim(), type, total_amount: amountNum, due_date: dueDate, resident_ids: residentIDs },
      {
        onSuccess: () => {
          setName("")
          setAmount("")
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
              <FieldLabel>Valor (R$)</FieldLabel>
              <input type="number" step="0.01" min="0" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

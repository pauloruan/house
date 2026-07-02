import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useBills, useUpdateBill, useDeleteBill, usePayBill } from "@/hooks/useBills"
import { useUserProfile } from "@/hooks/useUser"
import { Loading } from "@/components/shared/Loading"
import { CreateBillForm } from "./CreateBillForm"
import { notify } from "@/components/ui/toast"
import type { Bill } from "@/services/bills"
import { Copy, Pencil, Trash2, Check, X as XIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { ResidentSelector } from "./ResidentSelector"

function getTypeLabel(type: string) {
  return type === "service" ? "Serviço" : "Compra"
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR")
}

function getDueDateInput(date: string) {
  return new Date(date).toISOString().split("T")[0]
}

function StatusDot({ bill }: { bill: Bill }) {
  const isOverdue = new Date(bill.due_date) < new Date() && bill.status !== "paid"
  if (bill.status === "paid") return <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Pago" />
  if (bill.status === "partial") return <span className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" title="Parcial" />
  if (isOverdue) return <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" title="Vencida" />
  return <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" title="Pendente" />
}

function PayButton({ bill }: { bill: Bill }) {
  const [confirming, setConfirming] = useState(false)
  const { mutate: pay, isPending } = usePayBill()

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500">Confirmar?</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" disabled={isPending}
          onClick={() => pay(bill.id, {
            onSuccess: () => {
              notify("✅ Pagamento informado", `Pagamento de "${bill.name}" registrado.`)
              setConfirming(false)
            }
          })} title="Confirmar">
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setConfirming(false)} title="Cancelar">
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setConfirming(true)} title="Informar pagamento">
      <Check className="h-3 w-3 mr-1" />Pagar
    </Button>
  )
}

function EditBillForm({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const [name, setName] = useState(bill.name)
  const [type, setType] = useState(bill.type)
  const [amount, setAmount] = useState(String(bill.total_amount))
  const [dueDate, setDueDate] = useState(getDueDateInput(bill.due_date))
  const [showDelete, setShowDelete] = useState(false)
  const selectedIds = bill.residents?.filter(r => r.selected).map(r => r.id) || []
  const [residentIDs, setResidentIDs] = useState<string[]>(
    selectedIds.length > 0 ? selectedIds : (bill.residents?.map(r => r.id) || [])
  )
  const { mutate: update, isPending } = useUpdateBill()
  const { mutate: del, isPending: isDeleting } = useDeleteBill()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!name.trim() || !dueDate || isNaN(amountNum)) return
    update(
      { id: bill.id, name: name.trim(), type, total_amount: amountNum, due_date: dueDate, status: bill.status, resident_ids: residentIDs },
      { onSuccess: () => onClose() }
    )
  }

  if (showDelete) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 text-base">Deletar "{bill.name}"?</CardTitle>
          <CardDescription>Esta ação não pode ser desfeita.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={() => del(bill.id, { onSuccess: () => onClose() })} disabled={isDeleting} className="flex-1">
              {isDeleting ? "Deletando..." : "Deletar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Editar Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <select value={type} onChange={(e) => setType(e.target.value as "service" | "purchase")} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="service">Serviço</option>
                <option value="purchase">Compra</option>
              </select>
            </Field>
            <Field>
              <FieldLabel>Valor (R$)</FieldLabel>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
            <Field>
              <FieldLabel>Vencimento</FieldLabel>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
          </FieldGroup>

          {bill.residents && bill.residents.length > 0 && (
            <ResidentSelector
              residents={bill.residents}
              selectedIds={residentIDs}
              onChange={setResidentIDs}
              lockedId={bill.owner_id}
            />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={isPending} className="flex-1">{isPending ? "Salvando..." : "Salvar"}</Button>
          </div>
          <div className="pt-3 border-t border-zinc-200">
            {bill.paid_amount > 0 ? (
              <div className="space-y-1">
                <Button type="button" variant="destructive" className="w-full opacity-50" disabled>
                  <Trash2 className="h-4 w-4 mr-2" />Deletar Conta
                </Button>
                <p className="text-xs text-red-500 text-center">Conta possui pagamentos, não pode ser deletada.</p>
              </div>
            ) : (
              <Button type="button" variant="destructive" className="w-full" onClick={() => setShowDelete(true)}>
                <Trash2 className="h-4 w-4 mr-2" />Deletar Conta
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function BillCard({ bill, currentUserId }: { bill: Bill; currentUserId: string | null }) {
  const [editing, setEditing] = useState(false)
  const isMyBill = currentUserId && bill.owner_id === currentUserId
  const selectedCount = bill.residents?.filter(r => r.selected).length || 1
  const split = selectedCount > 0 ? bill.total_amount / selectedCount : bill.total_amount
  const firstName = bill.owner_name.split(" ")[0]
  const alreadyPaid = currentUserId && bill.paid_by.includes(currentUserId)

  if (editing) {
    return <EditBillForm bill={bill} onClose={() => setEditing(false)} />
  }

  return (
    <div className="bg-white rounded-xs border border-zinc-200 p-3">
      <div className="flex justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot bill={bill} />
            <p className="font-semibold text-sm text-zinc-900 truncate">{bill.name}</p>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{getTypeLabel(bill.type)} de {firstName}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Vence {formatDate(bill.due_date)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Total: {formatCurrency(bill.total_amount)}</p>
          {bill.paid_amount > 0 && (
            <p className="text-xs text-green-600 mt-0.5">Pago: {formatCurrency(bill.paid_amount)}</p>
          )}
        </div>

        <div className="flex flex-col items-end justify-between ml-3">
          <div className="text-right">
            <p className="font-semibold text-sm text-zinc-900">{formatCurrency(split)}</p>
            <p className="text-xs text-zinc-400">por morador</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {alreadyPaid ? (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="h-3 w-3" />Pago</span>
            ) : isMyBill ? (
              <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setEditing(true)}>
                <Pencil className="h-3 w-3 mr-1" />Editar
              </Button>
            ) : bill.owner_pix_key ? (
              <Button variant="outline" size="sm" className="text-xs h-7"
                onClick={() => {
                  navigator.clipboard.writeText(bill.owner_pix_key!)
                  notify("📋 PIX copiado", `Chave de ${firstName} copiada.`)
                }}
              >
                <Copy className="h-3 w-3 mr-1" />PIX
              </Button>
            ) : null}

            {!alreadyPaid && <PayButton bill={bill} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BillsList({ limit }: { limit?: number }) {
  const { data: bills, isLoading } = useBills()
  const { profile } = useUserProfile()
  const [showCreate, setShowCreate] = useState(false)
  const [visibleCount, setVisibleCount] = useState(limit || 999)
  const userData = JSON.parse(localStorage.getItem("user") || "{}")
  const currentUserId = profile?.user?.id || userData.id || null

  const statusPriority = (status: string) => {
    if (status === "paid") return 3
    if (status === "partial") return 2
    return 1
  }

  const sortedBills = bills ? [...bills].sort((a, b) => {
    const sa = statusPriority(a.status)
    const sb = statusPriority(b.status)
    if (sa !== sb) return sa - sb
    if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date)
    return a.name.localeCompare(b.name)
  }) : []

  const displayedBills = sortedBills.slice(0, visibleCount)
  const hasMore = limit && sortedBills.length > visibleCount

  return (
    <div className="space-y-3">
      {showCreate && <CreateBillForm onClose={() => setShowCreate(false)} />}

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Contas</p>
        {!showCreate && (
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>+ Adicionar conta</Button>
        )}
      </div>

      {isLoading ? <Loading /> : displayedBills.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-6">Nenhuma conta cadastrada.</p>
      ) : (
        displayedBills.map((bill) => <BillCard key={bill.id} bill={bill} currentUserId={currentUserId} />)
      )}

      {limit && sortedBills.length > 0 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          {hasMore && (
            <Button variant="ghost" size="sm" className="text-xs text-zinc-500" onClick={() => setVisibleCount(v => v + limit)}>
              Ver mais ({sortedBills.length - visibleCount})
            </Button>
          )}
          <Link to="/bills">
            <Button variant="outline" size="sm" className="text-xs">Ver todas ({sortedBills.length})</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

import { useState } from "react"
import { useBills } from "@/hooks/useBills"
import { Loading } from "@/components/shared/Loading"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import type { Bill } from "@/services/bills"

type Filter = "all" | "pending" | "open" | "paid"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR")
}

function statusLabel(status: string) {
  if (status === "paid") return "Pago"
  if (status === "partial") return "Parcial"
  return "Pendente"
}

function filterBills(bills: Bill[], filter: Filter) {
  switch (filter) {
    case "paid":
      return bills.filter(b => b.status === "paid")
    case "pending":
      return bills.filter(b => b.status === "pending")
    case "open":
      return bills.filter(b => b.status !== "paid")
    default:
      return bills
  }
}

export default function BillsPage() {
  const { data: bills, isLoading } = useBills()
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = bills ? filterBills(bills, filter) : []

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: bills?.length || 0 },
    { key: "open", label: "Em aberto", count: bills?.filter(b => b.status !== "paid").length || 0 },
    { key: "pending", label: "Pendentes", count: bills?.filter(b => b.status === "pending").length || 0 },
    { key: "paid", label: "Pagas", count: bills?.filter(b => b.status === "paid").length || 0 },
  ]

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-1 bg-zinc-100 rounded-xs p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 text-xs px-2 py-1.5 rounded-xs font-medium transition-all ${
              filter === tab.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700:text-zinc-300"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-xs border border-zinc-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Vencimento</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                    Nenhuma conta encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.sort((a, b) => a.due_date.localeCompare(b.due_date)).map((bill) => {
                  const isOverdue = new Date(bill.due_date) < new Date() && bill.status !== "paid"
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <p className="font-medium text-sm text-zinc-900">{bill.name}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium text-sm text-zinc-900">{formatCurrency(bill.total_amount)}</p>
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-500">
                        {formatDate(bill.due_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs px-1.5 py-0.5 rounded-xs font-medium ${
                          bill.status === "paid" ? "bg-green-100 text-green-700" :
                          bill.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                          isOverdue ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {isOverdue && bill.status !== "paid" && bill.status !== "partial" ? "Vencida" : statusLabel(bill.status)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

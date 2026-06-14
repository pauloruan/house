import { useState } from "react"
import { useEvents } from "@/hooks/useEvents"
import { Loading } from "@/components/shared/Loading"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import type { Event } from "@/services/events"

type Filter = "all" | "upcoming" | "past"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR")
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

function filterEvents(events: Event[], filter: Filter) {
  const now = new Date()
  switch (filter) {
    case "upcoming":
      return events.filter(e => new Date(e.event_date) >= now)
    case "past":
      return events.filter(e => new Date(e.event_date) < now)
    default:
      return events
  }
}

export default function EventsPage() {
  const { data: events, isLoading } = useEvents()
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = events ? filterEvents(events, filter).sort((a, b) => a.event_date.localeCompare(b.event_date)) : []

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: events?.length || 0 },
    { key: "upcoming", label: "Futuros", count: events?.filter(e => new Date(e.event_date) >= new Date()).length || 0 },
    { key: "past", label: "Passados", count: events?.filter(e => new Date(e.event_date) < new Date()).length || 0 },
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
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Data</TableHead>
                <TableHead className="text-center">Periodicidade</TableHead>
                <TableHead className="text-center">Confirmados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                    Nenhum evento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((event) => {
                  const confirmed = event.participants.filter(p => p.confirmed).length
                  const total = event.participants.length
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <p className="font-medium text-sm text-zinc-900">{event.name}</p>
                        <p className="text-xs text-zinc-400">{event.description}</p>
                        {event.address && (
                          <p className="text-xs text-zinc-500 mt-0.5">{event.address}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-500">
                        {formatDateTime(event.event_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs text-zinc-500">{event.periodicity || "—"}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-medium text-zinc-900">
                          {confirmed}/{total}
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

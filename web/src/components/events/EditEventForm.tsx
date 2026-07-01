import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useUpdateEvent, useDeleteEvent } from "@/hooks/useEvents"
import { notify } from "@/components/ui/toast"
import { ResidentSelector } from "@/components/bills/ResidentSelector"
import { Trash2 } from "lucide-react"
import type { Event } from "@/services/events"
import type { ResidentInfo } from "@/services/bills"

export function EditEventForm({ event, onClose }: { event: Event; onClose: () => void }) {
  const [name, setName] = useState(event.name)
  const [description, setDescription] = useState(event.description || "")
  const [eventDate, setEventDate] = useState(new Date(event.event_date).toISOString().slice(0, 16))
  const [periodicity, setPeriodicity] = useState(event.periodicity || "")
  const [address, setAddress] = useState(event.address || "")
  const [participantIDs, setParticipantIDs] = useState<string[]>(
    event.participants.filter(p => p.confirmed).map(p => p.id)
  )
  const [showDelete, setShowDelete] = useState(false)
  const { mutate: update, isPending } = useUpdateEvent()
  const { mutate: del, isPending: isDeleting } = useDeleteEvent()

  const residents: ResidentInfo[] = event.participants.map(p => ({
    id: p.id,
    name: p.name,
    profile_picture: p.profile_picture,
    selected: p.confirmed,
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update(
      { ...event, name, description, event_date: new Date(eventDate).toISOString(), periodicity, address, participant_ids: participantIDs },
      {
        onSuccess: () => {
          onClose()
          notify("✅ Evento atualizado", `"${name}" foi atualizado.`)
        },
      }
    )
  }

  if (showDelete) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 text-base">Deletar "{event.name}"?</CardTitle>
          <CardDescription>Esta ação não pode ser desfeita.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={() => del(event.id, { 
              onSuccess: () => {
                notify("🗑️ Evento deletado", `"${event.name}" foi removido.`)
                onClose()
              }
            })} disabled={isDeleting} className="flex-1">
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
        <CardTitle className="text-base">Editar Evento</CardTitle>
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
              <FieldLabel>Descrição</FieldLabel>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} rows={2}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
            <Field>
              <FieldLabel>Data e hora</FieldLabel>
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
            <Field>
              <FieldLabel>Periodicidade</FieldLabel>
              <select value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sem recorrência</option>
                <option value="Semanal">Semanal</option>
                <option value="Quinzenal">Quinzenal</option>
                <option value="Mensal">Mensal</option>
              </select>
            </Field>
            <Field>
              <FieldLabel>Endereço</FieldLabel>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
          </FieldGroup>

          {residents.length > 0 && (
            <ResidentSelector residents={residents} selectedIds={participantIDs} onChange={setParticipantIDs} label="Convidar moradores" lockedId={event.creator_id} />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={isPending} className="flex-1">{isPending ? "Salvando..." : "Salvar"}</Button>
          </div>
          <div className="pt-3 border-t border-zinc-200">
            <Button type="button" variant="destructive" className="w-full" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" />Deletar Evento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useCreateEvent } from "@/hooks/useEvents"
import { useUserProfile } from "@/hooks/useUser"
import { notify } from "@/components/ui/toast"
import { ResidentSelector } from "@/components/bills/ResidentSelector"
import type { ResidentInfo } from "@/services/bills"

const PERIODICITY_OPTIONS = [
  { value: "", label: "Sem recorrência" },
  { value: "Semanal", label: "Semanal" },
  { value: "Quinzenal", label: "Quinzenal" },
  { value: "Mensal", label: "Mensal" },
]

export function CreateEventForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [periodicity, setPeriodicity] = useState("")
  const [address, setAddress] = useState("")
  const { profile } = useUserProfile()
  const [participantIDs, setParticipantIDs] = useState<string[]>([])
  const { mutate: createEvent, isPending, error } = useCreateEvent()

  useEffect(() => {
    if (profile?.user?.house?.residents) {
      setParticipantIDs(profile.user.house.residents.map(r => r.id))
    }
  }, [])

  const residents: ResidentInfo[] = profile?.user?.house?.residents?.map(r => ({
    id: r.id,
    name: r.name,
    profile_picture: r.profile_picture,
    selected: true,
  })) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !eventDate) return

    const dateStr = new Date(eventDate).toISOString()
    createEvent(
      { name: name.trim(), description, event_date: dateStr, periodicity, address, participant_ids: participantIDs },
      {
        onSuccess: () => {
          onClose()
          notify("✅ Evento criado", `"${name}" foi criado com sucesso.`)
        },
      }
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Novo Evento</CardTitle>
        <CardDescription>Cadastre um evento da casa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <input type="text" placeholder="Ex: Churrasco, Faxina, Reunião" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <textarea placeholder="Detalhes do evento..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} rows={2}
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
                {PERIODICITY_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </Field>
            <Field>
              <FieldLabel>Endereço</FieldLabel>
              <input type="text" placeholder="Ex: Rua X, 123" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
          </FieldGroup>

          {residents.length > 0 && (
            <ResidentSelector residents={residents} selectedIds={participantIDs} onChange={setParticipantIDs} label="Convidar moradores" lockedId={profile?.user?.id} />
          )}

          {error && <FieldError>{error instanceof Error ? error.message : "Erro ao criar evento"}</FieldError>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={isPending || !name.trim() || !eventDate} className="flex-1">
              {isPending ? "Salvando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

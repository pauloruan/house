import { useState } from "react"
import { useUserProfile } from "@/hooks/useUser"
import { useBills } from "@/hooks/useBills"
import { useEvents, useConfirmPresence } from "@/hooks/useEvents"
import { Loading } from "@/components/shared/Loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BillsList } from "@/components/bills/BillsList"
import { CreateEventForm } from "@/components/events/CreateEventForm"
import { EditEventForm } from "@/components/events/EditEventForm"
import { HouseSelection } from "@/components/house/HouseSelection"
import { notify } from "@/components/ui/toast"
import { CalendarDays, MapPin, Pencil, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { proxifyAvatar } from "@/services/api"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR")
}

export default function Dashboard() {
  const { profile, isLoading } = useUserProfile()
  const { data: bills } = useBills()
  const { data: events } = useEvents()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [visibleEvents, setVisibleEvents] = useState(2)

  if (isLoading) return <Loading />
  if (!profile) return null

  const user = profile.user
  const house = user.house

  if (!house) {
    return (
      <div className="w-full">
        <HouseSelection />
      </div>
    )
  }

  const residents = house.residents || []
  const nextEvent = house.events?.[0] || null
  const pendingCount = bills?.filter(b => b.status !== "paid").length || 0

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xs border border-zinc-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-900">{house.name}</h2>
          {residents.length > 0 && (
            <div className="flex -space-x-2">
              {residents.slice(0, 5).map((r) => (
                <Avatar key={r.id} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={proxifyAvatar(r.profile_picture)} />
                  <AvatarFallback className="text-xs">{r.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {residents.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600 border-2 border-white">
                  +{residents.length - 5}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-50 rounded-xs p-3">
            <p className="text-xs text-zinc-500 mb-1">Contas pendentes</p>
            <p className="text-2xl font-bold text-zinc-900">{pendingCount}</p>
          </div>

          <div className="bg-zinc-50 rounded-xs p-3">
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays className="h-3 w-3 text-zinc-500" />
              <p className="text-xs text-zinc-500">Próximo evento</p>
            </div>
            {nextEvent ? (
              <div>
                <p className="text-sm font-semibold text-zinc-900 truncate">{nextEvent.name}</p>
                <p className="text-xs text-zinc-400">{formatDate(nextEvent.event_date)}</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Nenhum evento próximo.</p>
            )}
          </div>
        </div>
      </div>

      <BillsList limit={2} />

      <div className="space-y-3">
        {showCreateEvent && <CreateEventForm onClose={() => setShowCreateEvent(false)} />}

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Eventos</p>
          {!showCreateEvent && (
            <Button variant="outline" size="sm" onClick={() => setShowCreateEvent(true)}>+ Adicionar evento</Button>
          )}
        </div>

        {!events || events.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">Nenhum evento cadastrado.</p>
        ) : (
          events.slice(0, visibleEvents).map((event) => {
            if (editingEventId === event.id) {
              return <EditEventForm key={event.id} event={event} onClose={() => setEditingEventId(null)} />
            }

            const isCreator = event.creator_id === user.id
            const userParticipant = event.participants.find(p => p.id === user.id)
            const isParticipant = !!userParticipant
            const userConfirmed = userParticipant?.confirmed ?? false

            return (
            <div key={event.id} className="bg-white rounded-xs border border-zinc-200 p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-sm text-zinc-900">{event.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatDate(event.event_date)}</p>
                  {event.periodicity && (
                    <p className="text-xs text-zinc-400 mt-0.5">{event.periodicity}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {event.address && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      <span>{event.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {isCreator ? (
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setEditingEventId(event.id)}>
                        <Pencil className="h-3 w-3 mr-1" />Editar
                      </Button>
                    ) : isParticipant && userConfirmed ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" />Confirmado
                      </span>
                    ) : isParticipant ? (
                      <ConfirmButton eventId={event.id} />
                    ) : (
                      <ConfirmButton eventId={event.id} />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-100">
                <p className="text-xs text-zinc-400">
                  {event.participants.filter(p => p.confirmed).length} confirmado(s) de {event.participants.length} convidado(s)
                </p>
              </div>
            </div>
          )})
        )}
        {events && events.length > 0 && (
          <div className="flex justify-center items-center gap-2 pt-2">
            {events.length > visibleEvents && (
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500" onClick={() => setVisibleEvents(v => v + 2)}>
                Ver mais ({events.length - visibleEvents})
              </Button>
            )}
            <Link to="/events">
              <Button variant="outline" size="sm" className="text-xs">Ver todos ({events.length})</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ConfirmButton({ eventId }: { eventId: string }) {
  const { mutate: confirm, isPending } = useConfirmPresence()
  return (
    <Button variant="outline" size="sm" className="text-xs h-7" disabled={isPending} onClick={() => confirm(eventId, {
      onSuccess: () => notify("✅ Presença confirmada", "Você confirmou presença no evento.")
    })}>
      <Check className="h-3 w-3 mr-1" />Confirmar
    </Button>
  )
}

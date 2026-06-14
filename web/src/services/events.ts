import { api } from "./api"

export interface Participant {
  id: string
  name: string
  profile_picture: string
  confirmed: boolean
}

export interface Event {
  id: string
  house_id: string
  creator_id: string
  creator_name: string
  name: string
  description: string
  event_date: string
  periodicity: string
  address: string
  status: string
  created_at: string
  participants: Participant[]
}

export async function getEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>("/events")
  return response.data
}

export interface CreateEventRequest {
  name: string
  description: string
  event_date: string
  periodicity: string
  address: string
  participant_ids: string[]
}

export async function createEvent(data: CreateEventRequest): Promise<Event> {
  const response = await api.post<Event>("/events", data)
  return response.data
}

export async function updateEvent(data: Event & { participant_ids: string[] }): Promise<Event> {
  const response = await api.put<Event>("/events", { ...data, participant_ids: data.participant_ids, id: data.id })
  return response.data
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete("/events", { data: { id } })
}

export async function confirmPresence(id: string): Promise<void> {
  await api.post("/events/confirm", { id })
}

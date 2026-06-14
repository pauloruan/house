import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEvents, createEvent, updateEvent, deleteEvent, confirmPresence } from "@/services/events"

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: getEvents })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: createEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }) })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: updateEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }) })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: deleteEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }) })
}

export function useConfirmPresence() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: confirmPresence, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }) })
}

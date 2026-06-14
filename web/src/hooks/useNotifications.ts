import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getNotifications } from "@/services/notifications"
import { useEffect } from "react"
import { eventBus } from "@/lib/eventBus"

export function useNotifications() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  })

  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.event === "new-notification") {
        queryClient.invalidateQueries({ queryKey: ["notifications"], refetchType: "all" })
      }
    }

    eventBus.on("websocket-message", handler)
    return () => eventBus.off("websocket-message", handler)
  }, [queryClient])

  return query
}

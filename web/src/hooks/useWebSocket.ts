import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { eventBus } from "@/lib/eventBus"

interface UseWebSocketOptions {
  onHouseUpdated?: () => void
  onHouseDeleted?: () => void
  onInviteCodeRegenerated?: () => void
}

const eventCallbacks = {
  onHouseUpdated: new Set<() => void>(),
  onHouseDeleted: new Set<() => void>(),
  onInviteCodeRegenerated: new Set<() => void>(),
}

let listenersConfigured = false

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (options.onHouseUpdated) {
      eventCallbacks.onHouseUpdated.add(options.onHouseUpdated)
      return () => { eventCallbacks.onHouseUpdated.delete(options.onHouseUpdated!) }
    }
  }, [options.onHouseUpdated])

  useEffect(() => {
    if (options.onHouseDeleted) {
      eventCallbacks.onHouseDeleted.add(options.onHouseDeleted)
      return () => { eventCallbacks.onHouseDeleted.delete(options.onHouseDeleted!) }
    }
  }, [options.onHouseDeleted])

  useEffect(() => {
    if (options.onInviteCodeRegenerated) {
      eventCallbacks.onInviteCodeRegenerated.add(options.onInviteCodeRegenerated)
      return () => { eventCallbacks.onInviteCodeRegenerated.delete(options.onInviteCodeRegenerated!) }
    }
  }, [options.onInviteCodeRegenerated])

  useEffect(() => {
    if (listenersConfigured) return

    listenersConfigured = true

    const handleMessage = (msg: any) => {
      switch (msg.event) {
        case "house-updated":
          queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" })
          eventCallbacks.onHouseUpdated.forEach((cb) => cb())
          break

        case "house-deleted":
          queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" })
          eventCallbacks.onHouseDeleted.forEach((cb) => cb())
          break

        case "invite-code-regenerated":
          queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" })
          eventCallbacks.onInviteCodeRegenerated.forEach((cb) => cb())
          break

        case "new-notification":
          break
      }
    }

    eventBus.on("websocket-message", handleMessage)

    return () => {
      eventBus.off("websocket-message", handleMessage)
    }
  }, [queryClient])

  return { sendMessage: dispatchWebSocketMessage }
}

export function dispatchWebSocketMessage(msg: any) {
  eventBus.emit("websocket-message", msg)
}

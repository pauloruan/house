import { dispatchWebSocketMessage } from "@/hooks/useWebSocket"
import { eventBus } from "@/lib/eventBus"
import { useQueryClient } from "@tanstack/react-query"
import React, { useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"
const WS_URL = API_URL.replace(/^http/, "ws")

interface WebSocketMessage {
  event: string
  houseID?: string
  userID?: string
  data?: unknown
}

// Singleton global
let globalSocket: WebSocket | null = null
let isConnecting = false

function initializeWebSocket() {
  if (globalSocket?.readyState === WebSocket.OPEN) {
    return
  }

  if (isConnecting) {
    return
  }

  isConnecting = true
  const wsUrl = `${WS_URL}/ws`

  try {
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      globalSocket = socket
      isConnecting = false
    }

    socket.onmessage = (event: MessageEvent) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data)
        dispatchWebSocketMessage(msg)
      } catch (error) {
        console.error("❌ Erro ao processar mensagem:", error)
      }
    }

    socket.onerror = (error: Event) => {
      console.error("❌ Erro WebSocket:", error)
      isConnecting = false
    }

    socket.onclose = () => {
      globalSocket = null
      isConnecting = false
    }
  } catch (error) {
    console.error("❌ Erro ao criar WebSocket:", error)
    isConnecting = false
  }
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    initializeWebSocket()
    return () => {}
  }, [])

  // Escutar eventos WebSocket e invalidar queries
  useEffect(() => {
    const handleMessage = (msg: any) => {
      switch (msg.event) {
        case "house-updated":
          queryClient.invalidateQueries({
            queryKey: ["profile"],
            refetchType: "all"
          })
          break

        case "house-deleted":
          queryClient.invalidateQueries({
            queryKey: ["profile"],
            refetchType: "all"
          })
          break

        case "invite-code-regenerated":
          queryClient.invalidateQueries({
            queryKey: ["profile"],
            refetchType: "all"
          })
          break

        case "new-notification":
          queryClient.invalidateQueries({
            queryKey: ["notifications"],
            refetchType: "all"
          })
          break

        case "bill-created":
        case "bill-updated":
        case "bill-deleted":
          queryClient.invalidateQueries({
            queryKey: ["bills"],
            refetchType: "all"
          })
          queryClient.invalidateQueries({
            queryKey: ["profile"],
            refetchType: "all"
          })
          break

        case "event-created":
        case "event-updated":
        case "event-deleted":
          queryClient.invalidateQueries({
            queryKey: ["events"],
            refetchType: "all"
          })
          queryClient.invalidateQueries({
            queryKey: ["profile"],
            refetchType: "all"
          })
          break

        case "wishlist-created":
        case "wishlist-deleted":
          queryClient.invalidateQueries({
            queryKey: ["wishlist"],
            refetchType: "all"
          })
          break
      }
    }

    eventBus.on("websocket-message", handleMessage)

    return () => {
      eventBus.off("websocket-message", handleMessage)
    }
  }, [queryClient])

  return <>{children}</>
}

export function sendWebSocketMessage(msg: WebSocketMessage) {
  if (!globalSocket || globalSocket.readyState !== WebSocket.OPEN) {
    return
  }

  globalSocket.send(JSON.stringify(msg))
}

export function useWebSocketConnection() {
  return globalSocket
}

import { useEffect } from "react"
import { notify } from "@/components/ui/toast"
import { eventBus } from "@/lib/eventBus"

export function NotificationListener() {
  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.event === "new-notification" && msg.data) {
        const data = msg.data as { title: string; text: string }
        notify(data.title, data.text)
      }
    }

    eventBus.on("websocket-message", handler)
    return () => eventBus.off("websocket-message", handler)
  }, [])

  return null
}

import { Loading } from "@/components/shared/Loading"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useNotifications } from "@/hooks/useNotifications"
import { Bell } from "lucide-react"

export default function Notifications() {
  const { data: notifications, isLoading, isError } = useNotifications()

  if (isLoading) return <Loading />
  if (isError) return <ErrorMessage message="Erro ao carregar notificações." />

  return (
    <div className="space-y-4 max-w-2xl w-full">
      {!notifications || notifications.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xs border border-zinc-200">
          <Bell className="h-10 w-10 mx-auto mb-2 text-zinc-300" />
          <p className="text-zinc-500">
            Nenhuma notificação por enquanto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xs border border-zinc-200 p-4"
            >
              <h3 className="font-semibold text-zinc-900">
                {n.title}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {n.text}
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                {new Date(n.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

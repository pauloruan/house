import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { Loading } from "@/components/shared/Loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/hooks/useUser"
import { useWebSocket } from "@/hooks/useWebSocket"
import { EditHouseForm } from "@/components/house/EditHouseForm"
import { HouseSelection } from "@/components/house/HouseSelection"
import { PixKeySection } from "@/components/user/PixKeySection"
import { useEffect } from "react"
import { sendWebSocketMessage } from "@/providers/WebSocketProvider"
import { proxifyAvatar } from "@/services/api"

export default function Profile() {
  const { profile, isLoading, isError } = useUserProfile()
  useWebSocket({
    onHouseDeleted: () => {},
    onHouseUpdated: () => {},
    onInviteCodeRegenerated: () => {},
  })

  useEffect(() => {
    if (profile?.user?.house) {
      sendWebSocketMessage({
        event: "join-house",
        houseID: profile.user.house.id,
        userID: profile.user.id,
      })
    }
  }, [profile?.user?.house?.id, profile?.user?.id])

  if (isLoading) {
    return <Loading />
  }

  if (isError || !profile) {
    return <ErrorMessage message="Erro ao carregar os dados do seu perfil." />
  }

  const user = profile.user
  const house = user.house
  const hasHouse = !!house

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className="flex items-center gap-4 p-6 bg-white rounded-xs border border-zinc-200 shadow-sm">
        <Avatar className="h-20 w-20">
          <AvatarImage src={proxifyAvatar(user.profile_picture)} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            {user.name}
          </h2>
          <p className="text-zinc-500">{user.email}</p>
        </div>
      </div>

      <PixKeySection pixKey={user.pix_key} />

      {!hasHouse && (
        <HouseSelection />
      )}

      {hasHouse && (
        <div>
          <h3 className="text-lg font-bold mb-4">Sua Casa</h3>
          <EditHouseForm house={house} />
        </div>
      )}
    </div>
  )
}

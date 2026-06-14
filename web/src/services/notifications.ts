import { api } from "./api"

export interface Notification {
  id: string
  house_id: string
  creator_id: string
  title: string
  text: string
  created_at: string
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>("/notifications")
  return response.data
}

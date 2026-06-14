import { api } from "./api"

export interface WishlistItem {
  id: string
  house_id: string
  user_id: string
  user_name: string
  url: string
  title: string
  image_url: string
  created_at: string
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await api.get<WishlistItem[]>("/wishlist")
  return response.data
}

export async function addWishlistItem(url: string): Promise<WishlistItem> {
  const response = await api.post<WishlistItem>("/wishlist", { url })
  return response.data
}

export async function deleteWishlistItem(id: string): Promise<void> {
  await api.delete("/wishlist", { data: { id } })
}

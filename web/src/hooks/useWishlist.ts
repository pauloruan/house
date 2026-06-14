import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getWishlist, addWishlistItem, deleteWishlistItem } from "@/services/wishlist"

export function useWishlist() {
  return useQuery({ queryKey: ["wishlist"], queryFn: getWishlist })
}

export function useAddWishlistItem() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: addWishlistItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }) })
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: deleteWishlistItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }) })
}

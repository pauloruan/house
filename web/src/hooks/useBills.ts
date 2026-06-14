import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBills, createBill, updateBill, deleteBill, payBill } from "@/services/bills"

export function useBills() {
  return useQuery({
    queryKey: ["bills"],
    queryFn: getBills,
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  })
}

export function useUpdateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  })
}

export function useDeleteBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  })
}

export function usePayBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: payBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  })
}

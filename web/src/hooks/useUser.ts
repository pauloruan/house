import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getProfile, updateProfile } from "@/services/user"

export function useUserProfile() {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    }
  })

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,

    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  }
}

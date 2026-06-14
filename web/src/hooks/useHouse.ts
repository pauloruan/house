import { createHouse, updateHouse, deleteHouse, regenerateInviteCode, joinHouseWithInviteCode, leaveHouse } from "@/services/house";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteHouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
    }
  });
}

export function useLeaveHouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
    }
  });
}

export function useCreateHouse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createHouse,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
		}
	});
}

export function useUpdateHouse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateHouse,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
		}
	});
}

export function useRegenerateInviteCode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: regenerateInviteCode,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
		}
	});
}

export function useJoinHouseWithInviteCode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: joinHouseWithInviteCode,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
		}
	});
}

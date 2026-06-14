import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import type { HouseProfile } from "@/services/user";
import { useUpdateHouse, useDeleteHouse, useLeaveHouse } from "@/hooks/useHouse";
import { useWebSocket } from "@/hooks/useWebSocket";
import { InviteCodeSection } from "./InviteCodeSection";
import { notify } from "@/components/ui/toast";

interface EditHouseFormProps {
  house: HouseProfile;
}

export function EditHouseForm({ house }: EditHouseFormProps) {
	const [houseName, setHouseName] = useState(house?.name ?? "");
	const [isEditMode, setIsEditMode] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
	
	const isOwner = house?.role === "owner";
	
  const { mutate: updateHouse, isPending: isUpdating, error: updateError } = useUpdateHouse();
	const { mutate: deleteHouse, isPending: isDeleting, error: deleteError } = useDeleteHouse();
	const { mutate: leaveHouse, isPending: isLeaving, error: leaveError } = useLeaveHouse();

  const webSocketOptions = useMemo(
    () => ({
      onHouseUpdated: () => {
        setIsEditMode(false);
      },
      onHouseDeleted: () => {},
    }),
    []
  );

  useWebSocket(webSocketOptions);

	if (!house) return null

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!houseName.trim()) {
      return;
    }

    updateHouse({ name: houseName.trim() }, {
      onSuccess: () => {
        setIsEditMode(false);
        notify("✏️ Casa atualizada", `Nome alterado para "${houseName.trim()}"`);
      }
    });
  };

	const handleDelete = () => {
		deleteHouse(undefined, {
			onSuccess: () => {
				setShowDeleteConfirm(false);
				notify("🗑️ Casa deletada", "A casa foi removida com sucesso.");
			}
		});
	};

	const handleLeave = () => {
		leaveHouse(undefined, {
			onSuccess: () => {
				setShowLeaveConfirm(false);
				notify("👋 Até logo", "Você saiu da casa.");
			}
		});
	};

	const updateErrorMessage = updateError instanceof Error ? updateError.message : "Erro ao atualizar casa";
	const deleteErrorMessage = deleteError instanceof Error ? deleteError.message : "Erro ao deletar casa";
	const leaveErrorMessage = leaveError instanceof Error ? leaveError.message : "Erro ao sair da casa";

	if (showLeaveConfirm) {
		return (
			<Card className="w-full border-orange-200">
				<CardHeader>
					<CardTitle className="text-orange-600">Sair da Casa</CardTitle>
					<CardDescription>
						Tem certeza que deseja sair da casa? Você perderá acesso às contas compartilhadas.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-orange-50 p-4 rounded-xs">
						<p className="text-sm text-orange-700">
							Ao sair da casa, você será desvinculado dela e não poderá mais acessar as contas compartilhadas até ser convidado novamente.
						</p>
					</div>
					
					{leaveError && (
						<FieldError>
							{leaveErrorMessage}
						</FieldError>
					)}

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setShowLeaveConfirm(false)}
							disabled={isLeaving}
							className="flex-1"
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleLeave}
							disabled={isLeaving}
							className="flex-1"
						>
							{isLeaving ? "Saindo..." : "Confirmar Saída"}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (showDeleteConfirm) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Deletar Casa</CardTitle>
          <CardDescription>
            Tem certeza que deseja deletar a casa? Esta ação é irreversível.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xs">
            <p className="text-sm text-red-700">
              Ao deletar a casa, você será desvinculado dela e perderá acesso a todas as contas compartilhadas.
            </p>
          </div>
          
          {deleteError && (
            <FieldError>
              {deleteErrorMessage}
            </FieldError>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Deletando..." : "Confirmar Deleção"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
       <CardHeader>
         <div className="flex justify-between items-start">
           <div>
             <CardTitle>Editar Casa</CardTitle>
             <CardDescription>
               Gerencie as informações da sua casa
             </CardDescription>
           </div>
           {!isEditMode && isOwner && (
             <Button
               variant="outline"
               size="sm"
               onClick={() => setIsEditMode(true)}
             >
               Editar
             </Button>
           )}
         </div>
       </CardHeader>
      <CardContent>
        {isEditMode ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Nome da Casa</FieldLabel>
                <input
                  type="text"
                  placeholder="Ex: Apartamento São Paulo"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>
            </FieldGroup>

            {updateError && (
              <FieldError>
                {updateErrorMessage}
              </FieldError>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                  setHouseName(house.name);
                }}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || houseName.trim() === house.name}
                className="flex-1"
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Nome da Casa</p>
              <p className="text-lg font-semibold text-zinc-900">{house.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Seu Papel</p>
              <p className="text-lg font-semibold text-zinc-900">
                {house.role === "owner" ? "Administrador" : "Morador"}
              </p>
            </div>

             {house.role === "owner" && (
               <div>
                 <InviteCodeSection 
                   houseId={house.id}
                   initialInviteCode={house.invite_code}
                 />
               </div>
             )}

             {!isOwner && (
               <div className="pt-4 border-t border-zinc-200">
                 <Button
                   variant="outline"
                   onClick={() => setShowLeaveConfirm(true)}
                   className="w-full"
                 >
                   👋 Sair da Casa
                 </Button>
               </div>
             )}

             {isOwner && (
               <div className="pt-4 border-t border-zinc-200">
                 <Button
                   variant="destructive"
                   onClick={() => setShowDeleteConfirm(true)}
                   className="w-full"
                 >
                   Deletar Casa
                 </Button>
               </div>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

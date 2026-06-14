import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { useCreateHouse } from "@/hooks/useHouse";
import { notify } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";

export function CreateHouseForm() {
  const [houseName, setHouseName] = useState("");
  const { mutate: createHouse, isPending, error } = useCreateHouse();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!houseName.trim()) {
      return;
    }

    createHouse({ name: houseName.trim() }, {
      onSuccess: () => {
        setHouseName("");
        notify("🏠 Casa criada", `A casa "${houseName}" foi criada com sucesso!`);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });
  };

  const errorMessage = error instanceof Error ? error.message : "Erro ao criar casa";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar Nova Casa</CardTitle>
        <CardDescription>
          Crie sua primeira casa para começar a gerenciar contas compartilhadas.
          Você se tornará o administrador da casa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Nome da Casa</FieldLabel>
              <input
                type="text"
                placeholder="Ex: Apartamento São Paulo"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FieldDescription>
                Escolha um nome descritivo para identificar sua casa
              </FieldDescription>
            </Field>
          </FieldGroup>

          {error && (
            <FieldError>
              {errorMessage}
            </FieldError>
          )}

          <Button
            type="submit"
            disabled={isPending || !houseName.trim()}
            className="w-full"
          >
            {isPending ? "Criando casa..." : "Criar Casa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

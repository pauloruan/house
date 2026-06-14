import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { useJoinHouseWithInviteCode } from "@/hooks/useHouse";
import { notify } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";

export function JoinHouseForm() {
  const [inviteCode, setInviteCode] = useState("");
  const { mutate: joinHouse, isPending, error } = useJoinHouseWithInviteCode();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const code = inviteCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      return;
    }

    joinHouse({ invite_code: code }, {
      onSuccess: () => {
        setInviteCode("");
        notify("👋 Bem-vindo", "Você entrou na casa com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });
  };

  const errorMessage = error instanceof Error ? error.message : "Erro ao entrar na casa";
  const isValidCode = inviteCode.trim().length === 6;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entrar em uma Casa</CardTitle>
        <CardDescription>
          Digite o código de convite para se juntar a uma casa existente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Código de Convite</FieldLabel>
              <input
                type="text"
                placeholder="000000"
                value={inviteCode.toUpperCase()}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={isPending}
                maxLength={6}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono font-bold tracking-widest"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Digite os 6 dígitos do código de convite
              </p>
            </Field>
          </FieldGroup>

          {error && (
            <FieldError>
              {errorMessage}
            </FieldError>
          )}

          <Button
            type="submit"
            disabled={isPending || !isValidCode}
            className="w-full"
          >
            {isPending ? "Entrando..." : "Entrar na Casa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

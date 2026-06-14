import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { useRegenerateInviteCode } from "@/hooks/useHouse";
import { RotateCw } from "lucide-react";

interface InviteCodeSectionProps {
  houseId?: string;
  initialInviteCode?: string | null;
}

export function InviteCodeSection({ initialInviteCode }: InviteCodeSectionProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(initialInviteCode || null);
  const { mutate: regenerateCode, isPending, error } = useRegenerateInviteCode();

  const handleRegenerate = () => {
    regenerateCode(undefined, {
      onSuccess: (data) => {
        setInviteCode(data.invite_code);
      }
    });
  };

  const errorMessage = error instanceof Error ? error.message : "Erro ao regenerar código";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Código de Convite</CardTitle>
        <CardDescription>
          Compartilhe este código para convidar pessoas à sua casa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel>Código (válido por 24 horas)</FieldLabel>
            <div className="px-3 py-1.5 border border-zinc-200 rounded-xs bg-white flex items-center justify-center">
              <p className="text-2xl font-mono font-bold text-zinc-900 text-center">
                {inviteCode ? (
                  inviteCode
                ) : (
                  <span className="text-zinc-400">Nenhum código</span>
                )}
              </p>
            </div>
          </Field>
        </FieldGroup>

        {error && (
          <FieldError>
            {errorMessage}
          </FieldError>
        )}

        <div className="pt-4 border-t border-zinc-200">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isPending}
            className="w-full"
          >
            <RotateCw className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Gerando..." : "Gerar novo código"}
          </Button>
          <p className="text-xs text-zinc-500 mt-2">
            Um novo código será gerado e o anterior será invalidado
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

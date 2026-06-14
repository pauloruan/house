import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogIn } from "lucide-react";
import { CreateHouseForm } from "./CreateHouseForm";
import { JoinHouseForm } from "./JoinHouseForm";

export function HouseSelection() {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");

  if (mode === "create") {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setMode("choice")}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <CreateHouseForm />
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setMode("choice")}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <JoinHouseForm />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl w-full text-left">
      <Card className="w-full">
        <CardHeader className="text-left">
          <CardTitle>Sua Casa</CardTitle>
          <CardDescription className="text-left">
            Você não está associado a nenhuma casa ainda. Crie uma nova ou entre em uma existente com um código de convite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opção: Criar Casa */}
            <Button
              onClick={() => setMode("create")}
              size="lg"
              className="h-auto flex flex-col items-center justify-center gap-3 p-6"
            >
              <Plus className="w-8 h-8" />
              <span className="text-base font-semibold">Criar Nova Casa</span>
              <span className="text-xs text-white/70">Você será o administrador</span>
            </Button>

            {/* Opção: Entrar com Código */}
            <Button
              onClick={() => setMode("join")}
              variant="outline"
              size="lg"
              className="h-auto flex flex-col items-center justify-center gap-3 p-6"
            >
              <LogIn className="w-8 h-8" />
              <span className="text-base font-semibold">Entrar com Código</span>
              <span className="text-xs text-zinc-600">Use um código de convite</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

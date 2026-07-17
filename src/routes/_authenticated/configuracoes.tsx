import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  const { etw, updateEtw } = useApp();
  const [local, setLocal] = useState(etw);
  const [newSocio, setNewSocio] = useState("");

  const save = () => {
    updateEtw(local);
    toast.success("Dados da Etw Art atualizados");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados fixos da CONTRATADA usados em todos os contratos e propostas."
        actions={<Button onClick={save}>Salvar</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da ETW Art Contabilidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Razão social</Label>
            <Input
              value={local.razaoSocial}
              onChange={(e) => setLocal({ ...local, razaoSocial: e.target.value })}
            />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input
              value={local.cnpj}
              onChange={(e) => setLocal({ ...local, cnpj: e.target.value })}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              value={local.email}
              onChange={(e) => setLocal({ ...local, email: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input
              value={local.endereco}
              onChange={(e) => setLocal({ ...local, endereco: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Foro</Label>
            <Input
              value={local.foro}
              onChange={(e) => setLocal({ ...local, foro: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Sócios-administradores (signatários padrão)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {local.socios.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input
                  value={s}
                  onChange={(e) => {
                    const next = [...local.socios];
                    next[i] = e.target.value;
                    setLocal({ ...local, socios: next });
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setLocal({
                      ...local,
                      socios: local.socios.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do novo sócio"
              value={newSocio}
              onChange={(e) => setNewSocio(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (!newSocio.trim()) return;
                setLocal({ ...local, socios: [...local.socios, newSocio.trim()] });
                setNewSocio("");
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

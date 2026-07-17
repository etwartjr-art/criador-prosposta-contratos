import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus, Trash2, Pencil } from "lucide-react";
import { useApp } from "@/store/app";
import type { Service, ServiceModule } from "@/lib/types";

export const Route = createFileRoute("/servicos")({
  component: ServicesPage,
});

const MODULES: (ServiceModule | "Outros")[] = [
  "BPO Financeiro e Gestão de Tesouraria",
  "Contabilidade Consultiva e Fiscal",
  "Departamento Pessoal",
  "Gestão Estratégica e Processos",
  "Contabilidade Consultiva Comercial",
  "Outros",
];

const MODULE_COLORS: Record<string, string> = {
  "BPO Financeiro e Gestão de Tesouraria": "bg-blue-100 text-blue-800",
  "Contabilidade Consultiva e Fiscal": "bg-green-100 text-green-800",
  "Departamento Pessoal": "bg-purple-100 text-purple-800",
  "Gestão Estratégica e Processos": "bg-orange-100 text-orange-800",
  "Contabilidade Consultiva Comercial": "bg-pink-100 text-pink-800",
  Outros: "bg-gray-100 text-gray-800",
};

function ServicesPage() {
  const { services, addService, updateService, removeService } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const grouped = services.reduce(
    (acc, s) => {
      (acc[s.modulo] ??= []).push(s);
      return acc;
    },
    {} as Record<string, Service[]>,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Serviços"
        description="Módulos e itens reaproveitáveis nas propostas e cláusulas dos contratos."
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Novo serviço
              </Button>
            </DialogTrigger>
            <ServiceForm
              initial={
                editing ?? {
                  nome: "",
                  modulo: "Contabilidade Consultiva e Fiscal",
                  descricaoEscopo: "",
                  clausulaContratual: "",
                }
              }
              onSubmit={(data) => {
                if (editing) {
                  updateService(editing.id, data);
                  toast.success("Serviço atualizado");
                } else {
                  addService(data);
                  toast.success("Serviço criado");
                }
                setOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        }
      />

      <div className="space-y-6">
        {Object.entries(grouped).map(([mod, items]) => (
          <div key={mod}>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {mod}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{s.nome}</h4>
                        <span
                          className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${MODULE_COLORS[s.modulo] ?? "bg-gray-100 text-gray-800"}`}
                        >
                          {s.modulo}
                        </span>
                      </div>
                      <div className="flex">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(s);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Excluir ${s.nome}?`)) {
                              removeService(s.id);
                              toast.success("Excluído");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Escopo:{" "}
                      </span>
                      {s.descricaoEscopo}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Cláusula:{" "}
                      </span>
                      {s.clausulaContratual}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({
  initial,
  onSubmit,
}: {
  initial: Omit<Service, "id"> | Service;
  onSubmit: (data: Omit<Service, "id">) => void;
}) {
  const [data, setData] = useState(initial);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Serviço</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Nome *</Label>
          <Input
            value={data.nome}
            onChange={(e) => setData({ ...data, nome: e.target.value })}
          />
        </div>
        <div>
          <Label>Módulo</Label>
          <Select
            value={data.modulo}
            onValueChange={(v) =>
              setData({ ...data, modulo: v as ServiceModule })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Descrição do escopo (proposta)</Label>
          <Textarea
            rows={3}
            value={data.descricaoEscopo}
            onChange={(e) =>
              setData({ ...data, descricaoEscopo: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Cláusula contratual</Label>
          <Textarea
            rows={3}
            value={data.clausulaContratual}
            onChange={(e) =>
              setData({ ...data, clausulaContratual: e.target.value })
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => {
            if (!data.nome) {
              toast.error("Nome é obrigatório");
              return;
            }
            onSubmit(data as Omit<Service, "id">);
          }}
        >
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

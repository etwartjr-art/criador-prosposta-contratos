import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, UserPlus, Pencil } from "lucide-react";
import { useApp } from "@/store/app";
import type { Client, Representative } from "@/lib/types";
import { maskCEP, maskCNPJ, maskCPF } from "@/lib/format";

export const Route = createFileRoute("/clientes")({
  component: ClientsPage,
});

const emptyClient: Omit<Client, "id" | "createdAt"> = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  regimeTributario: "Simples Nacional",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  email: "",
  telefone: "",
};

function ClientsPage() {
  const { clients, representatives, addClient, updateClient, removeClient } =
    useApp();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  const [repClient, setRepClient] = useState<Client | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.razaoSocial.toLowerCase().includes(q.toLowerCase()) ||
      c.cnpj.includes(q),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Empresas contratantes dos serviços da ETW Art."
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
                <Plus className="mr-1 h-4 w-4" /> Novo cliente
              </Button>
            </DialogTrigger>
            <ClientForm
              initial={editing ?? emptyClient}
              onSubmit={(data) => {
                if (editing) {
                  updateClient(editing.id, data);
                  toast.success("Cliente atualizado");
                } else {
                  addClient(data);
                  toast.success("Cliente cadastrado");
                }
                setOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        }
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por razão social ou CNPJ"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          {filtered.length} de {clients.length}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead>Representantes</TableHead>
                <TableHead className="w-[140px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum cliente cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => {
                const reps = representatives.filter((r) => r.clientId === c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.razaoSocial}
                      {c.nomeFantasia && (
                        <div className="text-xs text-muted-foreground">
                          {c.nomeFantasia}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{c.cnpj}</TableCell>
                    <TableCell>
                      {c.cidade}
                      {c.uf ? ` - ${c.uf}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.regimeTributario}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRepClient(c)}
                      >
                        <UserPlus className="mr-1 h-3 w-3" />
                        {reps.length}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditing(c);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Excluir ${c.razaoSocial}?`)) {
                              removeClient(c.id);
                              toast.success("Cliente excluído");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {repClient && (
        <RepresentativesDialog
          client={repClient}
          onClose={() => setRepClient(null)}
        />
      )}
    </div>
  );
}

function ClientForm({
  initial,
  onSubmit,
}: {
  initial: Omit<Client, "id" | "createdAt"> | Client;
  onSubmit: (data: Omit<Client, "id" | "createdAt">) => void;
}) {
  const [data, setData] = useState(initial);
  const set = (k: keyof Client, v: string) =>
    setData((d) => ({ ...d, [k]: v }));

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Cliente</DialogTitle>
        <DialogDescription>
          Dados da empresa que aparecerão nas propostas e contratos.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Razão social *</Label>
          <Input
            value={data.razaoSocial}
            onChange={(e) => set("razaoSocial", e.target.value)}
          />
        </div>
        <div>
          <Label>Nome fantasia</Label>
          <Input
            value={data.nomeFantasia ?? ""}
            onChange={(e) => set("nomeFantasia", e.target.value)}
          />
        </div>
        <div>
          <Label>CNPJ *</Label>
          <Input
            value={data.cnpj}
            onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
            placeholder="00.000.000/0000-00"
          />
        </div>
        <div>
          <Label>Inscrição estadual</Label>
          <Input
            value={data.inscricaoEstadual ?? ""}
            onChange={(e) => set("inscricaoEstadual", e.target.value)}
          />
        </div>
        <div>
          <Label>Regime tributário</Label>
          <Select
            value={data.regimeTributario}
            onValueChange={(v) => set("regimeTributario", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
              <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
              <SelectItem value="Lucro Real">Lucro Real</SelectItem>
              <SelectItem value="MEI">MEI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Endereço *</Label>
          <Input
            value={data.endereco}
            onChange={(e) => set("endereco", e.target.value)}
            placeholder="Rua, número, bairro"
          />
        </div>
        <div>
          <Label>Cidade *</Label>
          <Input
            value={data.cidade}
            onChange={(e) => set("cidade", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>UF</Label>
            <Input
              value={data.uf}
              maxLength={2}
              onChange={(e) => set("uf", e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <Label>CEP</Label>
            <Input
              value={data.cep}
              onChange={(e) => set("cep", maskCEP(e.target.value))}
            />
          </div>
        </div>
        <div>
          <Label>E-mail</Label>
          <Input
            type="email"
            value={data.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input
            value={data.telefone ?? ""}
            onChange={(e) => set("telefone", e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => {
            if (!data.razaoSocial || !data.cnpj) {
              toast.error("Razão social e CNPJ são obrigatórios");
              return;
            }
            onSubmit(data as Omit<Client, "id" | "createdAt">);
          }}
        >
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function RepresentativesDialog({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const { representatives, addRep, removeRep } = useApp();
  const reps = representatives.filter((r) => r.clientId === client.id);
  const [form, setForm] = useState<Omit<Representative, "id">>({
    clientId: client.id,
    nome: "",
    cpf: "",
    rg: "",
    cargo: "",
    email: "",
    telefone: "",
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Representantes — {client.razaoSocial}</DialogTitle>
          <DialogDescription>
            Pessoas físicas que assinam pelo cliente nos contratos.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Adicionar representante</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input
                value={form.cpf}
                onChange={(e) =>
                  setForm({ ...form, cpf: maskCPF(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input
                value={form.cargo ?? ""}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              />
            </div>
            <div>
              <Label>RG</Label>
              <Input
                value={form.rg ?? ""}
                onChange={(e) => setForm({ ...form, rg: e.target.value })}
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.telefone ?? ""}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  if (!form.nome || !form.cpf) {
                    toast.error("Nome e CPF são obrigatórios");
                    return;
                  }
                  addRep(form);
                  setForm({ ...form, nome: "", cpf: "", rg: "", cargo: "" });
                  toast.success("Representante adicionado");
                }}
              >
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h4 className="mb-2 text-sm font-medium">
            Representantes cadastrados ({reps.length})
          </h4>
          {reps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum ainda.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {reps.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{r.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.cargo ? `${r.cargo} · ` : ""}CPF {r.cpf}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRep(r.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

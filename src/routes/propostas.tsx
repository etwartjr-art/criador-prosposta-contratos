import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useApp } from "@/store/app";
import type { Proposal, ProposalItem, ProposalStatus } from "@/lib/types";
import { brl, formatDate, isExpired, today } from "@/lib/format";

export const Route = createFileRoute("/propostas")({
  component: ProposalsPage,
});

const STATUS_VARIANT: Record<ProposalStatus, string> = {
  Rascunho: "bg-gray-100 text-gray-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aprovada: "bg-green-100 text-green-800",
  Rejeitada: "bg-red-100 text-red-800",
  Expirada: "bg-orange-100 text-orange-800",
};

function ProposalsPage() {
  const {
    proposals,
    clients,
    services,
    addProposal,
    updateProposal,
    removeProposal,
  } = useApp();
  const [open, setOpen] = useState(false);

  const enriched = useMemo(
    () =>
      proposals.map((p) => {
        const effectiveStatus: ProposalStatus =
          p.status === "Enviada" && isExpired(p.dataEmissao, p.validadeDias)
            ? "Expirada"
            : p.status;
        return { ...p, effectiveStatus };
      }),
    [proposals],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propostas / Orçamentos"
        description="Escopo, valores e condições comerciais das propostas enviadas aos clientes."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={clients.length === 0}>
                <Plus className="mr-1 h-4 w-4" /> Nova proposta
              </Button>
            </DialogTrigger>
            <NewProposalDialog
              onCreate={(data) => {
                const p = addProposal(data);
                toast.success(`Proposta ${p.numero} criada`);
                setOpen(false);
              }}
            />
          </Dialog>
        }
      />

      {clients.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Cadastre um{" "}
            <Link to="/clientes" className="underline">
              cliente
            </Link>{" "}
            antes de criar propostas.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Honorários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[160px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enriched.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma proposta ainda.
                  </TableCell>
                </TableRow>
              )}
              {enriched.map((p) => {
                const client = clients.find((c) => c.id === p.clientId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/propostas/$id"
                        params={{ id: p.id }}
                        className="hover:underline"
                      >
                        {p.numero}
                      </Link>
                    </TableCell>
                    <TableCell>{client?.razaoSocial ?? "—"}</TableCell>
                    <TableCell>{formatDate(p.dataEmissao)}</TableCell>
                    <TableCell>{p.validadeDias}d</TableCell>
                    <TableCell>{brl(p.honorariosMensais)}/mês</TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${STATUS_VARIANT[p.effectiveStatus]}`}
                      >
                        {p.effectiveStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to="/propostas/$id" params={{ id: p.id }}>
                            <FileText className="mr-1 h-3 w-3" /> Abrir
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Excluir ${p.numero}?`)) {
                              removeProposal(p.id);
                              toast.success("Excluída");
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
    </div>
  );
}

function NewProposalDialog({
  onCreate,
}: {
  onCreate: (data: Omit<Proposal, "id" | "numero" | "status" | "createdAt">) => void;
}) {
  const { clients, services } = useApp();
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [dataEmissao, setDataEmissao] = useState(today());
  const [validade, setValidade] = useState(30);
  const [honorarios, setHonorarios] = useState(0);
  const [implantacao, setImplantacao] = useState(0);
  const [obs, setObs] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Extra info per catalog service (keyed by service id).
  const [catalogInfo, setCatalogInfo] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<ProposalItem[]>([]);
  const [cNome, setCNome] = useState("");
  const [cModulo, setCModulo] = useState("Outros");
  const [cDesc, setCDesc] = useState("");
  const [cInfo, setCInfo] = useState("");

  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  };

  const addCustom = () => {
    if (!cNome.trim()) {
      toast.error("Informe o nome do processo/serviço");
      return;
    }
    setCustom([
      ...custom,
      {
        serviceId: `custom-${Date.now()}`,
        nome: cNome.trim(),
        modulo: cModulo || "Outros",
        descricao: cDesc.trim(),
        informacoes: cInfo.trim() || undefined,
      },
    ]);
    setCNome("");
    setCDesc("");
    setCInfo("");
    setCModulo("Outros");
  };

  const removeCustom = (idx: number) =>
    setCustom(custom.filter((_, i) => i !== idx));

  const totalItems = selected.size + custom.length;

  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova proposta</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Cliente *</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.razaoSocial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Data de emissão</Label>
          <Input
            type="date"
            value={dataEmissao}
            onChange={(e) => setDataEmissao(e.target.value)}
          />
        </div>
        <div>
          <Label>Validade (dias)</Label>
          <Input
            type="number"
            value={validade}
            onChange={(e) => setValidade(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Honorários mensais (R$) *</Label>
          <Input
            type="number"
            step="0.01"
            value={honorarios}
            onChange={(e) => setHonorarios(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Taxa de implantação (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={implantacao}
            onChange={(e) => setImplantacao(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Observações</Label>
          <Textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>
            Serviços do catálogo ({selected.size} selecionado
            {selected.size === 1 ? "" : "s"})
          </Label>
          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {services.map((s) => {
              const checked = selected.has(s.id);
              return (
                <div key={s.id} className="rounded p-2 hover:bg-muted">
                  <label className="flex cursor-pointer items-start gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(s.id)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{s.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.modulo} · {s.descricaoEscopo}
                      </div>
                    </div>
                  </label>
                  {checked && (
                    <Textarea
                      rows={2}
                      className="mt-2 text-xs"
                      placeholder="Informações adicionais para este serviço (opcional): valores, prazos, particularidades, dados do cliente..."
                      value={catalogInfo[s.id] ?? ""}
                      onChange={(e) =>
                        setCatalogInfo({
                          ...catalogInfo,
                          [s.id]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2 rounded-md border border-dashed border-border p-3">
          <Label className="text-sm font-semibold">
            Processos/serviços personalizados ({custom.length})
          </Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Adicione quantos processos extras precisar, fora do catálogo.
          </p>

          {custom.length > 0 && (
            <div className="mb-3 space-y-1">
              {custom.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 rounded border border-border bg-muted/30 p-2"
                >
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{it.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.modulo}
                      {it.descricao ? ` · ${it.descricao}` : ""}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeCustom(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Nome do processo/serviço"
              value={cNome}
              onChange={(e) => setCNome(e.target.value)}
            />
            <Input
              placeholder="Módulo (ex.: Fiscal, Outros)"
              value={cModulo}
              onChange={(e) => setCModulo(e.target.value)}
            />
            <Textarea
              rows={2}
              className="sm:col-span-2"
              placeholder="Descrição / escopo (opcional)"
              value={cDesc}
              onChange={(e) => setCDesc(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={addCustom}>
                <Plus className="mr-1 h-4 w-4" /> Adicionar processo
              </Button>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => {
            if (!clientId || totalItems === 0 || !honorarios) {
              toast.error(
                "Selecione cliente, ao menos um serviço/processo e informe honorários",
              );
              return;
            }
            const catalogItems: ProposalItem[] = services
              .filter((s) => selected.has(s.id))
              .map((s) => ({
                serviceId: s.id,
                nome: s.nome,
                modulo: s.modulo,
                descricao: s.descricaoEscopo,
              }));
            onCreate({
              clientId,
              dataEmissao,
              validadeDias: validade,
              items: [...catalogItems, ...custom],
              honorariosMensais: honorarios,
              taxaImplantacao: implantacao,
              observacoes: obs,
            });
          }}
        >
          Criar proposta
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}


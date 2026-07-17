import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Plus, FileText, Trash2, Eye, Pencil } from "lucide-react";
import { useApp } from "@/store/app";
import type { Proposal, ProposalItem, ProposalStatus } from "@/lib/types";
import { brl, formatDate, isExpired, today } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/propostas")({
  validateSearch: (s: Record<string, unknown>) => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
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
  const { edit: editId } = Route.useSearch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);

  useEffect(() => {
    if (editId) {
      const p = proposals.find((x) => x.id === editId);
      if (p) {
        setEditing(p);
        setOpen(true);
      }
    }
  }, [editId, proposals]);

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
          <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditing(null);
              if (editId) navigate({ to: "/propostas", search: {} });
            }
          }}>
            <DialogTrigger asChild>
              <Button disabled={clients.length === 0} onClick={() => setEditing(null)}>
                <Plus className="mr-1 h-4 w-4" /> Nova proposta
              </Button>
            </DialogTrigger>
            <ProposalDialog
              key={editing?.id ?? "new"}
              initial={editing}
              onSubmit={(data) => {
                if (editing) {
                  updateProposal(editing.id, data);
                  toast.success(`Proposta ${editing.numero} atualizada`);
                } else {
                  const p = addProposal(data);
                  toast.success(`Proposta ${p.numero} criada`);
                }
                setOpen(false);
                setEditing(null);
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
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={`/propostas/${p.id}/documento`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Eye className="mr-1 h-3 w-3" /> Documento
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
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

type ProposalFormData = Omit<Proposal, "id" | "numero" | "status" | "createdAt">;

function ProposalDialog({
  initial,
  onSubmit,
}: {
  initial: Proposal | null;
  onSubmit: (data: ProposalFormData) => void;
}) {
  const { clients, services, representatives } = useApp();
  const isEdit = !!initial;

  // Split initial items into catalog (matches a service id) vs custom
  const initialCatalogIds = new Set<string>();
  const initialCatalogInfo: Record<string, string> = {};
  const initialCustom: ProposalItem[] = [];
  if (initial) {
    for (const it of initial.items) {
      if (services.some((s) => s.id === it.serviceId)) {
        initialCatalogIds.add(it.serviceId);
        if (it.informacoes) initialCatalogInfo[it.serviceId] = it.informacoes;
      } else {
        initialCustom.push(it);
      }
    }
  }

  const [clientId, setClientId] = useState<string>(
    initial?.clientId ?? clients[0]?.id ?? "",
  );
  const [dataEmissao, setDataEmissao] = useState(initial?.dataEmissao ?? today());
  const [validade, setValidade] = useState(initial?.validadeDias ?? 30);
  const [honorarios, setHonorarios] = useState(initial?.honorariosMensais ?? 0);
  const [implantacao, setImplantacao] = useState(initial?.taxaImplantacao ?? 0);
  const [obs, setObs] = useState(initial?.observacoes ?? "");
  const [selected, setSelected] = useState<Set<string>>(initialCatalogIds);
  const [catalogInfo, setCatalogInfo] = useState<Record<string, string>>(initialCatalogInfo);
  const [custom, setCustom] = useState<ProposalItem[]>(initialCustom);
  const [assunto, setAssunto] = useState(initial?.assunto ?? "");
  const [cidadeUf, setCidadeUf] = useState(initial?.cidadeUf ?? "");
  const [responsavelId, setResponsavelId] = useState(initial?.responsavelClienteId ?? "");
  const [indiceReajuste, setIndiceReajuste] = useState(initial?.indiceReajuste ?? "IPCA");
  const [formaPagamento, setFormaPagamento] = useState(initial?.formaPagamento ?? "Boleto bancário");
  const [diaVencimento, setDiaVencimento] = useState<number | "">(initial?.diaVencimento ?? 5);
  const [diaUtilEntrega, setDiaUtilEntrega] = useState<number | "">(initial?.diaUtilEntrega ?? "");
  const [prazoImplantacao, setPrazoImplantacao] = useState<number | "">(initial?.prazoImplementacaoDias ?? "");

  const clientReps = representatives.filter((r) => r.clientId === clientId);

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
        <DialogTitle>{isEdit ? `Editar proposta ${initial!.numero}` : "Nova proposta"}</DialogTitle>
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
                    {it.informacoes && (
                      <div className="mt-1 text-xs italic text-muted-foreground">
                        Info: {it.informacoes}
                      </div>
                    )}
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
            <Textarea
              rows={2}
              className="sm:col-span-2"
              placeholder="Informações adicionais (opcional): valores, prazos, dados específicos, particularidades..."
              value={cInfo}
              onChange={(e) => setCInfo(e.target.value)}
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
              .map((s) => {
                const info = catalogInfo[s.id]?.trim();
                return {
                  serviceId: s.id,
                  nome: s.nome,
                  modulo: s.modulo,
                  descricao: s.descricaoEscopo,
                  informacoes: info || undefined,
                };
              });
            onSubmit({
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
          {isEdit ? "Salvar alterações" : "Criar proposta"}
        </Button>

      </DialogFooter>
    </DialogContent>
  );
}


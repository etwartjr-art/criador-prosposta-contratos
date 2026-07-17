import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { ContractDocument } from "@/components/documents";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Printer, CheckCircle2, Eye } from "lucide-react";
import type { ContractStatus } from "@/lib/types";

export const Route = createFileRoute("/contratos/$id")({
  component: ContractDetail,
});

function ContractDetail() {
  const { id } = Route.useParams();
  const {
    contracts,
    proposals,
    clients,
    representatives,
    etw,
    updateContract,
  } = useApp();

  const contract = contracts.find((c) => c.id === id);
  if (!contract) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/contratos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Contrato não encontrado.</p>
      </div>
    );
  }
  const client = clients.find((c) => c.id === contract.clientId);
  if (!client) return null;
  const proposal = proposals.find((p) => p.id === contract.proposalId);
  const reps = representatives.filter((r) => r.clientId === client.id);

  const canBeVigente =
    contract.signatariosClienteIds.length >= 1 &&
    contract.signatariosContratada.filter(Boolean).length >= 1;

  const toggleSignRep = (repId: string) => {
    const set = new Set(contract.signatariosClienteIds);
    if (set.has(repId)) set.delete(repId);
    else set.add(repId);
    updateContract(contract.id, { signatariosClienteIds: Array.from(set) });
  };

  const toggleSocio = (socio: string) => {
    const list = contract.signatariosContratada.includes(socio)
      ? contract.signatariosContratada.filter((s) => s !== socio)
      : [...contract.signatariosContratada, socio];
    updateContract(contract.id, { signatariosContratada: list });
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title={contract.numero}
          description={`${client.razaoSocial} · Status: ${contract.status}`}
          actions={
            <>
              <Button variant="ghost" asChild>
                <Link to="/contratos">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                </Link>
              </Button>
              <Select
                value={contract.status}
                onValueChange={(v) => {
                  if (v === "Vigente" && !canBeVigente) {
                    toast.error(
                      "Marque ao menos 1 representante do cliente e 1 sócio da ETW como signatários",
                    );
                    return;
                  }
                  updateContract(contract.id, { status: v as ContractStatus });
                  toast.success(`Status: ${v}`);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Aguardando assinatura">
                    Aguardando assinatura
                  </SelectItem>
                  <SelectItem value="Vigente">Vigente</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Rescindido">Rescindido</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-1 h-4 w-4" /> Imprimir / PDF
              </Button>
            </>
          }
        />
      </div>

      <div className="no-print grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vigência e valor</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Início</Label>
              <Input
                type="date"
                value={contract.inicioVigencia}
                onChange={(e) =>
                  updateContract(contract.id, { inicioVigencia: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Fim</Label>
              <Input
                type="date"
                value={contract.fimVigencia}
                onChange={(e) =>
                  updateContract(contract.id, { fimVigencia: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Valor mensal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={contract.valorMensal}
                onChange={(e) =>
                  updateContract(contract.id, {
                    valorMensal: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Signatários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">
                Contratante (cliente)
              </Label>
              {reps.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Nenhum representante cadastrado — abra o cliente para adicionar.
                </p>
              ) : (
                <div className="mt-2 space-y-1">
                  {reps.map((r) => (
                    <label
                      key={r.id}
                      className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted"
                    >
                      <Checkbox
                        checked={contract.signatariosClienteIds.includes(r.id)}
                        onCheckedChange={() => toggleSignRep(r.id)}
                      />
                      <span className="text-sm">
                        {r.nome}
                        {r.cargo ? ` — ${r.cargo}` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">
                Contratada (ETW Art)
              </Label>
              <div className="mt-2 space-y-1">
                {etw.socios.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted"
                  >
                    <Checkbox
                      checked={contract.signatariosContratada.includes(s)}
                      onCheckedChange={() => toggleSocio(s)}
                    />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            {canBeVigente && contract.status !== "Vigente" && (
              <Button
                size="sm"
                onClick={() => {
                  updateContract(contract.id, { status: "Vigente" });
                  toast.success("Contrato marcado como Vigente");
                }}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" /> Marcar como Vigente
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="print-area">
        <ContractDocument
          contract={contract}
          proposal={proposal}
          client={client}
          representatives={representatives}
          etw={etw}
        />
      </div>
    </div>
  );
}

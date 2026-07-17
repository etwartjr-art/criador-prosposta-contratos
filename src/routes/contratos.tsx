import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, formatDate } from "@/lib/format";
import { FileSignature, Trash2 } from "lucide-react";
import type { ContractStatus } from "@/lib/types";

export const Route = createFileRoute("/contratos")({
  component: ContractsPage,
});

const STATUS_COLOR: Record<ContractStatus, string> = {
  Rascunho: "bg-gray-100 text-gray-800",
  "Aguardando assinatura": "bg-yellow-100 text-yellow-800",
  Vigente: "bg-green-100 text-green-800",
  Encerrado: "bg-gray-100 text-gray-800",
  Rescindido: "bg-red-100 text-red-800",
};

function ContractsPage() {
  const { contracts, clients, removeContract } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Contratos de prestação de serviços contábeis gerados a partir das propostas aprovadas."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Valor mensal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[160px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum contrato. Aprove uma proposta para gerar.
                  </TableCell>
                </TableRow>
              )}
              {contracts.map((c) => {
                const client = clients.find((x) => x.id === c.clientId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/contratos/$id"
                        params={{ id: c.id }}
                        className="hover:underline"
                      >
                        {c.numero}
                      </Link>
                    </TableCell>
                    <TableCell>{client?.razaoSocial ?? "—"}</TableCell>
                    <TableCell>
                      {formatDate(c.inicioVigencia)} → {formatDate(c.fimVigencia)}
                    </TableCell>
                    <TableCell>{brl(c.valorMensal)}/mês</TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${STATUS_COLOR[c.status]}`}
                      >
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to="/contratos/$id" params={{ id: c.id }}>
                            <FileSignature className="mr-1 h-3 w-3" /> Abrir
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Excluir ${c.numero}?`)) {
                              removeContract(c.id);
                              toast.success("Excluído");
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

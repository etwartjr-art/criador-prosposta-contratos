import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { ProposalDocument } from "@/components/documents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Printer, XCircle, Send, Eye, Pencil } from "lucide-react";
import type { ProposalStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/propostas/$id")({
  component: ProposalDetail,
});

function ProposalDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { proposals, clients, etw, representatives, updateProposal, approveProposal } = useApp();
  const proposal = proposals.find((p) => p.id === id);

  if (!proposal) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/propostas">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Proposta não encontrada.</p>
      </div>
    );
  }
  const client = clients.find((c) => c.id === proposal.clientId);
  if (!client) return null;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title={proposal.numero}
          description={`${client.razaoSocial} · Status: ${proposal.status}`}
          actions={
            <>
              <Button variant="ghost" asChild>
                <Link to="/propostas">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                </Link>
              </Button>
              <Select
                value={proposal.status}
                onValueChange={(v) =>
                  updateProposal(proposal.id, { status: v as ProposalStatus })
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Enviada">Enviada</SelectItem>
                  <SelectItem value="Aprovada">Aprovada</SelectItem>
                  <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="Expirada">Expirada</SelectItem>
                </SelectContent>
              </Select>
              {proposal.status !== "Enviada" && proposal.status === "Rascunho" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    updateProposal(proposal.id, { status: "Enviada" });
                    toast.success("Proposta marcada como enviada");
                  }}
                >
                  <Send className="mr-1 h-4 w-4" /> Marcar como enviada
                </Button>
              )}
              {proposal.status !== "Aprovada" && (
                <Button
                  onClick={() => {
                    const contract = approveProposal(proposal.id);
                    if (contract) {
                      toast.success(`Contrato ${contract.numero} gerado`);
                      navigate({
                        to: "/contratos/$id",
                        params: { id: contract.id },
                      });
                    }
                  }}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Aprovar e gerar
                  contrato
                </Button>
              )}
              {proposal.status === "Enviada" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    updateProposal(proposal.id, { status: "Rejeitada" });
                    toast.info("Marcada como rejeitada");
                  }}
                >
                  <XCircle className="mr-1 h-4 w-4" /> Rejeitar
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/propostas" search={{ edit: proposal.id }}>
                  <Pencil className="mr-1 h-4 w-4" /> Editar
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`/propostas/${proposal.id}/documento`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye className="mr-1 h-4 w-4" /> Ver documento
                </a>
              </Button>

              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-1 h-4 w-4" /> Imprimir / PDF
              </Button>
            </>
          }
        />
      </div>

      <div className="print-area">
        <ProposalDocument proposal={proposal} client={client} etw={etw} />
      </div>
    </div>
  );
}

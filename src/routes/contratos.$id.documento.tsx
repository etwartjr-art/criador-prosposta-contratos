import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { ContractDocument } from "@/components/documents";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/download-pdf";
import { ShareLinkButtons } from "@/components/share-link-buttons";

export const Route = createFileRoute("/contratos/$id/documento")({
  component: ContractDocumentPage,
});

function ContractDocumentPage() {
  const { id } = Route.useParams();
  const { contracts, proposals, clients, representatives, etw } = useApp();
  const contract = contracts.find((c) => c.id === id);
  const client = contract ? clients.find((c) => c.id === contract.clientId) : null;
  const proposal = contract
    ? proposals.find((p) => p.id === contract.proposalId)
    : undefined;

  useEffect(() => {
    if (contract) document.title = `Contrato ${contract.numero}`;
  }, [contract]);

  if (!contract || !client) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild>
          <Link to="/contratos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Contrato não encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="no-print mx-auto mb-4 flex max-w-5xl items-center justify-between px-4">
        <Button variant="ghost" asChild>
          <Link to="/contratos/$id" params={{ id: contract.id }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao contrato
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" /> Imprimir
          </Button>
          <Button
            onClick={() =>
              downloadElementAsPdf(".print-area", `Contrato-${contract.numero}`)
            }
          >
            <Download className="mr-1 h-4 w-4" /> Baixar PDF
          </Button>
        </div>
      </div>
      <div className="print-area mx-auto max-w-5xl bg-background shadow-sm">
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

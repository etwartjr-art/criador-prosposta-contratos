import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { ProposalDocument } from "@/components/documents";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/download-pdf";
import { ShareLinkButtons } from "@/components/share-link-buttons";

export const Route = createFileRoute("/_authenticated/propostas/$id/documento")({
  component: ProposalDocumentPage,
});

function ProposalDocumentPage() {
  const { id } = Route.useParams();
  const { proposals, clients, etw, representatives } = useApp();
  const proposal = proposals.find((p) => p.id === id);
  const client = proposal ? clients.find((c) => c.id === proposal.clientId) : null;

  useEffect(() => {
    if (proposal) document.title = `Proposta ${proposal.numero}`;
  }, [proposal]);

  if (!proposal || !client) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild>
          <Link to="/propostas">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Proposta não encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="no-print mx-auto mb-4 flex max-w-5xl items-center justify-between px-4">
        <Button variant="ghost" asChild>
          <Link to="/propostas/$id" params={{ id: proposal.id }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar à proposta
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <ShareLinkButtons title={`Proposta ${proposal.numero}`} />
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" /> Imprimir
          </Button>
          <Button
            onClick={() =>
              downloadElementAsPdf(".print-area", `Proposta-${proposal.numero}`)
            }
          >
            <Download className="mr-1 h-4 w-4" /> Baixar PDF
          </Button>
        </div>
      </div>
      <div className="print-area mx-auto max-w-5xl bg-background shadow-sm">
        <ProposalDocument proposal={proposal} client={client} etw={etw} representatives={representatives} />
      </div>
    </div>
  );
}

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { ContractDocument } from "@/components/documents";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/download-pdf";
import { supabase } from "@/integrations/supabase/client";
import { addDays, today } from "@/lib/format";
import { nanoid } from "nanoid";
import type { Contract } from "@/lib/types";

export const Route = createFileRoute("/propostas/$id/contrato-preview")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: ContractPreviewPage,
});

function ContractPreviewPage() {
  const { id } = Route.useParams();
  const { proposals, clients, representatives, etw, hydrated, hydrate } =
    useApp();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const proposal = proposals.find((p) => p.id === id);
  const client = proposal ? clients.find((c) => c.id === proposal.clientId) : null;

  const preview = useMemo<Contract | null>(() => {
    if (!proposal) return null;
    const inicio = today();
    return {
      id: nanoid(),
      numero: "PRÉVIA",
      proposalId: proposal.id,
      clientId: proposal.clientId,
      inicioVigencia: inicio,
      fimVigencia: addDays(inicio, 365),
      valorMensal: proposal.honorariosMensais,
      services: proposal.items,
      signatariosClienteIds: proposal.responsavelClienteId
        ? [proposal.responsavelClienteId]
        : [],
      signatariosContratada: etw.socios.filter(Boolean),
      status: "Rascunho",
      createdAt: new Date().toISOString(),
      prazoVigenciaMeses: 12,
      renovacaoAutomaticaDias: 30,
      avisoNaoRenovacaoDias: 30,
      avisoPrevioRescisaoDias: 30,
      diaPagamento: proposal.diaVencimento ?? 5,
      formaPagamento: proposal.formaPagamento ?? "Boleto bancário",
      jurosMesPercent: 1,
      multaMoratoriaPercent: 2,
      foro: etw.foro,
    };
  }, [proposal, etw]);

  useEffect(() => {
    if (proposal) document.title = `Prévia do contrato · ${proposal.numero}`;
  }, [proposal]);

  if (!hydrated) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Carregando prévia…</div>
    );
  }

  if (!proposal || !client || !preview) {
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
          <span className="self-center rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
            Prévia — contrato ainda não gerado
          </span>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" /> Imprimir
          </Button>
          <Button
            onClick={() =>
              downloadElementAsPdf(
                ".print-area",
                `Previa-contrato-${proposal.numero}`,
              )
            }
          >
            <Download className="mr-1 h-4 w-4" /> Baixar PDF
          </Button>
        </div>
      </div>
      <div className="print-area mx-auto max-w-5xl bg-background shadow-sm">
        <ContractDocument
          contract={preview}
          proposal={proposal}
          client={client}
          representatives={representatives}
          etw={etw}
        />
      </div>
    </div>
  );
}

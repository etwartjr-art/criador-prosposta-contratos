import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl, formatDate } from "@/lib/format";
import { Users, FileText, FileSignature, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

function Dashboard() {
  const { clients, proposals, contracts } = useApp();

  const vigentes = contracts.filter((c) => c.status === "Vigente");
  const mrr = vigentes.reduce((s, c) => s + c.valorMensal, 0);
  const abertas = proposals.filter(
    (p) => p.status === "Rascunho" || p.status === "Enviada",
  );

  const cards = [
    {
      label: "Clientes",
      value: clients.length,
      icon: Users,
      hint: "cadastrados",
    },
    {
      label: "Propostas em aberto",
      value: abertas.length,
      icon: FileText,
      hint: `${proposals.length} no total`,
    },
    {
      label: "Contratos vigentes",
      value: vigentes.length,
      icon: FileSignature,
      hint: `${contracts.length} no total`,
    },
    {
      label: "Receita recorrente",
      value: brl(mrr),
      icon: TrendingUp,
      hint: "mensal (MRR)",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral de clientes, propostas e contratos da ETW Art Contabilidade."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/clientes">Novo cliente</Link>
            </Button>
            <Button asChild>
              <Link to="/propostas">Nova proposta</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{c.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas propostas</CardTitle>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma proposta ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {proposals
                  .slice(-6)
                  .reverse()
                  .map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);
                    return (
                      <li
                        key={p.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <Link
                            to="/propostas/$id"
                            params={{ id: p.id }}
                            className="font-medium hover:underline"
                          >
                            {p.numero}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {client?.razaoSocial ?? "—"} · {formatDate(p.dataEmissao)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {brl(p.honorariosMensais)}/mês
                          </span>
                          <Badge variant="secondary">{p.status}</Badge>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contratos ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {vigentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum contrato vigente.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {vigentes.slice(0, 6).map((c) => {
                  const client = clients.find((x) => x.id === c.clientId);
                  return (
                    <li
                      key={c.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <Link
                          to="/contratos/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:underline"
                        >
                          {c.numero}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {client?.razaoSocial ?? "—"} · até{" "}
                          {formatDate(c.fimVigencia)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {brl(c.valorMensal)}/mês
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

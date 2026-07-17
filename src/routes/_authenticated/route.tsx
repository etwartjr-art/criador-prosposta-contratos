import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useApp } from "@/store/app";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: AuthedShell,
});

function PageTitle() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const map: Record<string, string> = {
    "/": "Dashboard",
    "/clientes": "Clientes",
    "/servicos": "Catálogo de Serviços",
    "/propostas": "Propostas / Orçamentos",
    "/contratos": "Contratos",
    "/configuracoes": "Configurações",
  };
  const title =
    map[pathname] ??
    (pathname.startsWith("/propostas")
      ? "Proposta"
      : pathname.startsWith("/contratos")
        ? "Contrato"
        : pathname.startsWith("/clientes")
          ? "Cliente"
          : "");
  return <span className="text-sm font-medium text-foreground">{title}</span>;
}

function StoreHydrator() {
  const hydrate = useApp((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

function AuthedShell() {
  return (
    <SidebarProvider>
      <StoreHydrator />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="no-print sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <PageTitle />
          </header>
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

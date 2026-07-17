import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Página não encontrada.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ir para o início
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "ETW Art — Contratos & Orçamentos" },
        {
          name: "description",
          content:
            "Sistema de contratos e orçamentos da ETW Art Contabilidade: clientes, propostas e contratos de prestação de serviços contábeis.",
        },
        {
          property: "og:title",
          content: "ETW Art — Contratos & Orçamentos",
        },
        {
          property: "og:description",
          content:
            "Cadastre clientes, monte orçamentos e gere contratos da ETW Art Contabilidade.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:wght@500;600;700&display=swap",
        },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreHydrator />
      <SidebarProvider>
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
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

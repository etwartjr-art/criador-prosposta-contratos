import { create } from "zustand";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type {
  Client,
  Contract,
  EtwSettings,
  Proposal,
  ProposalItem,
  Representative,
  Service,
  ServiceModule,
} from "@/lib/types";
import { DEFAULT_ETW } from "@/lib/etw";
import { addDays, isExpired } from "@/lib/format";

interface State {
  hydrated: boolean;
  etw: EtwSettings;
  clients: Client[];
  representatives: Representative[];
  services: Service[];
  proposals: Proposal[];
  contracts: Contract[];

  hydrate: () => Promise<void>;

  updateEtw: (patch: Partial<EtwSettings>) => void;

  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;

  addRep: (r: Omit<Representative, "id">) => Representative;
  updateRep: (id: string, patch: Partial<Representative>) => void;
  removeRep: (id: string) => void;

  addService: (s: Omit<Service, "id">) => Service;
  updateService: (id: string, patch: Partial<Service>) => void;
  removeService: (id: string) => void;

  addProposal: (
    p: Omit<Proposal, "id" | "numero" | "createdAt" | "status">,
  ) => Proposal;
  updateProposal: (id: string, patch: Partial<Proposal>) => void;
  removeProposal: (id: string) => void;
  approveProposal: (id: string) => Contract | null;

  updateContract: (id: string, patch: Partial<Contract>) => void;
  removeContract: (id: string) => void;
}

const seqNumber = (prefix: string, list: { numero: string }[]) => {
  const year = new Date().getFullYear();
  const next = list.length + 1;
  return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
};

// ---------------- mappers (db row <-> app type) ----------------

const mapClient = (r: any): Client => ({
  id: r.id,
  razaoSocial: r.razao_social,
  nomeFantasia: r.nome_fantasia ?? undefined,
  cnpj: r.cnpj,
  inscricaoEstadual: r.inscricao_estadual ?? undefined,
  regimeTributario: r.regime_tributario ?? undefined,
  endereco: r.endereco,
  cidade: r.cidade,
  uf: r.uf,
  cep: r.cep,
  email: r.email ?? undefined,
  telefone: r.telefone ?? undefined,
  createdAt: r.created_at,
});
const clientToRow = (c: Client) => ({
  id: c.id,
  razao_social: c.razaoSocial,
  nome_fantasia: c.nomeFantasia ?? null,
  cnpj: c.cnpj,
  inscricao_estadual: c.inscricaoEstadual ?? null,
  regime_tributario: c.regimeTributario ?? null,
  endereco: c.endereco,
  cidade: c.cidade,
  uf: c.uf,
  cep: c.cep,
  email: c.email ?? null,
  telefone: c.telefone ?? null,
  created_at: c.createdAt,
});

const mapRep = (r: any): Representative => ({
  id: r.id,
  clientId: r.client_id,
  nome: r.nome,
  cpf: r.cpf,
  rg: r.rg ?? undefined,
  cargo: r.cargo ?? undefined,
  email: r.email ?? undefined,
  telefone: r.telefone ?? undefined,
  nacionalidade: r.nacionalidade ?? undefined,
  estadoCivil: r.estado_civil ?? undefined,
  profissao: r.profissao ?? undefined,
  dataNascimento: r.data_nascimento ?? undefined,
  endereco: r.endereco ?? undefined,
});
const repToRow = (r: Representative) => ({
  id: r.id,
  client_id: r.clientId,
  nome: r.nome,
  cpf: r.cpf,
  rg: r.rg ?? null,
  cargo: r.cargo ?? null,
  email: r.email ?? null,
  telefone: r.telefone ?? null,
  nacionalidade: r.nacionalidade ?? null,
  estado_civil: r.estadoCivil ?? null,
  profissao: r.profissao ?? null,
  data_nascimento: r.dataNascimento ?? null,
  endereco: r.endereco ?? null,
});

const mapService = (r: any): Service => ({
  id: r.id,
  nome: r.nome,
  modulo: r.modulo as ServiceModule | "Outros",
  descricaoEscopo: r.descricao_escopo,
  clausulaContratual: r.clausula_contratual,
});
const serviceToRow = (s: Service) => ({
  id: s.id,
  nome: s.nome,
  modulo: s.modulo,
  descricao_escopo: s.descricaoEscopo,
  clausula_contratual: s.clausulaContratual,
});

const mapProposal = (r: any): Proposal => ({
  id: r.id,
  numero: r.numero,
  clientId: r.client_id,
  dataEmissao: r.data_emissao,
  validadeDias: r.validade_dias,
  items: (r.items ?? []) as ProposalItem[],
  honorariosMensais: Number(r.honorarios_mensais ?? 0),
  taxaImplantacao: Number(r.taxa_implantacao ?? 0),
  observacoes: r.observacoes ?? undefined,
  status: r.status,
  createdAt: r.created_at,
  assunto: r.assunto ?? undefined,
  cidadeUf: r.cidade_uf ?? undefined,
  responsavelClienteId: r.responsavel_cliente_id ?? undefined,
  indiceReajuste: r.indice_reajuste ?? undefined,
  formaPagamento: r.forma_pagamento ?? undefined,
  diaVencimento: r.dia_vencimento ?? undefined,
  diaUtilEntrega: r.dia_util_entrega ?? undefined,
  prazoImplementacaoDias: r.prazo_implementacao_dias ?? undefined,
});
const proposalToRow = (p: Proposal) => ({
  id: p.id,
  numero: p.numero,
  client_id: p.clientId,
  data_emissao: p.dataEmissao,
  validade_dias: p.validadeDias,
  items: p.items as any,
  honorarios_mensais: p.honorariosMensais,
  taxa_implantacao: p.taxaImplantacao,
  observacoes: p.observacoes ?? null,
  status: p.status,
  created_at: p.createdAt,
  assunto: p.assunto ?? null,
  cidade_uf: p.cidadeUf ?? null,
  responsavel_cliente_id: p.responsavelClienteId ?? null,
  indice_reajuste: p.indiceReajuste ?? null,
  forma_pagamento: p.formaPagamento ?? null,
  dia_vencimento: p.diaVencimento ?? null,
  dia_util_entrega: p.diaUtilEntrega ?? null,
  prazo_implementacao_dias: p.prazoImplementacaoDias ?? null,
});

const mapContract = (r: any): Contract => ({
  id: r.id,
  numero: r.numero,
  proposalId: r.proposal_id ?? undefined,
  clientId: r.client_id,
  inicioVigencia: r.inicio_vigencia,
  fimVigencia: r.fim_vigencia,
  valorMensal: Number(r.valor_mensal ?? 0),
  services: (r.services ?? []) as ProposalItem[],
  signatariosClienteIds: (r.signatarios_cliente_ids ?? []) as string[],
  signatariosContratada: (r.signatarios_contratada ?? []) as string[],
  status: r.status,
  observacoes: r.observacoes ?? undefined,
  createdAt: r.created_at,
  dataAssinatura: r.data_assinatura ?? undefined,
  localDataAssinatura: r.local_data_assinatura ?? undefined,
  prazoVigenciaMeses: r.prazo_vigencia_meses ?? undefined,
  renovacaoAutomaticaDias: r.renovacao_automatica_dias ?? undefined,
  avisoNaoRenovacaoDias: r.aviso_nao_renovacao_dias ?? undefined,
  avisoPrevioRescisaoDias: r.aviso_previo_rescisao_dias ?? undefined,
  diaPagamento: r.dia_pagamento ?? undefined,
  formaPagamento: r.forma_pagamento ?? undefined,
  jurosMesPercent: r.juros_mes_percent != null ? Number(r.juros_mes_percent) : undefined,
  multaMoratoriaPercent: r.multa_moratoria_percent != null ? Number(r.multa_moratoria_percent) : undefined,
  foro: r.foro ?? undefined,
});
const contractToRow = (c: Contract) => ({
  id: c.id,
  numero: c.numero,
  proposal_id: c.proposalId ?? null,
  client_id: c.clientId,
  inicio_vigencia: c.inicioVigencia,
  fim_vigencia: c.fimVigencia,
  valor_mensal: c.valorMensal,
  services: c.services as any,
  signatarios_cliente_ids: c.signatariosClienteIds as any,
  signatarios_contratada: c.signatariosContratada as any,
  status: c.status,
  observacoes: c.observacoes ?? null,
  created_at: c.createdAt,
  data_assinatura: c.dataAssinatura ?? null,
  local_data_assinatura: c.localDataAssinatura ?? null,
  prazo_vigencia_meses: c.prazoVigenciaMeses ?? null,
  renovacao_automatica_dias: c.renovacaoAutomaticaDias ?? null,
  aviso_nao_renovacao_dias: c.avisoNaoRenovacaoDias ?? null,
  aviso_previo_rescisao_dias: c.avisoPrevioRescisaoDias ?? null,
  dia_pagamento: c.diaPagamento ?? null,
  forma_pagamento: c.formaPagamento ?? null,
  juros_mes_percent: c.jurosMesPercent ?? null,
  multa_moratoria_percent: c.multaMoratoriaPercent ?? null,
  foro: c.foro ?? null,
});

const mapEtw = (r: any): EtwSettings => ({
  razaoSocial: r.razao_social,
  cnpj: r.cnpj,
  endereco: r.endereco,
  email: r.email,
  foro: r.foro,
  socios: (r.socios ?? []) as string[],
});

// Fire-and-forget helper: shows a toast and rolls back local state if the write fails.
const bg = (
  label: string,
  promise: PromiseLike<{ error: unknown }>,
  rollback?: () => void,
) => {
  Promise.resolve(promise).then((res) => {
    if (res?.error) {
      console.error(`[store] ${label} failed`, res.error);
      toast.error(
        `Não foi possível salvar (${label}). A alteração foi desfeita — tente novamente.`,
      );
      rollback?.();
    }
  });
};

export const useApp = create<State>()((set, get) => ({
  hydrated: false,
  etw: DEFAULT_ETW,
  clients: [],
  representatives: [],
  services: [],
  proposals: [],
  contracts: [],

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const [etwR, clientsR, repsR, servicesR, propsR, contractsR] =
        await Promise.all([
          supabase.from("etw_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("clients").select("*").order("created_at"),
          supabase.from("representatives").select("*"),
          supabase.from("services").select("*").order("nome"),
          supabase.from("proposals").select("*").order("created_at"),
          supabase.from("contracts").select("*").order("created_at"),
        ]);
      set({
        etw: etwR.data ? mapEtw(etwR.data) : DEFAULT_ETW,
        clients: (clientsR.data ?? []).map(mapClient),
        representatives: (repsR.data ?? []).map(mapRep),
        services: (servicesR.data ?? []).map(mapService),
        proposals: (propsR.data ?? []).map(mapProposal),
        contracts: (contractsR.data ?? []).map(mapContract),
        hydrated: true,
      });
    } catch (err) {
      console.error("[store] hydrate failed", err);
      toast.error("Não foi possível carregar os dados.");
      set({ hydrated: true });
    }
  },

  updateEtw: (patch) => {
    const next = { ...get().etw, ...patch };
    set({ etw: next });
    bg(
      "configurações",
      supabase.from("etw_settings").upsert({
        id: 1,
        razao_social: next.razaoSocial,
        cnpj: next.cnpj,
        endereco: next.endereco,
        email: next.email,
        foro: next.foro,
        socios: next.socios as any,
      }),
    );
  },

  addClient: (c) => {
    const client: Client = {
      ...c,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    set({ clients: [...get().clients, client] });
    bg(
      "cliente",
      supabase.from("clients").insert(clientToRow(client)),
      () => set({ clients: get().clients.filter((c) => c.id !== client.id) }),
    );
    return client;
  },
  updateClient: (id, patch) => {
    const next = get().clients.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    );
    set({ clients: next });
    const updated = next.find((c) => c.id === id);
    if (updated)
      bg(
        "cliente",
        supabase.from("clients").update(clientToRow(updated)).eq("id", id),
      );
  },
  removeClient: (id) => {
    set({
      clients: get().clients.filter((c) => c.id !== id),
      representatives: get().representatives.filter((r) => r.clientId !== id),
    });
    bg("cliente", supabase.from("clients").delete().eq("id", id));
  },

  addRep: (r) => {
    const rep: Representative = { ...r, id: nanoid() };
    set({ representatives: [...get().representatives, rep] });
    bg(
      "representante",
      supabase.from("representatives").insert(repToRow(rep)),
      () =>
        set({
          representatives: get().representatives.filter((r) => r.id !== rep.id),
        }),
    );
    return rep;
  },
  updateRep: (id, patch) => {
    const next = get().representatives.map((r) =>
      r.id === id ? { ...r, ...patch } : r,
    );
    set({ representatives: next });
    const updated = next.find((r) => r.id === id);
    if (updated)
      bg(
        "representante",
        supabase
          .from("representatives")
          .update(repToRow(updated))
          .eq("id", id),
      );
  },
  removeRep: (id) => {
    set({
      representatives: get().representatives.filter((r) => r.id !== id),
    });
    bg("representante", supabase.from("representatives").delete().eq("id", id));
  },

  addService: (s) => {
    const svc: Service = { ...s, id: nanoid() };
    set({ services: [...get().services, svc] });
    bg(
      "serviço",
      supabase.from("services").insert(serviceToRow(svc)),
      () => set({ services: get().services.filter((s) => s.id !== svc.id) }),
    );
    return svc;
  },
  updateService: (id, patch) => {
    const next = get().services.map((s) =>
      s.id === id ? { ...s, ...patch } : s,
    );
    set({ services: next });
    const updated = next.find((s) => s.id === id);
    if (updated)
      bg(
        "serviço",
        supabase.from("services").update(serviceToRow(updated)).eq("id", id),
      );
  },
  removeService: (id) => {
    set({ services: get().services.filter((s) => s.id !== id) });
    bg("serviço", supabase.from("services").delete().eq("id", id));
  },

  addProposal: (p) => {
    const proposal: Proposal = {
      ...p,
      id: nanoid(),
      numero: seqNumber("PROP", get().proposals),
      status: "Rascunho",
      createdAt: new Date().toISOString(),
    };
    set({ proposals: [...get().proposals, proposal] });
    bg(
      "proposta",
      supabase.from("proposals").insert(proposalToRow(proposal)),
      () =>
        set({
          proposals: get().proposals.filter((p) => p.id !== proposal.id),
        }),
    );
    return proposal;
  },
  updateProposal: (id, patch) => {
    const next = get().proposals.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
    set({ proposals: next });
    const updated = next.find((p) => p.id === id);
    if (updated)
      bg(
        "proposta",
        supabase
          .from("proposals")
          .update(proposalToRow(updated))
          .eq("id", id),
      );
  },
  removeProposal: (id) => {
    set({ proposals: get().proposals.filter((p) => p.id !== id) });
    bg("proposta", supabase.from("proposals").delete().eq("id", id));
  },

  approveProposal: (id) => {
    const prop = get().proposals.find((p) => p.id === id);
    if (!prop) return null;
    const inicio = new Date().toISOString().slice(0, 10);
    const fim = addDays(inicio, 365);
    const contract: Contract = {
      id: nanoid(),
      numero: seqNumber("CONT", get().contracts),
      proposalId: prop.id,
      clientId: prop.clientId,
      inicioVigencia: inicio,
      fimVigencia: fim,
      valorMensal: prop.honorariosMensais,
      services: prop.items,
      signatariosClienteIds: prop.responsavelClienteId
        ? [prop.responsavelClienteId]
        : [],
      signatariosContratada: [get().etw.socios[0] ?? ""],
      status: "Rascunho",
      createdAt: new Date().toISOString(),
      prazoVigenciaMeses: 12,
      renovacaoAutomaticaDias: 30,
      avisoNaoRenovacaoDias: 30,
      avisoPrevioRescisaoDias: 30,
      diaPagamento: prop.diaVencimento ?? 5,
      formaPagamento: prop.formaPagamento ?? "Boleto bancário",
      jurosMesPercent: 1,
      multaMoratoriaPercent: 2,
      foro: get().etw.foro,
    };
    const updatedProp = { ...prop, status: "Aprovada" as const };
    set({
      proposals: get().proposals.map((p) => (p.id === id ? updatedProp : p)),
      contracts: [...get().contracts, contract],
    });
    bg(
      "proposta",
      supabase.from("proposals").update({ status: "Aprovada" }).eq("id", id),
      () =>
        set({
          proposals: get().proposals.map((p) => (p.id === id ? prop : p)),
        }),
    );
    bg(
      "contrato",
      supabase.from("contracts").insert(contractToRow(contract)),
      () =>
        set({
          contracts: get().contracts.filter((c) => c.id !== contract.id),
        }),
    );
    return contract;
  },

  updateContract: (id, patch) => {
    const next = get().contracts.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    );
    set({ contracts: next });
    const updated = next.find((c) => c.id === id);
    if (updated)
      bg(
        "contrato",
        supabase
          .from("contracts")
          .update(contractToRow(updated))
          .eq("id", id),
      );
  },
  removeContract: (id) => {
    set({ contracts: get().contracts.filter((c) => c.id !== id) });
    bg("contrato", supabase.from("contracts").delete().eq("id", id));
  },
}));

// Auto-expire proposals (client-side helper)
export const expiredIds = (proposals: Proposal[]) =>
  proposals
    .filter(
      (p) =>
        p.status === "Enviada" && isExpired(p.dataEmissao, p.validadeDias),
    )
    .map((p) => p.id);

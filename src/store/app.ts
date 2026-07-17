import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  Client,
  Contract,
  EtwSettings,
  Proposal,
  Representative,
  Service,
} from "@/lib/types";
import { DEFAULT_ETW, DEFAULT_SERVICES } from "@/lib/etw";
import { addDays, isExpired } from "@/lib/format";

interface State {
  etw: EtwSettings;
  clients: Client[];
  representatives: Representative[];
  services: Service[];
  proposals: Proposal[];
  contracts: Contract[];

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

  addProposal: (p: Omit<Proposal, "id" | "numero" | "createdAt" | "status">) => Proposal;
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

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      etw: DEFAULT_ETW,
      clients: [],
      representatives: [],
      services: DEFAULT_SERVICES,
      proposals: [],
      contracts: [],

      updateEtw: (patch) => set({ etw: { ...get().etw, ...patch } }),

      addClient: (c) => {
        const client: Client = {
          ...c,
          id: nanoid(),
          createdAt: new Date().toISOString(),
        };
        set({ clients: [...get().clients, client] });
        return client;
      },
      updateClient: (id, patch) =>
        set({
          clients: get().clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }),
      removeClient: (id) =>
        set({
          clients: get().clients.filter((c) => c.id !== id),
          representatives: get().representatives.filter((r) => r.clientId !== id),
        }),

      addRep: (r) => {
        const rep: Representative = { ...r, id: nanoid() };
        set({ representatives: [...get().representatives, rep] });
        return rep;
      },
      updateRep: (id, patch) =>
        set({
          representatives: get().representatives.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        }),
      removeRep: (id) =>
        set({ representatives: get().representatives.filter((r) => r.id !== id) }),

      addService: (s) => {
        const svc: Service = { ...s, id: nanoid() };
        set({ services: [...get().services, svc] });
        return svc;
      },
      updateService: (id, patch) =>
        set({
          services: get().services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
      removeService: (id) =>
        set({ services: get().services.filter((s) => s.id !== id) }),

      addProposal: (p) => {
        const proposal: Proposal = {
          ...p,
          id: nanoid(),
          numero: seqNumber("PROP", get().proposals),
          status: "Rascunho",
          createdAt: new Date().toISOString(),
        };
        set({ proposals: [...get().proposals, proposal] });
        return proposal;
      },
      updateProposal: (id, patch) =>
        set({
          proposals: get().proposals.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        }),
      removeProposal: (id) =>
        set({ proposals: get().proposals.filter((p) => p.id !== id) }),

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
          signatariosClienteIds: [],
          signatariosContratada: [get().etw.socios[0] ?? ""],
          status: "Rascunho",
          createdAt: new Date().toISOString(),
        };
        set({
          proposals: get().proposals.map((p) =>
            p.id === id ? { ...p, status: "Aprovada" } : p,
          ),
          contracts: [...get().contracts, contract],
        });
        return contract;
      },

      updateContract: (id, patch) =>
        set({
          contracts: get().contracts.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }),
      removeContract: (id) =>
        set({ contracts: get().contracts.filter((c) => c.id !== id) }),
    }),
    {
      name: "etw-contratos-v1",
    },
  ),
);

// Auto-expire proposals (client-side helper)
export const expiredIds = (proposals: Proposal[]) =>
  proposals
    .filter((p) => p.status === "Enviada" && isExpired(p.dataEmissao, p.validadeDias))
    .map((p) => p.id);

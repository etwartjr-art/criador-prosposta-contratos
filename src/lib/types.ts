export type ID = string;

export interface Client {
  id: ID;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  regimeTributario?: "Simples Nacional" | "Lucro Presumido" | "Lucro Real" | "MEI";
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  email?: string;
  telefone?: string;
  createdAt: string;
}

export interface Representative {
  id: ID;
  clientId: ID;
  nome: string;
  cpf: string;
  rg?: string;
  cargo?: string;
  email?: string;
  telefone?: string;
}

export type ServiceModule =
  | "BPO Financeiro e Gestão de Tesouraria"
  | "Contabilidade Consultiva e Fiscal"
  | "Departamento Pessoal"
  | "Gestão Estratégica e Processos"
  | "Contabilidade Consultiva Comercial";

export interface Service {
  id: ID;
  nome: string;
  modulo: ServiceModule | "Outros";
  descricaoEscopo: string;
  clausulaContratual: string;
}

export interface ProposalItem {
  serviceId: ID;
  nome: string;
  modulo: string;
  descricao: string;
  /** Informações/observações adicionais específicas desta proposta ou contrato. */
  informacoes?: string;
}

export type ProposalStatus =
  | "Rascunho"
  | "Enviada"
  | "Aprovada"
  | "Rejeitada"
  | "Expirada";

export interface Proposal {
  id: ID;
  numero: string;
  clientId: ID;
  dataEmissao: string; // ISO date
  validadeDias: number;
  items: ProposalItem[];
  honorariosMensais: number;
  taxaImplantacao: number;
  observacoes?: string;
  status: ProposalStatus;
  createdAt: string;
}

export type ContractStatus =
  | "Rascunho"
  | "Aguardando assinatura"
  | "Vigente"
  | "Encerrado"
  | "Rescindido";

export interface Contract {
  id: ID;
  numero: string;
  proposalId?: ID;
  clientId: ID;
  inicioVigencia: string;
  fimVigencia: string;
  valorMensal: number;
  services: ProposalItem[];
  signatariosClienteIds: ID[]; // representative IDs
  signatariosContratada: string[]; // socio names
  status: ContractStatus;
  observacoes?: string;
  createdAt: string;
}

export interface EtwSettings {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  email: string;
  foro: string;
  socios: string[];
}

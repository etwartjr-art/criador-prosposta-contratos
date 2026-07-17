import type { EtwSettings, Service } from "./types";
import { nanoid } from "nanoid";

export const DEFAULT_ETW: EtwSettings = {
  razaoSocial: "ETW ART CONTABILIDADE LTDA",
  cnpj: "53.863.006/0001-59",
  endereco:
    "Rua do Parque, nº 361, Jardim Atlântico, Goiânia - GO, CEP 74.343-245",
  email: "financeiro@etw-art-contabilidade.com.br",
  foro: "Comarca de Goiânia - Goiás",
  socios: [
    "Etwart Jeronimo da Silva Junior, CPF 801.854.441-72, Sócio-Administrador",
    "Marcelo Martins Ribeiro, CPF 012.144.576-30, Sócio-Administrador",
  ],
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: nanoid(),
    nome: "Escrituração Contábil",
    modulo: "Contabilidade Consultiva e Fiscal",
    descricaoEscopo:
      "Classificação e processamento de movimentos de acordo com as normas vigentes.",
    clausulaContratual:
      "Escrituração contábil e conformidade com a legislação vigente.",
  },
  {
    id: nanoid(),
    nome: "Compliance Fiscal",
    modulo: "Contabilidade Consultiva e Fiscal",
    descricaoEscopo:
      "Apuração de impostos (federais, estaduais e municipais) e entrega de obrigações acessórias.",
    clausulaContratual: "Apuração de tributos e obrigações acessórias.",
  },
  {
    id: nanoid(),
    nome: "Planejamento Tributário",
    modulo: "Contabilidade Consultiva e Fiscal",
    descricaoEscopo:
      "Análise periódica do regime de tributação para otimização da carga fiscal.",
    clausulaContratual:
      "Análise do regime de tributação para otimização da carga fiscal.",
  },
  {
    id: nanoid(),
    nome: "Folha de Pagamento",
    modulo: "Departamento Pessoal",
    descricaoEscopo:
      "Gestão de folha de pagamento, obrigações acessórias e conformidade com a legislação trabalhista.",
    clausulaContratual:
      "Gestão de folha de pagamento, obrigações acessórias e conformidade com a legislação vigente.",
  },
  {
    id: nanoid(),
    nome: "Faturamento",
    modulo: "BPO Financeiro e Gestão de Tesouraria",
    descricaoEscopo:
      "Emissão de notas fiscais de serviços/produtos e controle de recebíveis.",
    clausulaContratual: "Emissão de notas fiscais e controle de recebíveis.",
  },
  {
    id: nanoid(),
    nome: "Contas a Pagar e Receber",
    modulo: "BPO Financeiro e Gestão de Tesouraria",
    descricaoEscopo:
      "Gestão completa do fluxo de caixa, agendamento de pagamentos e conciliação bancária diária.",
    clausulaContratual:
      "Gestão operacional do contas a pagar e a receber, conciliação bancária diária.",
  },
  {
    id: nanoid(),
    nome: "Relatórios Financeiros",
    modulo: "BPO Financeiro e Gestão de Tesouraria",
    descricaoEscopo:
      "Elaboração mensal de DRE Gerencial, Fluxo de Caixa Realizado vs. Previsto e indicadores de liquidez.",
    clausulaContratual:
      "Elaboração de fluxo de caixa e relatórios de desempenho financeiro.",
  },
  {
    id: nanoid(),
    nome: "Contabilidade Consultiva de Gestão",
    modulo: "Gestão Estratégica e Processos",
    descricaoEscopo:
      "Reuniões mensais para análise de resultados e definição de planos de ação.",
    clausulaContratual:
      "Reuniões mensais para análise de resultados e definição de planos de ação.",
  },
  {
    id: nanoid(),
    nome: "Mapeamento de Processos",
    modulo: "Gestão Estratégica e Processos",
    descricaoEscopo:
      "Revisão dos fluxos internos para redução de gargalos e aumento de produtividade.",
    clausulaContratual:
      "Revisão dos fluxos internos para redução de gargalos e aumento de produtividade.",
  },
  {
    id: nanoid(),
    nome: "Estruturação de Vendas",
    modulo: "Contabilidade Consultiva Comercial",
    descricaoEscopo:
      "Diagnóstico de processos de vendas, estruturação e acompanhamento do funil comercial.",
    clausulaContratual:
      "Diagnóstico de processos de vendas, estruturação e acompanhamento do funil de vendas, e suporte estratégico para expansão comercial.",
  },
];

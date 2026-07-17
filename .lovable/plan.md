# Sistema de Contratos e Orçamentos — ETW Art Contabilidade

MVP focado em interface (sem login), com dados persistidos localmente no navegador (localStorage) para permitir testar todos os fluxos sem backend. Posteriormente podemos migrar para Lovable Cloud.

## Passo 0 — Ler a página do Notion

Antes de escrever código, vou conectar o Notion (App Connector do workspace) e ler a página `Sistema-de-Contratos-e-Orçamentos-ETW-Art-Contabilidade` para extrair:
- Campos obrigatórios de cliente (PF/PJ, dados fiscais específicos de contabilidade)
- Tipos de serviços/pacotes contábeis e forma de precificação
- Modelo/cláusulas do contrato e do orçamento usados hoje pela ETW

O plano abaixo será refinado com o que estiver na página (nomes de campos, textos padrão, tabela de honorários, etc.). Se algo essencial faltar, pergunto antes de codar.

## Escopo do MVP (confirmado)

1. Cadastro de clientes (PF e PJ)
2. Criação de orçamentos
3. Geração de contratos em PDF
4. Assinatura/aprovação do cliente via link público

## Estrutura de rotas (TanStack Start)

```text
/                       Dashboard (resumo: nº clientes, orçamentos, contratos)
/clientes               Lista + busca
/clientes/novo          Formulário PF/PJ
/clientes/$id           Detalhe + edição
/orcamentos             Lista com status (rascunho/enviado/aprovado/recusado)
/orcamentos/novo        Wizard: cliente → serviços/itens → condições → revisão
/orcamentos/$id         Detalhe, editar, gerar PDF, converter em contrato
/contratos              Lista com status (rascunho/enviado/assinado/cancelado)
/contratos/novo         A partir de orçamento aprovado OU do zero
/contratos/$id          Detalhe, editar cláusulas, gerar PDF, enviar link
/aprovacao/$token       Página pública: cliente vê orçamento/contrato e aceita
```

## Módulos principais

**Clientes** — PF (nome, CPF, RG, endereço, contato) e PJ (razão social, nome fantasia, CNPJ, IE, regime tributário, sócios, endereço, contato). Campos exatos virão do Notion.

**Serviços/Pacotes** — catálogo editável (ex.: Abertura de empresa, Contabilidade mensal Simples/Lucro Presumido, Departamento pessoal por funcionário, IRPF, etc.), com valor unitário e recorrência (única/mensal).

**Orçamentos** — cabeçalho (cliente, data, validade), itens (serviço, qtd, valor, recorrência), totais (mensal + único), observações, status. Ação "Aprovar" gera contrato.

**Contratos** — gerado a partir do orçamento; template com variáveis (dados do cliente, itens, valores, prazo, foro). Editor de cláusulas por contrato. Status e histórico.

**Aprovação pública** — link com token (UUID) por orçamento/contrato. Cliente vê PDF/preview + botões Aceitar/Recusar; aceite grava nome, CPF, IP-mock, data/hora e "assinatura" digitada.

**Geração de PDF** — client-side com `@react-pdf/renderer` (templates React → PDF, sem servidor). Layout com identidade ETW (cores/logo a definir com o usuário).

## Design

Interface administrativa limpa, tipografia sóbria (adequada a contabilidade), sidebar fixa com navegação por módulo, tabelas densas, formulários em cards. Paleta neutra + um accent — vou propor a paleta com base em qualquer identidade visual mencionada na página do Notion; se não houver, sugiro 2 direções antes de codar o visual.

## Persistência (MVP sem login)

Zustand + `persist` em localStorage para clientes, serviços, orçamentos, contratos e aprovações. Isolado em `src/store/*`. Migração futura para Lovable Cloud mantém a mesma API de hooks.

## Stack e libs a adicionar

- `zustand` (estado + persist)
- `@react-pdf/renderer` (geração de PDF client-side)
- `react-hook-form` + `zod` (formulários e validação, incluindo CPF/CNPJ)
- `date-fns` (datas)
- Já disponíveis: TanStack Router/Query, Tailwind v4, shadcn/ui

## Entregas por fase

1. Conectar Notion, ler página, ajustar este plano com os campos/textos reais
2. Layout base (sidebar, header, dashboard vazio) + design tokens
3. Módulo Clientes (CRUD completo)
4. Catálogo de Serviços + módulo Orçamentos com PDF
5. Módulo Contratos com template + PDF
6. Fluxo de aprovação pública por token

## Perguntas em aberto (respondo com o que vier do Notion; caso contrário, pergunto)

- Identidade visual (logo, cores) da ETW Art
- Modelo de contrato/cláusulas padrão
- Tabela de honorários / lista de serviços
- Numeração de orçamento/contrato (formato desejado)

Aprove para eu conectar o Notion e começar pela fase 1.

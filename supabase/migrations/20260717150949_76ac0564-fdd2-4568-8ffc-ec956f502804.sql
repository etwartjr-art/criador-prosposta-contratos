
-- ETW settings (single row)
CREATE TABLE public.etw_settings (
  id integer PRIMARY KEY DEFAULT 1,
  razao_social text NOT NULL,
  cnpj text NOT NULL,
  endereco text NOT NULL,
  email text NOT NULL,
  foro text NOT NULL,
  socios jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT etw_settings_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etw_settings TO anon, authenticated;
GRANT ALL ON public.etw_settings TO service_role;
ALTER TABLE public.etw_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read etw" ON public.etw_settings FOR SELECT USING (true);
CREATE POLICY "public write etw" ON public.etw_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.etw_settings (id, razao_social, cnpj, endereco, email, foro, socios) VALUES (
  1,
  'ETW ART CONTABILIDADE LTDA',
  '53.863.006/0001-59',
  'Rua do Parque, nº 361, Jardim Atlântico, Goiânia - GO, CEP 74.343-245',
  'financeiro@etw-art-contabilidade.com.br',
  'Comarca de Goiânia - Goiás',
  '["Sócio Administrador 1","Sócio Administrador 2"]'::jsonb
);

-- Clients
CREATE TABLE public.clients (
  id text PRIMARY KEY,
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text NOT NULL,
  inscricao_estadual text,
  regime_tributario text,
  endereco text NOT NULL,
  cidade text NOT NULL,
  uf text NOT NULL,
  cep text NOT NULL,
  email text,
  telefone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon, authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Representatives
CREATE TABLE public.representatives (
  id text PRIMARY KEY,
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf text NOT NULL,
  rg text,
  cargo text,
  email text,
  telefone text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.representatives TO anon, authenticated;
GRANT ALL ON public.representatives TO service_role;
ALTER TABLE public.representatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all reps" ON public.representatives FOR ALL USING (true) WITH CHECK (true);

-- Services
CREATE TABLE public.services (
  id text PRIMARY KEY,
  nome text NOT NULL,
  modulo text NOT NULL,
  descricao_escopo text NOT NULL,
  clausula_contratual text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all services" ON public.services FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.services (id, nome, modulo, descricao_escopo, clausula_contratual) VALUES
('svc_escrit', 'Escrituração Contábil', 'Contabilidade Consultiva e Fiscal', 'Classificação e processamento de movimentos de acordo com as normas vigentes.', 'Escrituração contábil e conformidade com a legislação vigente.'),
('svc_compl', 'Compliance Fiscal', 'Contabilidade Consultiva e Fiscal', 'Apuração de impostos (federais, estaduais e municipais) e entrega de obrigações acessórias.', 'Apuração de tributos e obrigações acessórias.'),
('svc_plant', 'Planejamento Tributário', 'Contabilidade Consultiva e Fiscal', 'Análise periódica do regime de tributação para otimização da carga fiscal.', 'Análise do regime de tributação para otimização da carga fiscal.'),
('svc_folha', 'Folha de Pagamento', 'Departamento Pessoal', 'Gestão de folha de pagamento, obrigações acessórias e conformidade com a legislação trabalhista.', 'Gestão de folha de pagamento, obrigações acessórias e conformidade com a legislação vigente.'),
('svc_fat', 'Faturamento', 'BPO Financeiro e Gestão de Tesouraria', 'Emissão de notas fiscais de serviços/produtos e controle de recebíveis.', 'Emissão de notas fiscais e controle de recebíveis.'),
('svc_cpr', 'Contas a Pagar e Receber', 'BPO Financeiro e Gestão de Tesouraria', 'Gestão completa do fluxo de caixa, agendamento de pagamentos e conciliação bancária diária.', 'Gestão operacional do contas a pagar e a receber, conciliação bancária diária.'),
('svc_rel', 'Relatórios Financeiros', 'BPO Financeiro e Gestão de Tesouraria', 'Elaboração mensal de DRE Gerencial, Fluxo de Caixa Realizado vs. Previsto e indicadores de liquidez.', 'Elaboração de fluxo de caixa e relatórios de desempenho financeiro.'),
('svc_ccg', 'Contabilidade Consultiva de Gestão', 'Gestão Estratégica e Processos', 'Reuniões mensais para análise de resultados e definição de planos de ação.', 'Reuniões mensais para análise de resultados e definição de planos de ação.'),
('svc_mp', 'Mapeamento de Processos', 'Gestão Estratégica e Processos', 'Revisão dos fluxos internos para redução de gargalos e aumento de produtividade.', 'Revisão dos fluxos internos para redução de gargalos e aumento de produtividade.'),
('svc_ev', 'Estruturação de Vendas', 'Contabilidade Consultiva Comercial', 'Diagnóstico de processos de vendas, estruturação e acompanhamento do funil comercial.', 'Diagnóstico de processos de vendas, estruturação e acompanhamento do funil de vendas, e suporte estratégico para expansão comercial.');

-- Proposals
CREATE TABLE public.proposals (
  id text PRIMARY KEY,
  numero text NOT NULL,
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  data_emissao date NOT NULL,
  validade_dias integer NOT NULL DEFAULT 30,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  honorarios_mensais numeric NOT NULL DEFAULT 0,
  taxa_implantacao numeric NOT NULL DEFAULT 0,
  observacoes text,
  status text NOT NULL DEFAULT 'Rascunho',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO anon, authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all proposals" ON public.proposals FOR ALL USING (true) WITH CHECK (true);

-- Contracts
CREATE TABLE public.contracts (
  id text PRIMARY KEY,
  numero text NOT NULL,
  proposal_id text REFERENCES public.proposals(id) ON DELETE SET NULL,
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  inicio_vigencia date NOT NULL,
  fim_vigencia date NOT NULL,
  valor_mensal numeric NOT NULL DEFAULT 0,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  signatarios_cliente_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  signatarios_contratada jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Rascunho',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO anon, authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);

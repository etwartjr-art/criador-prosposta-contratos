
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS assunto text,
  ADD COLUMN IF NOT EXISTS cidade_uf text,
  ADD COLUMN IF NOT EXISTS responsavel_cliente_id text,
  ADD COLUMN IF NOT EXISTS indice_reajuste text,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS dia_vencimento integer,
  ADD COLUMN IF NOT EXISTS dia_util_entrega integer,
  ADD COLUMN IF NOT EXISTS prazo_implementacao_dias integer;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS data_assinatura date,
  ADD COLUMN IF NOT EXISTS local_data_assinatura text,
  ADD COLUMN IF NOT EXISTS prazo_vigencia_meses integer,
  ADD COLUMN IF NOT EXISTS renovacao_automatica_dias integer,
  ADD COLUMN IF NOT EXISTS aviso_nao_renovacao_dias integer,
  ADD COLUMN IF NOT EXISTS aviso_previo_rescisao_dias integer,
  ADD COLUMN IF NOT EXISTS dia_pagamento integer,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS juros_mes_percent numeric,
  ADD COLUMN IF NOT EXISTS multa_moratoria_percent numeric,
  ADD COLUMN IF NOT EXISTS foro text;

ALTER TABLE public.representatives
  ADD COLUMN IF NOT EXISTS nacionalidade text,
  ADD COLUMN IF NOT EXISTS estado_civil text,
  ADD COLUMN IF NOT EXISTS profissao text,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS endereco text;

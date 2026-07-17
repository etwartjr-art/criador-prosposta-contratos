## Objetivo

Hoje os dados (clientes, propostas, contratos, serviços, configurações da ETW) ficam salvos apenas no navegador de cada visitante via localStorage. Ao publicar, cada pessoa vê um banco vazio. Vamos mover tudo para o banco do Lovable Cloud, para que os dados persistam de verdade e sejam acessíveis de qualquer dispositivo.

## Aviso importante sobre acesso

Como você escolheu **sem login**, o sistema publicado será acessível por qualquer pessoa com o link, e todos verão/editarão os mesmos dados. Se em algum momento quiser proteger com senha, é só pedir que eu adiciono autenticação.

## O que será feito

1. **Criar tabelas no banco** (migration única):
   - `etw_settings` (linha única com dados da ETW)
   - `clients` + `representatives` (com FK)
   - `services` (catálogo)
   - `proposals` + itens embutidos em JSONB
   - `contracts` + itens/signatários embutidos em JSONB
   - Sequências para numeração automática (`PROP-YYYY-NNNN`, `CONT-YYYY-NNNN`)
   - Seed inicial: configurações da ETW + 10 serviços do catálogo padrão

2. **Políticas de acesso**: RLS aberta para `anon` (leitura/escrita), já que não há login. Documentado como decisão consciente.

3. **Refatorar `src/store/app.ts`**: trocar Zustand+persist por hooks TanStack Query que leem/escrevem no Supabase. API dos componentes permanece a mesma (`addClient`, `updateProposal`, `approveProposal` etc.) para não mexer nas telas.

4. **Migração de dados existentes**: incluir um botão discreto em Configurações "Importar dados do navegador" que envia o que estiver no localStorage atual para o banco (one-shot).

5. **Ajustes de UX**: estados de loading nas listas, toasts de erro em falhas de rede.

## Arquivos afetados

- Nova migration SQL (tabelas + grants + RLS + seed)
- `src/store/app.ts` — reescrito para usar Supabase via TanStack Query
- `src/lib/types.ts` — pequenos ajustes para casar com colunas do banco
- Rotas (`clientes`, `servicos`, `propostas*`, `contratos*`, `configuracoes`, `index`) — trocar leituras síncronas por `useQuery`, adicionar estados de loading
- `src/routes/configuracoes.tsx` — botão "Importar dados do navegador"

## Fora do escopo

- Login/autenticação de usuários
- Upload de arquivos/logos para storage
- Assinatura digital

Confirma que posso seguir?

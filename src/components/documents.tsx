import type { Client, Contract, Proposal, Representative } from "@/lib/types";
import type { EtwSettings } from "@/lib/types";
import { brl, formatDate, formatDateLong } from "@/lib/format";

const extenso = (n: number) => {
  // Simple currency-in-words for BRL is complex; show the numeric with helper text
  return `${brl(n)} (por extenso)`;
};

export function ProposalDocument({
  proposal,
  client,
  etw,
}: {
  proposal: Proposal;
  client: Client;
  etw: EtwSettings;
}) {
  const total =
    proposal.honorariosMensais + (proposal.taxaImplantacao > 0 ? 0 : 0);
  return (
    <article className="mx-auto max-w-[820px] rounded-md border border-border bg-card p-10 text-sm text-foreground shadow-sm print:shadow-none">
      <header className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Proposta comercial
          </div>
          <h1 className="mt-1 text-2xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>
            {proposal.numero}
          </h1>
        </div>
        <div className="text-right text-xs">
          <div className="font-semibold text-foreground">{etw.razaoSocial}</div>
          <div className="text-muted-foreground">CNPJ {etw.cnpj}</div>
          <div className="text-muted-foreground">{etw.email}</div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Cliente
          </div>
          <div className="mt-1 font-medium">{client.razaoSocial}</div>
          <div className="text-muted-foreground">CNPJ {client.cnpj}</div>
          <div className="text-muted-foreground">{client.endereco}</div>
          <div className="text-muted-foreground">
            {client.cidade}
            {client.uf ? ` - ${client.uf}` : ""}
            {client.cep ? `, CEP ${client.cep}` : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Emissão
          </div>
          <div className="mt-1">{formatDateLong(proposal.dataEmissao)}</div>
          <div className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
            Validade
          </div>
          <div>{proposal.validadeDias} dias</div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Escopo dos serviços
        </h2>
        <ul className="divide-y divide-border rounded-md border border-border">
          {proposal.items.map((it, i) => (
            <li key={i} className="p-3">
              <div className="flex items-baseline justify-between">
                <div className="font-medium">{it.nome}</div>
                <div className="text-xs text-muted-foreground">{it.modulo}</div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{it.descricao}</p>
              {it.informacoes && (
                <p className="mt-1 whitespace-pre-line text-sm">
                  <span className="font-medium">Informações adicionais:</span>{" "}
                  {it.informacoes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Condições comerciais
        </h2>
        <div className="rounded-md border border-border">
          <div className="flex justify-between border-b border-border p-3">
            <span>Honorários mensais (contabilidade consultiva e gestão)</span>
            <span className="font-semibold">
              {brl(proposal.honorariosMensais)}/mês
            </span>
          </div>
          {proposal.taxaImplantacao > 0 && (
            <div className="flex justify-between border-b border-border p-3">
              <span>Taxa de implantação (cobrança única)</span>
              <span className="font-semibold">
                {brl(proposal.taxaImplantacao)}
              </span>
            </div>
          )}
          <div className="flex justify-between bg-secondary p-3">
            <span className="font-semibold">Total mensal recorrente</span>
            <span className="text-lg font-bold">
              {brl(proposal.honorariosMensais)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A taxa de implantação, quando aplicável, é cobrança única e não compõe
          o valor mensal recorrente. Total: {extenso(total)}.
        </p>
      </section>

      {proposal.observacoes && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Observações
          </h2>
          <p className="whitespace-pre-wrap text-sm">{proposal.observacoes}</p>
        </section>
      )}

      <footer className="mt-12 border-t border-border pt-4 text-xs text-muted-foreground">
        {etw.razaoSocial} · CNPJ {etw.cnpj} · {etw.endereco}
      </footer>
    </article>
  );
}

export function ContractDocument({
  contract,
  proposal,
  client,
  representatives,
  etw,
}: {
  contract: Contract;
  proposal?: Proposal;
  client: Client;
  representatives: Representative[];
  etw: EtwSettings;
}) {
  const signCliente = representatives.filter((r) =>
    contract.signatariosClienteIds.includes(r.id),
  );

  return (
    <article className="mx-auto max-w-[820px] rounded-md border border-border bg-card p-10 text-sm leading-relaxed text-foreground shadow-sm print:shadow-none">
      <header className="border-b border-border pb-4 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Contrato de prestação de serviços contábeis
        </div>
        <h1
          className="mt-1 text-2xl font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {contract.numero}
        </h1>
      </header>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">CLÁUSULA 1ª — DAS PARTES</h2>
        <p className="mt-2">
          <strong>CONTRATADA:</strong> {etw.razaoSocial}, pessoa jurídica de
          direito privado, inscrita no CNPJ sob o nº {etw.cnpj}, com sede em{" "}
          {etw.endereco}, doravante denominada CONTRATADA.
        </p>
        <p className="mt-2">
          <strong>CONTRATANTE:</strong> {client.razaoSocial}, inscrita no CNPJ
          sob o nº {client.cnpj}, com sede em {client.endereco}
          {client.cidade ? `, ${client.cidade}` : ""}
          {client.uf ? ` - ${client.uf}` : ""}
          {client.cep ? `, CEP ${client.cep}` : ""}, doravante denominada
          CONTRATANTE.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">
          CLÁUSULA 2ª — DO OBJETO E DOS SERVIÇOS CONTRATADOS
        </h2>
        <p className="mt-2">
          A CONTRATADA prestará à CONTRATANTE os serviços descritos abaixo,
          conforme escopo detalhado na proposta{" "}
          {proposal ? proposal.numero : "referenciada"}:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {contract.services.map((s, i) => (
            <li key={i}>
              <strong>{s.nome}:</strong> {s.descricao}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">
          CLÁUSULA 3ª — DOS HONORÁRIOS E FORMA DE PAGAMENTO
        </h2>
        <p className="mt-2">
          Pela prestação dos serviços, a CONTRATANTE pagará à CONTRATADA o valor
          mensal de <strong>{brl(contract.valorMensal)}</strong>, com vencimento
          no 5º (quinto) dia útil de cada mês subsequente ao da prestação, via
          boleto bancário ou transferência para conta indicada pela CONTRATADA.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">CLÁUSULA 4ª — DA VIGÊNCIA</h2>
        <p className="mt-2">
          O presente contrato terá vigência de{" "}
          <strong>{formatDate(contract.inicioVigencia)}</strong> a{" "}
          <strong>{formatDate(contract.fimVigencia)}</strong>, sendo renovado
          automaticamente por iguais períodos, salvo manifestação em contrário
          de qualquer das partes com antecedência mínima de 30 (trinta) dias do
          término.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">
          CLÁUSULA 5ª — DAS OBRIGAÇÕES DAS PARTES
        </h2>
        <p className="mt-2">
          A CONTRATADA obriga-se a executar os serviços com zelo, diligência e
          conformidade com a legislação vigente, mantendo sigilo sobre as
          informações da CONTRATANTE. A CONTRATANTE obriga-se a fornecer todas
          as informações e documentos necessários, no prazo solicitado, para o
          adequado cumprimento do objeto contratado.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">
          CLÁUSULA 6ª — DA CONFIDENCIALIDADE E LGPD
        </h2>
        <p className="mt-2">
          As partes comprometem-se a manter sigilo sobre todas as informações
          trocadas em razão deste contrato, observando as disposições da Lei nº
          13.709/2018 (LGPD). Os dados pessoais tratados serão utilizados
          exclusivamente para o cumprimento das obrigações contratuais e
          legais.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">
          CLÁUSULA 7ª — DA RESCISÃO E TOLERÂNCIA
        </h2>
        <p className="mt-2">
          O presente contrato poderá ser rescindido por qualquer das partes
          mediante aviso prévio por escrito de 30 (trinta) dias. A tolerância
          quanto ao descumprimento de qualquer cláusula não implicará novação
          ou renúncia de direitos.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">
          CLÁUSULA 8ª — DAS DISPOSIÇÕES GERAIS E FORO
        </h2>
        <p className="mt-2">
          Fica eleito o foro da <strong>{etw.foro}</strong> para dirimir
          quaisquer questões oriundas deste contrato, com renúncia expressa a
          qualquer outro, por mais privilegiado que seja.
        </p>
      </section>

      <section className="mt-10">
        <p>
          E, por estarem justas e contratadas, as partes assinam o presente
          instrumento em 2 (duas) vias de igual teor e forma.
        </p>
        <p className="mt-2 text-right">
          {client.cidade || "Goiânia"},{" "}
          {formatDateLong(contract.inicioVigencia)}.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div>
            <div className="border-b border-foreground pb-1">&nbsp;</div>
            <div className="mt-1 text-xs">
              <strong>CONTRATADA</strong>
              <br />
              {etw.razaoSocial}
              <br />
              {contract.signatariosContratada.filter(Boolean).map((s, i) => (
                <span key={i}>
                  {s}
                  <br />
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="border-b border-foreground pb-1">&nbsp;</div>
            <div className="mt-1 text-xs">
              <strong>CONTRATANTE</strong>
              <br />
              {client.razaoSocial}
              <br />
              {signCliente.length === 0 ? (
                <span className="text-muted-foreground">
                  (adicionar signatários)
                </span>
              ) : (
                signCliente.map((r) => (
                  <span key={r.id}>
                    {r.nome}
                    {r.cargo ? ` — ${r.cargo}` : ""}
                    <br />
                    CPF {r.cpf}
                    <br />
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

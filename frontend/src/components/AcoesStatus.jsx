import { FaCheck } from "react-icons/fa";
import { STATUS, statusDisponivel } from "../utils/statusAgendamento";
import { dataLocalISO } from "../utils/date";

const OPCOES = ["pendente", "confirmada", "realizada", "faltou"];

// SELETOR DE STATUS DA AGENDA E DA PÁGINA CONSULTAS: AS QUATRO OPÇÕES FICAM SEMPRE NO MESMO LUGAR
// E A ATUAL APARECE DESTACADA COM A COR DO PRÓPRIO STATUS
export default function AcoesStatus({ consulta, onEscolher, desativado = false, incluirCancelar = false }) {
  const hoje = dataLocalISO();
  const podeCancelar = incluirCancelar && consulta.status !== "cancelada";

  function escolher(e, novoStatus) {
    e.stopPropagation();
    if (novoStatus !== consulta.status) onEscolher(novoStatus);
  }

  return (
    <div>
      <p
        id={`status-${consulta.id ?? consulta.date}`}
        className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--cis-muted)"
      >
        Status da consulta
      </p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={`status-${consulta.id ?? consulta.date}`}>
        {OPCOES.map((status) => {
          const atual = consulta.status === status;
          const disponivel = statusDisponivel(status, consulta, hoje);
          return (
            <button
              key={status}
              type="button"
              className="cis-opcao-status"
              style={{
                "--cor": `var(--cis-status-${status})`,
                "--fundo": `var(--cis-status-${status}-bg)`,
                "--texto": `var(--cis-status-${status}-text)`,
              }}
              aria-pressed={atual}
              disabled={desativado || !disponivel}
              title={disponivel ? undefined : "Disponível a partir do dia da consulta"}
              onClick={(e) => escolher(e, status)}
            >
              {atual ? (
                <FaCheck className="shrink-0" aria-hidden="true" />
              ) : (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: "var(--cor)" }}
                  aria-hidden="true"
                />
              )}
              {STATUS[status].rotulo}
            </button>
          );
        })}
        {podeCancelar && (
          <button
            type="button"
            className="cis-danger-soft-button col-span-full w-full py-[0.6rem] text-sm"
            disabled={desativado}
            onClick={(e) => escolher(e, "cancelada")}
          >
            {STATUS.cancelada.acao}
          </button>
        )}
      </div>
    </div>
  );
}

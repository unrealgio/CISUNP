import { FaUserMd, FaFileMedical, FaHeartbeat, FaBan, FaPlus, FaListUl } from "react-icons/fa";

function plural(quantidade, singular, varios) {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

const cards = [
  {
    key: "consultas",
    label: "Consultas realizadas",
    icon: <FaUserMd />,
    action: "Ver consultas",
    actionIcon: <FaListUl />,
    valor: (resumo) => resumo.consultas,
  },
  {
    key: "procedimentos",
    label: "Procedimentos realizados",
    icon: <FaFileMedical />,
    action: "Novo procedimento",
    actionIcon: <FaPlus />,
    valor: (resumo) => resumo.procedimentos,
    detalhe: (resumo) => plural(resumo.procedimentosPlanejados, "planejado", "planejados"),
  },
  {
    key: "exames",
    label: "Exames",
    icon: <FaHeartbeat />,
    action: "Enviar exame",
    actionIcon: <FaPlus />,
    valor: (resumo) => resumo.exames,
  },
  {
    key: "faltas",
    label: "Faltas/Cancelamentos",
    icon: <FaBan />,
    action: "Ver ausências",
    actionIcon: <FaListUl />,
    valor: (resumo) => resumo.faltas + resumo.cancelamentos,
    detalhe: (resumo) =>
      `${plural(resumo.faltas, "falta", "faltas")} · ${plural(resumo.cancelamentos, "cancelamento", "cancelamentos")}`,
  },
];

export default function PacienteResumoCards({ resumo, onAction }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="cis-panel flex-1 p-4 flex flex-col items-center transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="text-2xl md:text-3xl mb-2 text-(--cis-blue)">{card.icon}</div>
          <div className="text-xl md:text-2xl font-bold mb-1 text-(--cis-navy)">
            {resumo ? card.valor(resumo) : "—"}
          </div>
          <div className="text-sm md:text-base text-(--cis-muted) text-center">{card.label}</div>
          <div className="text-xs text-(--cis-muted) mb-2 min-h-4">
            {resumo && card.detalhe ? card.detalhe(resumo) : ""}
          </div>
          <button
            className="cis-secondary-button flex items-center gap-2 mt-auto"
            onClick={() => onAction && onAction(card.key)}
            title={card.action}
          >
            {card.actionIcon} {card.action}
          </button>
        </div>
      ))}
    </div>
  );
}

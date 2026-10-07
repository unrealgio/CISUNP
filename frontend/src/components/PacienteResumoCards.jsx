import React from "react";
import {
  FaUserMd,
  FaFileMedical,
  FaHeartbeat,
  FaBan,
  FaPlus,
} from "react-icons/fa";

const cards = [
  {
    key: "consultas",
    label: "Consultas",
    icon: <FaUserMd />,
    action: "Nova consulta",
  },
  {
    key: "procedimentos",
    label: "Procedimentos",
    icon: <FaFileMedical />,
    action: "Novo Procedimento",
  },
  {
    key: "exames",
    label: "Exames",
    icon: <FaHeartbeat />,
    action: "Novo exame",
  },
  {
    key: "faltas",
    label: "Faltas/Cancelamentos",
    icon: <FaBan />,
    action: "Visualizar ausências",
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
          <div className="text-2xl md:text-3xl mb-2 text-(--cis-blue)">
            {card.icon}
          </div>
          <div className="text-xl md:text-2xl font-bold mb-1 text-(--cis-navy)">
            {resumo[card.key] ?? 0}
          </div>
          <div className="text-sm md:text-base mb-2 text-(--cis-muted)">
            {card.label}
          </div>
          <button
            className="cis-secondary-button flex items-center gap-2"
            onClick={() => onAction && onAction(card.key)}
            title={card.action}
          >
            <FaPlus /> {card.action}
          </button>
        </div>
      ))}
    </div>
  );
}

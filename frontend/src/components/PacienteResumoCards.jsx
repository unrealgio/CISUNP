import React from "react";
import { FaUserMd, FaFileMedical, FaHeartbeat, FaBan, FaPlus } from "react-icons/fa";

const cards = [
  { key: "consultas", label: "Consultas", icon: <FaUserMd />, action: "Nova consulta" },
  { key: "procedimentos", label: "Procedimentos", icon: <FaFileMedical />, action: "Novo Procedimento" },
  { key: "exames", label: "Exames", icon: <FaHeartbeat />, action: "Novo exame" },
  { key: "faltas", label: "Faltas/Cancelamentos", icon: <FaBan />, action: "Visualizar ausências" },
];

export default function PacienteResumoCards({ resumo, onAction }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {cards.map(card => (
        <div
          key={card.key}
          className="flex-1 bg-[#e6ecf3] rounded-xl p-4 flex flex-col items-center shadow transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <div className="text-2xl md:text-3xl mb-2 text-[#5A6A8E]">{card.icon}</div>
          <div className="text-xl md:text-2xl font-bold mb-1">{resumo[card.key] ?? 0}</div>
          <div className="text-base mb-2">{card.label}</div>
          <button
            className="bg-[#5A6A8E] hover:bg-[#3f4a63] text-white font-semibold px-4 py-2 rounded transition flex items-center gap-2 hover:scale-105 active:scale-95"
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
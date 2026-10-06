import React from "react";
import {
  FaIdCard,
  FaPrescriptionBottleAlt,
  FaNotesMedical,
  FaFolderOpen,
} from "react-icons/fa";

const tabs = [
  { key: "info", label: "Informações Pessoais", icon: <FaIdCard /> },
  {
    key: "prescricoes",
    label: "Prescrições",
    icon: <FaPrescriptionBottleAlt />,
  },
  { key: "prontuario", label: "Prontuário", icon: <FaNotesMedical /> },
  { key: "arquivos", label: "Arquivos", icon: <FaFolderOpen /> },
];

export default function PacienteTabs({ active, onTabChange }) {
  return (
    <div className="flex overflow-x-auto bg-[var(--cis-surface)] border-b border-[var(--cis-border)] rounded-t-lg">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 font-semibold text-sm md:text-base transition-all duration-200
            ${
              active === tab.key
                ? "bg-[var(--cis-orange-soft)] text-[var(--cis-navy)] border-b-4 border-[var(--cis-orange)]"
                : "text-[var(--cis-muted)] hover:bg-[var(--cis-blue-soft)] hover:text-[var(--cis-blue)]"
            }`}
          onClick={() => onTabChange(tab.key)}
          title={tab.label}
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

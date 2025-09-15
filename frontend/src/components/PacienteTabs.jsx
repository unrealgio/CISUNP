import React from "react";
import { FaIdCard, FaPrescriptionBottleAlt, FaNotesMedical, FaFolderOpen } from "react-icons/fa";

const tabs = [
  { key: "info", label: "Informações Pessoais", icon: <FaIdCard /> },
  { key: "prescricoes", label: "Prescrições", icon: <FaPrescriptionBottleAlt /> },
  { key: "prontuario", label: "Prontuário", icon: <FaNotesMedical /> },
  { key: "arquivos", label: "Arquivos", icon: <FaFolderOpen /> },
];

export default function PacienteTabs({ active, onTabChange }) {
  return (
    <div className="flex bg-gray-400 rounded-t-lg ">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 font-semibold text-sm md:text-base transition-all duration-200
            ${active === tab.key
              ? "bg-white text-[#045397] border-b-4 border-[#F9A23B] scale-105 shadow"
              : "text-gray-700 hover:bg-gray-300 hover:scale-105"
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
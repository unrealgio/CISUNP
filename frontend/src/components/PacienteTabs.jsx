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
    <div className="flex overflow-x-auto bg-(--cis-surface) border-b border-(--cis-border) rounded-t-lg">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 font-semibold text-sm md:text-base transition-all duration-200
            ${
              active === tab.key
                ? "bg-(--cis-orange-soft) text-(--cis-navy) border-b-4 border-(--cis-orange)"
                : "text-(--cis-muted) hover:bg-(--cis-blue-soft) hover:text-(--cis-blue)"
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

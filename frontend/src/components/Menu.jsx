import { MdCalendarMonth, MdAssignment, MdFolderShared } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Menu({ active = "agenda" }) {
  const menuItems = [
    {
      key: "agenda",
      label: "Agenda",
      icon: <MdCalendarMonth size={44} />,
      to: "/agenda",
    },
    {
      key: "consultas",
      label: "Consultas",
      icon: <MdAssignment size={44} />,
      to: "/consultas",
    },
    {
      key: "pacientes",
      label: "Pacientes",
      icon: <MdFolderShared size={44} />,
      to: "/buscar-paciente",
    },
  ];

  return (
    <nav
      className="bg-(--cis-surface) border-b border-(--cis-border) w-full flex justify-center items-center py-2 px-2 gap-1 md:gap-4 shadow-sm"
      role="navigation"
      aria-label="Menu principal"
    >
      {menuItems.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={`flex gap-2 items-center px-3 md:px-5 py-2 mx-1 md:mx-2 rounded-lg bg-transparent transition-all duration-200 group cursor-pointer
            ${
              active === item.key
                ? "bg-(--cis-orange-soft) text-(--cis-navy) shadow-sm"
                : "text-(--cis-muted) hover:bg-(--cis-blue-soft)"
            }
          `}
          aria-label={item.label}
          title={item.label}
        >
          <span
            className={`transition-transform duration-200 ${
              active === item.key
                ? "text-(--cis-orange)"
                : "text-(--cis-muted) group-hover:text-(--cis-blue)"
            }`}
          >
            {item.icon}
          </span>
          <span className="font-semibold text-sm md:text-base tracking-wide transition-colors">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

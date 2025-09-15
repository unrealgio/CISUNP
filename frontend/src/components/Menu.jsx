import { MdCalendarMonth, MdAssignment, MdFolderShared } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

export default function Menu({ active = "agenda" }) {
  const navigate = useNavigate();
  const menuItems = [
    {
      key: "agenda",
      label: "Agenda",
      icon: <MdCalendarMonth size={44} />,
      to: "/agenda"
    },
    {
      key: "consultas",
      label: "Consultas",
      icon: <MdAssignment size={44} />,
      to: "/consultas"
    },
    {
      key: "pacientes",
      label: "Pacientes",
      icon: <MdFolderShared size={44} />,
      to: "/buscar-paciente"
    },
  ];

  return (
    <nav
      className="bg-[#045397] w-full flex justify-center items-center py-4 gap-8 md:gap-20 shadow"
      role="navigation"
      aria-label="Menu principal"
    >
      {menuItems.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={`flex gap-2.5 items-center px-6 md:px-8 py-2 mx-2 md:mx-6 rounded-lg bg-transparent transition-all duration-200 group shadow-none hover:shadow-lg cursor-pointer
            ${active === item.key
              ? "bg-[#F9A23B]/90 text-white scale-105 shadow-lg"
              : "hover:bg-blue-900/30 focus:bg-blue-900/40"
            }
          `}
          aria-label={item.label}
          title={item.label}
        >
          <span
            className={`transition-transform duration-200 ${
              active === item.key
                ? "text-white scale-110"
                : item.key === "consultas"
                ? "text-pink-200 group-hover:text-white"
                : "text-blue-200 group-hover:text-white"
            }`}
          >
            {item.icon}
          </span>
          <span className="text-white font-bold text-xl md:text-2xl mt-2 tracking-wide group-hover:underline group-hover:scale-105 transition-transform duration-200">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
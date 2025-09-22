import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Header() {
  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/"; // ajuste para sua rota de login
  }

  return (
    <header className="bg-[#045397] border-b-4 border-[#F9A23B] w-full flex items-center px-4 md:px-8 py-3">
      <div className="flex items-center flex-1 min-w-0">
        <img
          src="/img/Unp_Final_Logo.png"
          alt="Logo UnP"
          className="h-12 w-auto mr-4 md:mr-6 flex-shrink-0"
        />
        <h1 className="text-white text-lg md:text-2xl font-bold leading-tight truncate">
          CIS - Centro<br className="hidden md:block" />Integrado de Saúde
        </h1>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <FaUserCircle className="w-8 h-8 md:w-10 md:h-10 text-white" aria-label="Usuário" />
        <span className="text-white text-base md:text-lg font-bold mr-2 truncate max-w-[120px] md:max-w-xs">
          Bem-vindo ao CIS
        </span>
        <button
          className="p-2 rounded-full hover:bg-[#F9A23B]/20 focus:outline-none focus:ring-2 focus:ring-[#F9A23B] transition"
          aria-label="Sair"
          title="Sair"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
      </div>
    </header>
  );
}
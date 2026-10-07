import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

// LÊ O E-MAIL DO USUÁRIO NA PARTE DO MEIO DO TOKEN (JWT), APENAS PARA EXIBIÇÃO
// A VALIDAÇÃO DO TOKEN CONTINUA SENDO FEITA PELO BACKEND
function emailDoUsuario() {
  try {
    const payload = localStorage.getItem("token").split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).email || null;
  } catch {
    return null;
  }
}

export default function Header() {
  const email = emailDoUsuario();

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <header className="bg-(--cis-navy) border-b-4 border-(--cis-orange) w-full flex items-center px-4 md:px-8 py-2.5">
      <div className="flex items-center flex-1 min-w-0">
        <img
          src="/img/Unp_Final_Logo.png"
          alt="Logo UnP"
          className="h-10 md:h-11 w-auto mr-3 md:mr-5 shrink-0"
        />
        <h1 className="text-white text-base md:text-xl font-bold leading-tight truncate tracking-wide">
          CIS - Centro
          <br className="hidden md:block" />
          Integrado de Saúde
        </h1>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <FaUserCircle
          className="w-7 h-7 md:w-8 md:h-8 text-white"
          aria-label="Usuário"
        />
        <span
          className="text-white text-sm md:text-base font-semibold mr-1 md:mr-2 truncate max-w-25 md:max-w-xs"
          title={email || undefined}
        >
          {email || "Bem-vindo ao CIS"}
        </span>
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition"
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

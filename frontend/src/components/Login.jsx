import { useState } from "react";
import PassChange from "./PassChange";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { apiUrl, mensagemDeErro } from "../api";
import { ErrorMessage } from "./StatusMessage";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const emailInput = e.target.usuario.value;
    const senhaInput = e.target.senha.value;

    try {
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, senha: senhaInput }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setEmail(emailInput);
        if (data.firstAccess) {
          setShowChangePassword(true);
        } else {
          window.location.href = "/agenda";
        }
      } else {
        setError(mensagemDeErro(data, "Usuário ou senha inválidos."));
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleSenhaAlterada() {
    setShowChangePassword(false);
    window.location.href = "/agenda";
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('./img/bglogin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-(--cis-navy) opacity-75"></div>
      <div className="relative z-10 w-full max-w-md md:max-w-lg mx-4 bg-(--cis-surface)/95 border border-white/60 rounded-2xl shadow-2xl p-7 md:p-9 flex flex-col items-center">
        <img
          src="/img/Unp_Final_Logo.png"
          alt="Logo UnP"
          className="h-14 md:h-16 mb-2"
        />
        <h2 className="text-center text-(--cis-navy) font-semibold mb-1 text-base md:text-lg tracking-wide">
          CIS - Centro Integrado de Saúde
        </h2>
        <form className="w-full mt-4" onSubmit={handleSubmit}>
          {/* USUÁRIO */}
          <div className="mb-4">
            <label
              className="block text-(--cis-ink) text-sm font-semibold mb-1"
              htmlFor="usuario"
            >
              Usuário <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="usuario"
                type="email"
                placeholder="usuario@unp.com.br"
                className="cis-login-input"
                required
                aria-label="Usuário"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-(--cis-muted)">
                <FaUser size={20} />
              </span>
            </div>
          </div>
          {/* SENHA */}
          <div className="mb-4">
            <label
              className="block text-(--cis-ink) text-sm font-semibold mb-1"
              htmlFor="senha"
            >
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="cis-login-input"
                required
                aria-label="Senha"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-3 flex items-center text-(--cis-muted)"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          {/* MENSAGEM DE ERRO */}
          {error && (
            <ErrorMessage compacto className="w-full mb-3">
              {error}
            </ErrorMessage>
          )}
          {/* BOTÃO DE LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-(--cis-navy) hover:bg-(--cis-blue) text-white font-semibold py-2.5 rounded-lg transition-all duration-200 mb-2 shadow-md
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Acessando...
              </span>
            ) : (
              "Acessar"
            )}
          </button>
        </form>
      </div>
      {showChangePassword && (
        <PassChange email={email} onSenhaAlterada={handleSenhaAlterada} />
      )}
    </div>
  );
}

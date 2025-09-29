import React, { useState } from "react";
import PassChange from "./PassChange";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

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
      const res = await fetch("http://localhost:3001/api/login", {
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
          window.location.href = "/";
        }
      } else {
        setError(data.error || "Usuário ou senha inválidos.");
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
    <div className="min-h-screen flex items-center justify-center relative" style={{
      backgroundImage: "url('https://lh3.googleusercontent.com/pw/AP1GczMLu294ue1TPyyB2fKyX0wSnU0dda95B84ZbYxZiPOQYXKFArWEAR8w__sGh2eIIBrkaqT0iTPPXWdv8xG_8aqTOfPB6SjojvKaTVxaM7kj_QRBbCqktBnM4fMqXsIQZELMctsh4kibugcFFcsyCQPJ=w1378-h919-s-no-gm?authuser=0')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 w-full max-w-md md:max-w-lg bg-gray-100 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <img src="/img/Unp_Final_Logo.png" alt="Logo UnP" className="h-14 md:h-16 mb-2" />
        <h2 className="text-center text-gray-700 font-semibold mb-1 text-base md:text-lg">
          CIS - Centro Integrado de Saúde
        </h2>
        <form className="w-full mt-4" onSubmit={handleSubmit}>
          {/* Usuário */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="usuario">
              Usuário <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="usuario"
                type="email"
                placeholder="usuario@unp.com.br"
                className="w-full px-4 py-2 pr-10 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F9A23B] bg-white text-black placeholder-gray-700 text-base font-medium transition"
                required
                aria-label="Usuário"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                <FaUser size={20} />
              </span>
            </div>
          </div>
          {/* Senha */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="senha">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="w-full px-4 py-2 pr-10 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F9A23B] bg-white text-black placeholder-gray-700 text-base font-medium transition"
                required
                aria-label="Senha"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="text-red-600 text-sm mb-2 text-center">{error}</div>
          )}
          {/* BOTÃO DE LOGIN*/}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#5A6A8E] hover:bg-[#3f4a63] text-white font-semibold py-2 rounded-lg transition-all duration-200 mb-2 shadow-lg
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Acessando...
              </span>
            ) : (
              "Acessar"
            )}
          </button>
        </form>
        {/* ESQUECI A SENHA */}
        <div className="w-full flex justify-center items-center mt-2">
          <a
            href="#"
            className="text-sm text-[#5A6A8E] hover:underline"
          >
            Esqueci minha senha
          </a>
        </div>
      </div>
      {/* COMPONENTE DE MUDANÇA DE SENHA */}
      {showChangePassword && (
        <PassChange email={email} onSenhaAlterada={handleSenhaAlterada} />
      )}
    </div>
  );
}
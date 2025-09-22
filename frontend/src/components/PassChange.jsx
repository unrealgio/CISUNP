import React, { useState } from "react";

export default function PassChange({ email, onSenhaAlterada }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setMensagem("");
    try {
      const res = await fetch("http://localhost:3001/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, novaSenha }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem("Senha alterada com sucesso!");
        setTimeout(() => {
          onSenhaAlterada();
        }, 1500); // redireciona após mostrar mensagem
      } else {
        setErro(data.error || "Erro ao trocar senha.");
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-[#045397]">Troque sua senha para acessar o sistema</h3>
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full px-4 py-2 border border-gray-400 rounded-lg mb-3"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-[#F9A23B] hover:bg-[#e68a1a] text-white font-semibold py-2 rounded-lg transition-all duration-200 shadow-lg"
            disabled={loading}
          >
            {loading ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
        {mensagem && (
          <div className="text-green-600 text-sm mt-2 text-center">{mensagem}</div>
        )}
        {erro && (
          <div className="text-red-600 text-sm mt-2 text-center">{erro}</div>
        )}
      </div>
    </div>
  );
}
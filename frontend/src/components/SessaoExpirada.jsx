import { useEffect, useRef, useState } from "react";
import {
  apiUrl,
  emailDoToken,
  mensagemDeErro,
  registrarPedidoDeLogin,
} from "../api";
import { ErrorMessage } from "./StatusMessage";

export default function SessaoExpirada() {
  const [email] = useState(() => emailDoToken());
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const responder = useRef(null);

  useEffect(() => {
    registrarPedidoDeLogin(
      () =>
        new Promise((resolve) => {
          if (!email) return resolve(false);
          responder.current = resolve;
          setSenha("");
          setErro("");
          setAberto(true);
        }),
    );
    return () => registrarPedidoDeLogin(null);
  }, [email]);

  function fechar(renovou) {
    setAberto(false);
    responder.current?.(renovou);
    responder.current = null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        fechar(true);
      } else {
        setErro(mensagemDeErro(data, "Usuário ou senha inválidos."));
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2 text-(--cis-unp-blue)">
          Sua sessão expirou
        </h3>
        <p className="text-sm text-(--cis-muted) text-center mb-1">
          Digite sua senha para continuar. O que você preencheu não será
          perdido.
        </p>
        <p className="text-sm font-semibold text-(--cis-ink) mb-4">{email}</p>
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Senha"
            maxLength={72}
            className="cis-login-input mb-3"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoFocus
            aria-label="Senha"
          />
          {erro && (
            <ErrorMessage compacto className="w-full mb-3">
              {erro}
            </ErrorMessage>
          )}
          <button
            type="submit"
            className="w-full bg-(--cis-unp-orange) hover:bg-(--cis-unp-orange-hover) text-white font-semibold py-2 rounded-lg transition-all duration-200 shadow-lg"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
          <button
            type="button"
            className="cis-secondary-button w-full mt-2"
            onClick={() => fechar(false)}
            disabled={carregando}
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

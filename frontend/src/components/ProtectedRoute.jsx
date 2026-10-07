import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiUrl } from "../api";
import { LoadingMessage } from "./StatusMessage";

export default function ProtectedRoute({ children }) {
  // SEM TOKEN, JÁ COMEÇA COMO NÃO AUTORIZADO, COM TOKEN, AGUARDA A VALIDAÇÃO
  const [authorized, setAuthorized] = useState(() =>
    localStorage.getItem("token") ? null : false,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;
    fetch(apiUrl("/api/session"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Sessão inválida.");
        if (!cancelled) setAuthorized(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        if (!cancelled) setAuthorized(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (authorized === null) {
    return <LoadingMessage>Validando sessão</LoadingMessage>;
  }

  return authorized ? children : <Navigate to="/" replace />;
}

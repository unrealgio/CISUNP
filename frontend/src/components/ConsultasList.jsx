import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaPhone,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { apiFetch, mensagemDeErro } from "../api";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { dataLocalISO, formatarDataISO } from "../utils/date";
import { ErrorMessage, EstadoVazio, LoadingMessage } from "./StatusMessage";

const STATUS = {
  pendente: {
    rotulo: "Pendente",
    plural: "Pendentes",
    acao: "Voltar para pendente",
  },
  confirmada: {
    rotulo: "Confirmada",
    plural: "Confirmadas",
    acao: "Confirmar",
  },
  realizada: {
    rotulo: "Realizada",
    plural: "Realizadas",
    acao: "Marcar como realizada",
  },
  cancelada: {
    rotulo: "Cancelada",
    plural: "Canceladas",
    acao: "Cancelar consulta",
  },
};

function ordenarConsultas(lista) {
  const hoje = dataLocalISO();
  const chave = (c) => `${c.date} ${c.time}`;
  const futuras = lista
    .filter((c) => c.date >= hoje)
    .sort((a, b) => chave(a).localeCompare(chave(b)));
  const passadas = lista
    .filter((c) => c.date < hoje)
    .sort((a, b) => chave(b).localeCompare(chave(a)));
  return [...futuras, ...passadas];
}

export default function ConsultasList() {
  const consultas = useBuscarDados(
    "/api/agendamentos/todos",
    "Erro ao carregar consultas.",
  );
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [alterando, setAlterando] = useState(null);
  const [erroStatus, setErroStatus] = useState(null);
  const itemsPerPage = 12;

  const lista = ordenarConsultas(
    Array.isArray(consultas.dados) ? consultas.dados : [],
  );
  const contagem = lista.reduce(
    (total, c) => ({ ...total, [c.status]: (total[c.status] || 0) + 1 }),
    { todas: lista.length },
  );

  // FILTRO POR STATUS E NOME DO PACIENTE
  const filteredConsultas = lista.filter(
    (c) =>
      (filtro === "todas" || c.status === filtro) &&
      c.patient.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredConsultas.length / itemsPerPage);
  const paginatedConsultas = filteredConsultas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function escolherFiltro(novoFiltro) {
    setFiltro(novoFiltro);
    setPage(1);
  }

  function handleExpand(id) {
    setExpanded(expanded === id ? null : id);
  }

  function handleKeyDown(e, id) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleExpand(id);
    }
  }

  async function mudarStatus(consulta, status) {
    if (
      status === "cancelada" &&
      !window.confirm(
        "Cancelar esta consulta? O horário ficará livre na agenda.",
      )
    )
      return;
    setAlterando(consulta.id);
    setErroStatus(null);
    try {
      const res = await apiFetch(`/api/agendamentos/${consulta.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroStatus({
          id: consulta.id,
          mensagem: mensagemDeErro(data, "Erro ao alterar o status."),
        });
        return;
      }
      consultas.alterarDados((prev) =>
        prev.map((c) => (c.id === data.id ? data : c)),
      );
    } catch {
      setErroStatus({
        id: consulta.id,
        mensagem: "Erro de conexão com o servidor.",
      });
    } finally {
      setAlterando(null);
    }
  }

  return (
    <div className="w-full px-2 md:px-8 py-6">
      <h2 className="text-2xl font-bold text-(--cis-unp-blue) mb-6">
        Consultas
      </h2>
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nome do paciente..."
            className="w-full rounded-lg px-4 py-2 border border-(--cis-border) bg-(--cis-surface) shadow-sm focus:ring-2 focus:ring-(--cis-unp-orange) focus:border-(--cis-unp-orange) transition outline-none text-(--cis-ink) placeholder-(--cis-muted) text-base font-medium"
            aria-label="Buscar por nome do paciente"
          />
          <FaSearch className="absolute right-3 top-3 text-(--cis-muted)" />
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar por status"
        >
          {["todas", ...Object.keys(STATUS)].map((chave) => (
            <button
              key={chave}
              type="button"
              className="cis-filtro"
              aria-pressed={filtro === chave}
              onClick={() => escolherFiltro(chave)}
            >
              {chave === "todas" ? "Todas" : STATUS[chave].plural} (
              {contagem[chave] || 0})
            </button>
          ))}
        </div>
      </div>

      {consultas.carregando ? (
        <LoadingMessage>Carregando consultas</LoadingMessage>
      ) : consultas.erro ? (
        <ErrorMessage>{consultas.erro}</ErrorMessage>
      ) : (
        <>
          {/* CARDS DE CONSULTAS */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
            {paginatedConsultas.length === 0 ? (
              <div className="col-span-full">
                <EstadoVazio
                  icone={<FaCalendarAlt />}
                  titulo="Nenhuma consulta encontrada."
                  dica={
                    lista.length === 0
                      ? "Os agendamentos feitos na Agenda aparecem aqui."
                      : "Tente buscar por outro nome ou mudar o filtro."
                  }
                />
              </div>
            ) : (
              paginatedConsultas.map((c) => (
                <div
                  key={c.id}
                  className="bg-(--cis-surface) rounded-xl shadow-lg p-5 flex flex-col gap-2 border-l-4 transition hover:shadow-xl hover:-translate-y-0.5 cursor-pointer wrap-anywhere"
                  style={{ borderColor: `var(--cis-status-${c.status})` }}
                  onClick={() => handleExpand(c.id)}
                  onKeyDown={(e) => handleKeyDown(e, c.id)}
                  tabIndex={0}
                  aria-expanded={expanded === c.id}
                  aria-label={`Detalhes da consulta de ${c.patient}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="text-(--cis-unp-blue) shrink-0" />
                    <span className="font-bold text-lg text-(--cis-unp-blue) min-w-0">
                      {c.patient}
                    </span>
                    <span
                      className="ml-auto px-2 py-1 rounded text-xs font-semibold shrink-0"
                      style={{
                        background: `var(--cis-status-${c.status}-bg)`,
                        color: `var(--cis-status-${c.status}-text)`,
                      }}
                    >
                      {STATUS[c.status]?.rotulo || c.status}
                    </span>
                    <span className="ml-2 shrink-0">
                      {expanded === c.id ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-(--cis-ink)">
                    <FaCalendarAlt /> {formatarDataISO(c.date)}
                    <FaClock className="ml-4" /> {c.time}
                  </div>
                  <div className="flex items-center gap-2 text-(--cis-ink)">
                    <FaUserMd className="shrink-0" />
                    {c.medico || (
                      <span className="text-(--cis-muted)">
                        Médico não informado
                      </span>
                    )}
                  </div>
                  {/* DETALHES EXPANDIDOS DAS CONSULTAS */}
                  {expanded === c.id && (
                    <div className="mt-3 p-3 rounded bg-(--cis-background) border border-(--cis-border) text-(--cis-ink) text-sm flex flex-col gap-2">
                      <p>
                        <strong>Observações:</strong>{" "}
                        {c.notes || (
                          <span className="text-(--cis-muted)">Nenhuma</span>
                        )}
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-2">
                          <FaPhone className="shrink-0" /> {c.phone}
                        </p>
                      )}
                      {c.cpf && (
                        <Link
                          to={`/paciente/${c.cpf}`}
                          className="text-(--cis-blue) underline w-fit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver ficha do paciente
                        </Link>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-(--cis-border)">
                        {Object.keys(STATUS)
                          .filter((status) => status !== c.status)
                          .map((status) => (
                            <button
                              key={status}
                              type="button"
                              className={`${
                                status === "cancelada"
                                  ? "cis-danger-soft-button px-4 py-2"
                                  : "cis-secondary-button"
                              } text-sm`}
                              disabled={alterando === c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                mudarStatus(c, status);
                              }}
                            >
                              {STATUS[status].acao}
                            </button>
                          ))}
                      </div>
                      {erroStatus?.id === c.id && (
                        <ErrorMessage compacto>
                          {erroStatus.mensagem}
                        </ErrorMessage>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="cis-page-button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <FaChevronLeft />
              </button>
              <span className="font-semibold text-(--cis-unp-blue)">
                Página {page} de {totalPages}
              </span>
              <button
                className="cis-page-button"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Próxima página"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

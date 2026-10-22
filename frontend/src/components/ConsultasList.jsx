import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  FaTimes,
} from "react-icons/fa";
import { apiFetch, mensagemDeErro } from "../api";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { dataLocalISO, formatarDataISO } from "../utils/date";
import { ErrorMessage, EstadoVazio, LoadingMessage } from "./StatusMessage";
import { STATUS } from "../utils/statusAgendamento";
import { formatarCpf } from "../utils/cpf";
import { formatarTelefone } from "../utils/telefone";
import AcoesStatus from "./AcoesStatus";

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

function plural(quantidade, singular, varios) {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

// HISTÓRICO DO PACIENTE CALCULADO COM AS CONSULTAS JÁ CARREGADAS (SEM REQUISIÇÃO EXTRA)
function historicoDoPaciente(todas, consulta, hoje) {
  const doPaciente = todas.filter((c) => c.cpf === consulta.cpf);
  const contar = (status) =>
    doPaciente.filter((c) => c.status === status).length;
  const chave = (c) => `${c.date} ${c.time}`;
  const outras = doPaciente.filter((c) => c.id !== consulta.id);

  const proxima = outras
    .filter(
      (c) => c.date >= hoje && ["pendente", "confirmada"].includes(c.status),
    )
    .sort((a, b) => chave(a).localeCompare(chave(b)))[0];
  const ultima = outras
    .filter((c) => c.status === "realizada")
    .sort((a, b) => chave(b).localeCompare(chave(a)))[0];

  const partes = [
    [contar("realizada"), "realizada", "realizadas"],
    [contar("faltou"), "falta", "faltas"],
    [contar("cancelada"), "cancelada", "canceladas"],
  ]
    .filter(([quantidade]) => quantidade > 0)
    .map(([quantidade, singular, varios]) =>
      plural(quantidade, singular, varios),
    );

  return {
    resumo: partes.length ? partes.join(" · ") : "Nenhuma consulta concluída",
    proxima,
    ultima,
  };
}

function Linha({ rotulo, children, empilhado = false }) {
  if (empilhado) {
    return (
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-(--cis-muted)">{rotulo}</dt>
        <dd>{children}</dd>
      </div>
    );
  }
  return (
    <>
      <dt className="font-semibold text-(--cis-muted)">{rotulo}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

function TituloBloco({ children }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--cis-muted)">
      {children}
    </p>
  );
}

function Vazio({ children }) {
  return <span className="text-(--cis-muted)">{children}</span>;
}

function HistoricoDoPaciente({ todas, consulta }) {
  const historico = historicoDoPaciente(todas, consulta, dataLocalISO());
  const outra = historico.proxima || historico.ultima;
  return (
    <>
      <Linha rotulo="Histórico" empilhado>
        {historico.resumo}
      </Linha>
      <Linha
        empilhado
        rotulo={
          historico.proxima
            ? "Próxima consulta"
            : historico.ultima
              ? "Última consulta"
              : "Outras consultas"
        }
      >
        {outra ? (
          `${formatarDataISO(outra.date)} às ${outra.time}`
        ) : (
          <Vazio>Nenhuma marcada</Vazio>
        )}
      </Linha>
    </>
  );
}

export default function ConsultasList() {
  const consultas = useBuscarDados(
    "/api/agendamentos/todos",
    "Erro ao carregar consultas.",
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const cpfFiltro = searchParams.get("cpf");
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState(() =>
    STATUS[searchParams.get("status")] ? searchParams.get("status") : "todas",
  );
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [alterando, setAlterando] = useState(null);
  const [erroStatus, setErroStatus] = useState(null);
  const itemsPerPage = 12;

  const todas = Array.isArray(consultas.dados) ? consultas.dados : [];
  const lista = ordenarConsultas(
    cpfFiltro ? todas.filter((c) => c.cpf === cpfFiltro) : todas,
  );
  const nomeDoPacienteFiltrado = cpfFiltro
    ? lista[0]?.patient || `CPF ${cpfFiltro}`
    : "";
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

  function limparFiltroDePaciente() {
    setSearchParams({});
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
        {cpfFiltro && (
          <button
            type="button"
            className="cis-filtro flex items-center gap-2 w-fit wrap-anywhere"
            aria-pressed="true"
            onClick={limparFiltroDePaciente}
            title="Mostrar as consultas de todos os pacientes"
          >
            Paciente: {nomeDoPacienteFiltrado}
            <FaTimes className="shrink-0" aria-hidden="true" />
            <span className="sr-only">(remover filtro)</span>
          </button>
        )}
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
                      ? cpfFiltro
                        ? "Este paciente ainda não tem consultas."
                        : "Os agendamentos feitos na Agenda aparecem aqui."
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
                    <div
                      className="mt-3 p-3 rounded-lg bg-(--cis-background) border border-(--cis-border) text-(--cis-ink) text-sm flex flex-col gap-3 cursor-default"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="@container">
                        <div
                          className={`grid gap-3 ${
                            c.cpf ? "@md:grid-cols-2 @md:gap-5" : ""
                          }`}
                        >
                          <section className="min-w-0">
                            <TituloBloco>Paciente</TituloBloco>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                              {c.cpf ? (
                                <>
                                  <Linha rotulo="CPF">
                                    {formatarCpf(c.cpf)}
                                  </Linha>
                                  <Linha rotulo="Idade">
                                    {c.idade != null ? (
                                      `${c.idade} anos`
                                    ) : (
                                      <Vazio>Não informada</Vazio>
                                    )}
                                  </Linha>
                                </>
                              ) : (
                                <Linha rotulo="Cadastro">
                                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-(--cis-orange-soft) text-(--cis-orange-text)">
                                    Avulso (sem cadastro)
                                  </span>
                                </Linha>
                              )}
                              <Linha rotulo="Telefone">
                                {c.phone ? (
                                  <span className="flex items-center gap-2">
                                    <FaPhone className="shrink-0 text-(--cis-muted)" />
                                    {formatarTelefone(c.phone)}
                                  </span>
                                ) : (
                                  <Vazio>Não informado</Vazio>
                                )}
                              </Linha>
                            </dl>
                            {c.cpf && (
                              <Link
                                to={`/paciente/${c.cpf}`}
                                className="mt-2 inline-block text-(--cis-blue) underline"
                              >
                                Ver ficha do paciente
                              </Link>
                            )}
                          </section>
                          {c.cpf && (
                            <section className="min-w-0 border-t border-(--cis-border) pt-3 @md:border-t-0 @md:border-l @md:pt-0 @md:pl-5">
                              <TituloBloco>Consultas</TituloBloco>
                              <dl className="flex flex-col gap-2">
                                <HistoricoDoPaciente
                                  todas={todas}
                                  consulta={c}
                                />
                              </dl>
                            </section>
                          )}
                        </div>
                      </div>
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 border-t border-(--cis-border) pt-3">
                        <Linha rotulo="Observações">
                          {c.notes || <Vazio>Nenhuma</Vazio>}
                        </Linha>
                      </dl>
                      <div className="pt-3 border-t border-(--cis-border)">
                        <AcoesStatus
                          consulta={c}
                          incluirCancelar
                          desativado={alterando === c.id}
                          onEscolher={(status) => mudarStatus(c, status)}
                        />
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

import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaUserMd,
  FaIdCard,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaUserPlus,
  FaPhone,
} from "react-icons/fa";
import Header from "../components/Header";
import { apiFetch } from "../api";
import Menu from "../components/Menu";
import AddPaciente from "../components/AddPaciente";
import { ErrorMessage, LoadingMessage } from "../components/StatusMessage";
import { useNavigate } from "react-router-dom";

const filtros = [
  { key: "patient", label: "Paciente", icon: <FaUsers /> },
  { key: "cpf", label: "CPF", icon: <FaIdCard /> },
  { key: "phone", label: "Telefone", icon: <FaPhone /> },
  { key: "medico", label: "Médico", icon: <FaUserMd /> },
];

export default function BuscarPacientePage() {
  const [busca, setBusca] = useState({});
  const [todosPacientes, setTodosPacientes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/pacientes/todos")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Erro ao carregar pacientes.");

        if (Array.isArray(data)) {
          setTodosPacientes(data);
          setResultados(data);
        } else {
          throw new Error("Resposta inválida ao carregar pacientes.");
        }
      })
      .catch((error) => {
        setTodosPacientes([]);
        setResultados([]);
        setErro(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e, key) {
    setBusca({ ...busca, [key]: e.target.value });
  }

  function handleBuscar(e) {
    e.preventDefault();
    let filtrados = todosPacientes.filter((p) =>
      Object.entries(busca).every(
        ([k, v]) =>
          !v || (p[k] && p[k].toLowerCase().includes(v.toLowerCase())),
      ),
    );
    setResultados(filtrados);
    setPage(1);
  }

  // VOLTA A MOSTRAR TODOS OS PACIENTES SE TODOS OS CAMPOS DE BUSCA FOREM LIMPOS
  useEffect(() => {
    const algumCampoPreenchido = Object.values(busca).some((v) => v);
    if (!algumCampoPreenchido) {
      setResultados(todosPacientes);
    }
  }, [busca, todosPacientes]);

  function handleAddPaciente(paciente) {
    setTodosPacientes((prev) => [...prev, paciente]);
    setResultados((prev) => [...prev, paciente]);
    setShowAdd(false);
  }

  const totalPages = Array.isArray(resultados)
    ? Math.ceil(resultados.length / itemsPerPage)
    : 0;
  const paginatedResults = Array.isArray(resultados)
    ? resultados.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : [];

  return (
    <>
      <Header />
      <Menu active="pacientes" />
      <div className="bg-(--cis-background) min-h-screen px-2 md:px-8 py-6">
        {showAdd ? (
          <AddPaciente
            onAdd={handleAddPaciente}
            onCancel={() => setShowAdd(false)}
          />
        ) : (
          <>
            <form
              className="cis-panel flex flex-wrap gap-4 bg-(--cis-surface) p-4 md:p-5 mb-6"
              onSubmit={handleBuscar}
            >
              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-(--cis-border) pb-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-(--cis-navy)">
                    Buscar pacientes
                  </h1>
                  <p className="text-sm text-(--cis-muted) mt-1">
                    Consulte e acesse os dados cadastrais da clínica.
                  </p>
                </div>
                <button
                  type="button"
                  className="cis-secondary-button text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                  onClick={() => setShowAdd(true)}
                >
                  <FaUserPlus /> Adicionar paciente
                </button>
              </div>
              {filtros.map((filtro) => (
                <div key={filtro.key} className="flex flex-col flex-1 min-w-40">
                  <label className="cis-label mb-1">
                    {filtro.icon} {filtro.label}:
                  </label>
                  <input
                    className="cis-input"
                    type="text"
                    value={busca[filtro.key] || ""}
                    onChange={(e) => handleChange(e, filtro.key)}
                    placeholder={`Buscar por ${filtro.label.toLowerCase()}`}
                    aria-label={filtro.label}
                  />
                </div>
              ))}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="cis-primary-button text-sm flex items-center gap-2"
                >
                  <FaSearch /> Buscar
                </button>
              </div>
            </form>

            {erro && <ErrorMessage>{erro}</ErrorMessage>}

            <div className="cis-panel overflow-x-auto p-3 md:p-4">
              <table className="w-full min-w-160 text-left">
                <thead>
                  <tr className="bg-(--cis-navy) text-white">
                    <th className="py-2 px-4 rounded-tl-lg">Paciente</th>
                    <th className="py-2 px-4">CPF</th>
                    <th className="py-2 px-4">Telefone</th>
                    <th className="py-2 px-4 rounded-tr-lg">Médico</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>
                        <LoadingMessage>Carregando Pacientes</LoadingMessage>
                      </td>
                    </tr>
                  ) : paginatedResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        Nenhum paciente encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginatedResults.map((p, idx) => (
                      <tr
                        key={p.cpf || p.patient || idx}
                        className="border-b border-(--cis-border) hover:bg-(--cis-blue-soft) cursor-pointer transition-colors"
                        onClick={() => {
                          if (p.cpf) {
                            navigate(`/paciente/${encodeURIComponent(p.cpf)}`);
                          } else {
                            alert("Paciente sem CPF cadastrado!");
                          }
                        }}
                        title="Ver detalhes do paciente"
                      >
                        <td className="py-3 px-4 font-semibold text-(--cis-blue) hover:underline">
                          {p.patient}
                        </td>
                        <td className="py-2 px-4">{p.cpf}</td>
                        <td className="py-2 px-4">{p.phone}</td>
                        <td className="py-2 px-4">{p.medico}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* PAGINAÇÃO */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    className="cis-secondary-button p-2 disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    aria-label="Página anterior"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="font-semibold text-(--cis-navy)">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    className="cis-secondary-button p-2 disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Próxima página"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

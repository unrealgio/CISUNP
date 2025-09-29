import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaUserMd,
  FaIdCard,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Header from "../components/Header";
import Menu from "../components/Menu";
import { useNavigate } from "react-router-dom";

const filtros = [
  { key: "patient", label: "Paciente", icon: <FaUsers /> },
  { key: "cpf", label: "CPF", icon: <FaIdCard /> },
  { key: "phone", label: "Telefone", icon: <FaUserMd /> },
  { key: "medico", label: "Médico", icon: <FaUserMd /> },
];

export default function BuscarPacientePage() {
  const [busca, setBusca] = useState({});
  const [todosPacientes, setTodosPacientes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/api/pacientes/todos")
      .then((res) => res.json())
      .then((data) => {
        setTodosPacientes(data);
        setResultados(data);
      });
  }, []);

  function handleChange(e, key) {
    setBusca({ ...busca, [key]: e.target.value });
  }

  function handleBuscar(e) {
    e.preventDefault();
    let filtrados = todosPacientes.filter((p) =>
      Object.entries(busca).every(
        ([k, v]) =>
          !v ||
          (p[k] && p[k].toLowerCase().includes(v.toLowerCase()))
      )
    );
    setResultados(filtrados);
    setPage(1);
  }

  // Volta a mostrar todos ao limpar os campos de busca
  useEffect(() => {
    const algumCampoPreenchido = Object.values(busca).some((v) => v);
    if (!algumCampoPreenchido) {
      setResultados(todosPacientes);
    }
  }, [busca, todosPacientes]);

  const totalPages = Math.ceil(resultados.length / itemsPerPage);
  const paginatedResults = resultados.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <>
      <Header />
      <Menu active="pacientes" />
      <div className="bg-gray-200 min-h-screen px-2 md:px-8 py-6">
        <form
          className="flex flex-wrap gap-4 bg-[#7A97B6] rounded-xl p-6 mb-6 shadow"
          onSubmit={handleBuscar}
        >
          {filtros.map((filtro) => (
            <div
              key={filtro.key}
              className="flex flex-col flex-1 min-w-[160px]"
            >
              <label className="text-white font-semibold mb-1 flex items-center gap-2">
                {filtro.icon} {filtro.label}:
              </label>
              <input
                className="rounded-lg px-3 py-2 bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] transition outline-none text-black placeholder-black text-base font-medium"
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
              className="flex items-center gap-2 bg-[#F9A23B] hover:bg-[#e68a1a] text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <FaSearch /> Buscar
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#7A97B6] text-white">
                <th className="py-2 px-4 rounded-tl-lg">Paciente</th>
                <th className="py-2 px-4">CPF</th>
                <th className="py-2 px-4">Telefone</th>
                <th className="py-2 px-4 rounded-tr-lg">Médico</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((p, idx) => (
                  <tr
                    key={p.cpf || p.patient || idx}
                    className="hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => {
                      if (p.cpf) {
                        navigate(`/paciente/${encodeURIComponent(p.cpf)}`);
                      } else {
                        alert("Paciente sem CPF cadastrado!");
                      }
                    }}
                    title="Ver detalhes do paciente"
                  >
                    <td className="py-2 px-4 font-semibold text-[#045397] hover:underline">
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <FaChevronLeft />
              </button>
              <span className="font-semibold text-[#045397]">
                Página {page} de {totalPages}
              </span>
              <button
                className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Próxima página"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
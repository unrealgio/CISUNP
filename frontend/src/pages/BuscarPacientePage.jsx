import React, { useState } from "react";
import { FaSearch, FaUserMd, FaIdCard, FaUsers, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Header from "../components/Header";
import Menu from "../components/Menu";

// Removido o filtro de RA
const filtros = [
  { key: "nome", label: "Paciente", icon: <FaUsers /> },
  { key: "cpf", label: "CPF", icon: <FaIdCard /> },
  { key: "equipe", label: "Equipe", icon: <FaUserMd /> },
  { key: "medico", label: "Médico", icon: <FaUserMd /> },
  { key: "telefone", label: "Telefone", icon: <FaIdCard /> },
];

// Removido o campo RA dos pacientes
const pacientesExemplo = [
  {
    cpf: "123.456.789-00",
    nome: "Ana Paula Silva",
    equipe: "Cardiologia",
    medico: "Dr. João Souza",
    telefone: "(11) 91234-5678"
  },
  {
    cpf: "234.567.890-11",
    nome: "Bruno Costa",
    equipe: "Pediatria",
    medico: "Dra. Maria Oliveira",
    telefone: "(11) 92345-6789"
  },
  {
    cpf: "345.678.901-22",
    nome: "Carla Mendes",
    equipe: "Ortopedia",
    medico: "Dr. Pedro Lima",
    telefone: "(11) 93456-7890"
  },
  {
    cpf: "456.789.012-33",
    nome: "Daniela Rocha",
    equipe: "Dermatologia",
    medico: "Dra. Fernanda Alves",
    telefone: "(11) 94567-8901"
  },
  {
    cpf: "567.890.123-44",
    nome: "Eduardo Martins",
    equipe: "Neurologia",
    medico: "Dr. Ricardo Torres",
    telefone: "(11) 95678-9012"
  },
  {
    cpf: "678.901.234-55",
    nome: "Fernanda Lima",
    equipe: "Ginecologia",
    medico: "Dra. Juliana Freitas",
    telefone: "(11) 96789-0123"
  },
  {
    cpf: "789.012.345-66",
    nome: "Gabriel Souza",
    equipe: "Oncologia",
    medico: "Dr. Marcelo Pinto",
    telefone: "(11) 97890-1234"
  },
  {
    cpf: "890.123.456-77",
    nome: "Helena Castro",
    equipe: "Psiquiatria",
    medico: "Dra. Patrícia Ramos",
    telefone: "(11) 98901-2345"
  },
  {
    cpf: "901.234.567-88",
    nome: "Igor Almeida",
    equipe: "Urologia",
    medico: "Dr. André Santos",
    telefone: "(11) 99012-3456"
  },
  {
    cpf: "012.345.678-99",
    nome: "Juliana Pereira",
    equipe: "Endocrinologia",
    medico: "Dra. Camila Costa",
    telefone: "(11) 90123-4567"
  },
  {
    cpf: "111.222.333-44",
    nome: "Kleber Nunes",
    equipe: "Reumatologia",
    medico: "Dr. Fábio Lima",
    telefone: "(11) 91234-5670"
  },
  {
    cpf: "222.333.444-55",
    nome: "Larissa Gomes",
    equipe: "Oftalmologia",
    medico: "Dra. Renata Dias",
    telefone: "(11) 92345-6781"
  },
  {
    cpf: "333.444.555-66",
    nome: "Marcos Tavares",
    equipe: "Otorrinolaringologia",
    medico: "Dr. Sérgio Alves",
    telefone: "(11) 93456-7892"
  },
  {
    cpf: "444.555.666-77",
    nome: "Natália Fernandes",
    equipe: "Gastroenterologia",
    medico: "Dra. Bianca Souza",
    telefone: "(11) 94567-8903"
  },
  {
    cpf: "555.666.777-88",
    nome: "Otávio Barros",
    equipe: "Nefrologia",
    medico: "Dr. Gustavo Martins",
    telefone: "(11) 95678-9014"
  }
];

export default function BuscarPacientePage({ onSelectPaciente }) {
  const [busca, setBusca] = useState({});
  const [resultados, setResultados] = useState(pacientesExemplo);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  function handleChange(e, key) {
    setBusca({ ...busca, [key]: e.target.value });
  }

  function handleBuscar(e) {
    e.preventDefault();
    let filtrados = pacientesExemplo.filter(p =>
      Object.entries(busca).every(([k, v]) =>
        !v || (p[k] && p[k].toLowerCase().includes(v.toLowerCase()))
      )
    );
    setResultados(filtrados);
    setPage(1);
  }

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
          {filtros.map(filtro => (
            <div key={filtro.key} className="flex flex-col flex-1 min-w-[160px]">
              <label className="text-white font-semibold mb-1 flex items-center gap-2">
                {filtro.icon} {filtro.label}:
              </label>
              <input
                className="rounded-lg px-3 py-2 bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] transition outline-none text-black placeholder-black text-base font-medium"
                type="text"
                value={busca[filtro.key] || ""}
                onChange={e => handleChange(e, filtro.key)}
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
                <th className="py-2 px-4 rounded-tl-lg">CPF</th>
                <th className="py-2 px-4">Paciente</th>
                <th className="py-2 px-4">Equipe</th>
                <th className="py-2 px-4">Médico</th>
                <th className="py-2 px-4 rounded-tr-lg">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((p, idx) => (
                  <tr
                    key={p.cpf + idx}
                    className="hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => onSelectPaciente && onSelectPaciente(p)}
                    title="Ver detalhes do paciente"
                  >
                    <td className="py-2 px-4">{p.cpf}</td>
                    <td className="py-2 px-4 font-semibold text-[#045397] hover:underline">{p.nome}</td>
                    <td className="py-2 px-4">{p.equipe}</td>
                    <td className="py-2 px-4">{p.medico}</td>
                    <td className="py-2 px-4">{p.telefone}</td>
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
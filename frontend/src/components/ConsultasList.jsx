import React, { useState } from "react";
import { FaUser, FaCalendarAlt, FaClock, FaUserMd, FaChevronLeft, FaChevronRight, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

const consultasExemplo = [
  {
    id: 1,
    paciente: "Ana Paula Silva",
    data: "10/09/2025",
    hora: "14:00",
    equipe: "Cardiologia",
    status: "Confirmada",
    detalhes: "Consulta de rotina para avaliação cardíaca.",
  },
  {
    id: 2,
    paciente: "Bruno Costa",
    data: "11/09/2025",
    hora: "09:30",
    equipe: "Pediatria",
    status: "Pendente",
    detalhes: "Primeira consulta pediátrica do paciente.",
  },
  {
    id: 3,
    paciente: "Carla Mendes",
    data: "12/09/2025",
    hora: "16:00",
    equipe: "Ortopedia",
    status: "Cancelada",
    detalhes: "Consulta cancelada pelo paciente.",
  },
  {
    id: 4,
    paciente: "Daniela Rocha",
    data: "13/09/2025",
    hora: "10:00",
    equipe: "Dermatologia",
    status: "Confirmada",
    detalhes: "Avaliação de lesão dermatológica.",
  },
  {
    id: 5,
    paciente: "Eduardo Martins",
    data: "14/09/2025",
    hora: "15:00",
    equipe: "Neurologia",
    status: "Pendente",
    detalhes: "Consulta para investigação de cefaleia.",
  },
  {
    id: 6,
    paciente: "Fernanda Lima",
    data: "15/09/2025",
    hora: "11:30",
    equipe: "Ginecologia",
    status: "Confirmada",
    detalhes: "Retorno de exame preventivo.",
  },
  {
    id: 7,
    paciente: "Gabriel Souza",
    data: "16/09/2025",
    hora: "13:00",
    equipe: "Oncologia",
    status: "Confirmada",
    detalhes: "Acompanhamento de tratamento oncológico.",
  },
  {
    id: 8,
    paciente: "Helena Castro",
    data: "17/09/2025",
    hora: "09:00",
    equipe: "Psiquiatria",
    status: "Pendente",
    detalhes: "Avaliação inicial psiquiátrica.",
  },
  {
    id: 9,
    paciente: "Igor Almeida",
    data: "18/09/2025",
    hora: "14:30",
    equipe: "Urologia",
    status: "Confirmada",
    detalhes: "Consulta para avaliação de exames urológicos.",
  },
  {
    id: 10,
    paciente: "Juliana Pereira",
    data: "19/09/2025",
    hora: "16:30",
    equipe: "Endocrinologia",
    status: "Cancelada",
    detalhes: "Consulta cancelada pelo médico.",
  },
  {
    id: 11,
    paciente: "Kleber Nunes",
    data: "20/09/2025",
    hora: "08:30",
    equipe: "Reumatologia",
    status: "Confirmada",
    detalhes: "Avaliação de dor articular.",
  },
  {
    id: 12,
    paciente: "Larissa Gomes",
    data: "21/09/2025",
    hora: "10:30",
    equipe: "Oftalmologia",
    status: "Pendente",
    detalhes: "Consulta para exame de vista.",
  },
  {
    id: 13,
    paciente: "Marcos Tavares",
    data: "22/09/2025",
    hora: "12:00",
    equipe: "Otorrinolaringologia",
    status: "Confirmada",
    detalhes: "Avaliação de sinusite crônica.",
  },
  {
    id: 14,
    paciente: "Natália Fernandes",
    data: "23/09/2025",
    hora: "15:30",
    equipe: "Gastroenterologia",
    status: "Confirmada",
    detalhes: "Consulta para investigação de dor abdominal.",
  },
  {
    id: 15,
    paciente: "Otávio Barros",
    data: "24/09/2025",
    hora: "09:45",
    equipe: "Nefrologia",
    status: "Cancelada",
    detalhes: "Consulta cancelada pelo paciente.",
  },
  // Exemplos adicionais
  {
    id: 16,
    paciente: "Patrícia Lopes",
    data: "25/09/2025",
    hora: "11:00",
    equipe: "Hematologia",
    status: "Confirmada",
    detalhes: "Consulta para avaliação de anemia.",
  },
  {
    id: 17,
    paciente: "Renato Oliveira",
    data: "26/09/2025",
    hora: "13:30",
    equipe: "Otorrinolaringologia",
    status: "Pendente",
    detalhes: "Consulta para avaliação de alergia respiratória.",
  },
  {
    id: 18,
    paciente: "Sofia Martins",
    data: "27/09/2025",
    hora: "15:00",
    equipe: "Ginecologia",
    status: "Confirmada",
    detalhes: "Consulta para acompanhamento pré-natal.",
  },
  {
    id: 19,
    paciente: "Thiago Ribeiro",
    data: "28/09/2025",
    hora: "09:00",
    equipe: "Ortopedia",
    status: "Cancelada",
    detalhes: "Consulta cancelada pelo paciente.",
  },
  {
    id: 20,
    paciente: "Ursula Freitas",
    data: "29/09/2025",
    hora: "10:30",
    equipe: "Dermatologia",
    status: "Confirmada",
    detalhes: "Avaliação de manchas na pele.",
  },
  {
    id: 21,
    paciente: "Vinícius Cardoso",
    data: "30/09/2025",
    hora: "14:00",
    equipe: "Cardiologia",
    status: "Pendente",
    detalhes: "Consulta para investigação de palpitações.",
  },
  {
    id: 22,
    paciente: "Wesley Santos",
    data: "01/10/2025",
    hora: "16:00",
    equipe: "Neurologia",
    status: "Confirmada",
    detalhes: "Avaliação de tontura recorrente.",
  },
  {
    id: 23,
    paciente: "Xuxa Menezes",
    data: "02/10/2025",
    hora: "08:30",
    equipe: "Pediatria",
    status: "Confirmada",
    detalhes: "Consulta de rotina pediátrica.",
  },
  {
    id: 24,
    paciente: "Yasmin Duarte",
    data: "03/10/2025",
    hora: "10:00",
    equipe: "Endocrinologia",
    status: "Pendente",
    detalhes: "Consulta para controle de diabetes.",
  },
  {
    id: 25,
    paciente: "Zeca Amaral",
    data: "04/10/2025",
    hora: "12:30",
    equipe: "Urologia",
    status: "Confirmada",
    detalhes: "Avaliação de exames de próstata.",
  },
  {
    id: 26,
    paciente: "Amanda Figueiredo",
    data: "05/10/2025",
    hora: "15:30",
    equipe: "Gastroenterologia",
    status: "Cancelada",
    detalhes: "Consulta cancelada pelo médico.",
  },
  {
    id: 27,
    paciente: "Bruno Teixeira",
    data: "06/10/2025",
    hora: "09:45",
    equipe: "Reumatologia",
    status: "Confirmada",
    detalhes: "Avaliação de artrite reumatoide.",
  },
  {
    id: 28,
    paciente: "Camila Souza",
    data: "07/10/2025",
    hora: "11:15",
    equipe: "Oftalmologia",
    status: "Pendente",
    detalhes: "Consulta para troca de óculos.",
  },
  {
    id: 29,
    paciente: "Diego Lima",
    data: "08/10/2025",
    hora: "13:00",
    equipe: "Oncologia",
    status: "Confirmada",
    detalhes: "Acompanhamento pós-quimioterapia.",
  },
  {
    id: 30,
    paciente: "Elisa Torres",
    data: "09/10/2025",
    hora: "14:45",
    equipe: "Psiquiatria",
    status: "Pendente",
    detalhes: "Consulta para ajuste de medicação.",
  },
];

export default function ConsultasList({ consultas = consultasExemplo }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const itemsPerPage = 12;

  // FILTRO POR NOME DO PACIENTE
  const filteredConsultas = consultas.filter(c =>
    c.paciente.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredConsultas.length / itemsPerPage);
  const paginatedConsultas = filteredConsultas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleExpand(id) {
    setExpanded(expanded === id ? null : id);
  }

  return (
    <div className="w-full px-2 md:px-8 py-6">
      <h2 className="text-2xl font-bold text-[#045397] mb-6">Minhas Consultas</h2>

      {/* Filtro de pesquisa */}
      <div className="flex items-center gap-2 mb-6 max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nome do paciente..."
            className="w-full rounded-lg px-4 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] transition outline-none text-black placeholder-gray-500 text-base font-medium"
            aria-label="Buscar por nome do paciente"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Cards de consultas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedConsultas.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            Nenhuma consulta encontrada.
          </div>
        ) : (
          paginatedConsultas.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl shadow-lg p-5 flex flex-col gap-2 border-l-4 transition hover:shadow-xl hover:scale-[1.02] cursor-pointer`}
              style={{
                borderColor:
                  c.status === "Confirmada"
                    ? "#4ade80"
                    : c.status === "Cancelada"
                    ? "#f87171"
                    : "#fbbf24",
              }}
              onClick={() => handleExpand(c.id)}
              tabIndex={0}
              aria-expanded={expanded === c.id}
              aria-label={`Detalhes da consulta de ${c.paciente}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <FaUser className="text-[#045397]" />
                <span className="font-bold text-lg text-[#045397]">{c.paciente}</span>
                <span
                  className="ml-auto px-2 py-1 rounded text-xs font-semibold"
                  style={{
                    background:
                      c.status === "Confirmada"
                        ? "#dcfce7"
                        : c.status === "Cancelada"
                        ? "#fee2e2"
                        : "#fef9c3",
                    color:
                      c.status === "Confirmada"
                        ? "#166534"
                        : c.status === "Cancelada"
                        ? "#991b1b"
                        : "#92400e",
                  }}
                >
                  {c.status}
                </span>
                <span className="ml-2">
                  {expanded === c.id ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FaCalendarAlt /> {c.data}
                <FaClock className="ml-4" /> {c.hora}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FaUserMd /> {c.equipe}
              </div>
              {/* DETALHES EXPANDIDOS DAS CONSULTAS */}
              {expanded === c.id && (
                <div className="mt-3 p-3 rounded bg-gray-50 border border-gray-200 text-gray-700 text-sm">
                  <strong>Detalhes:</strong> {c.detalhes}
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
  );
}
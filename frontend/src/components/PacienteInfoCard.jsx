import React from "react";
import { FaUserCircle, FaEdit, FaTrash } from "react-icons/fa";

export default function PacienteInfoCard({ paciente, onEdit, onDelete }) {
  return (
    <div className="bg-[#e6ecf3] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start shadow mb-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
      <div className="flex flex-col items-center min-w-[100px]">
        <FaUserCircle className="text-[#5A6A8E] bg-white rounded-full" size={64} />
        <div className="mt-2 text-gray-700 text-center">
          <div className="font-bold text-base md:text-lg">{paciente.nome}</div>
          <div className="text-sm">{paciente.idade} anos</div>
          <div className="text-sm">{paciente.telefone}</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1">
          <div className="mb-2">
            <span className="font-bold">Futuros agendamentos:</span>
            <ul className="ml-2 mt-1">
              {paciente.agendamentos.map((ag, idx) => (
                <li key={idx} className="text-sm">
                  <span className={ag.tipo === "Consulta" ? "text-blue-500" : "text-green-700"}>
                    {ag.tipo}
                  </span>{" "}
                  com <span className="font-semibold">{ag.profissional}</span> dia {ag.data} às {ag.hora}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-bold mb-1">Observações:</div>
          <div className="text-sm">
            {paciente.observacoes}
            <br />
            <span className="text-xs text-gray-500">
              por: <span className="font-bold">{paciente.observacoesAutor}</span> {paciente.observacoesData}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            className="flex items-center gap-1 bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 shadow"
            onClick={onEdit}
            title="Editar paciente"
          >
            <FaEdit className="text-lg" /> Editar
          </button>
          <button
            className="flex items-center gap-1 bg-red-200 hover:bg-red-300 text-red-900 font-semibold px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 shadow"
            onClick={onDelete}
            title="Excluir paciente"
          >
            <FaTrash className="text-lg" /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
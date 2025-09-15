import React from "react";
import { MdEdit, MdDelete } from "react-icons/md";

export default function Details({ schedule }) {
  if (!schedule) return null;

  return (
    <div className="bg-gray-200 rounded-xl p-4 mt-4 w-full">
      <div className="mb-2">
        <span className="font-bold">Paciente:</span> {schedule.patient}
      </div>
      <div className="mb-2">
        <span className="font-bold">Horário:</span> {schedule.time} - {schedule.date}
      </div>
      <div className="mb-2">
        <span className="font-bold">Telefone:</span> {schedule.phone}
      </div>
      <div className="mb-2">
        <span className="font-bold">Observações:</span> {schedule.notes}
      </div>
      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition">Confirmar</button>
        <button className="bg-blue-700 text-white px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-blue-800 transition">
          <MdEdit /> Editar
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-red-700 transition">
          <MdDelete /> Excluir
        </button>
      </div>
    </div>
  );
}
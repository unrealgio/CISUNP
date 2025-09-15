import React from "react";
import { FaCheck, FaEdit, FaTrash } from "react-icons/fa";

export default function List({ schedules, selected, onSelect, currentDate, onConfirm, onEdit, onDelete }) {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-3 rounded-t-xl bg-[#7A97B6] text-white font-bold text-lg px-4 md:px-6 py-2 min-w-[600px]">
        <div className="text-left pl-4 md:pl-6">Horário</div>
        <div className="text-center">Paciente</div>
        <div className="text-right">
          {currentDate &&
            currentDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-gray-200 rounded-b-xl p-4 min-w-[600px]">
        {schedules.map((item) => (
          <div
            key={item.time}
            className={`grid grid-cols-3 items-center rounded-lg px-4 py-2 shadow transition cursor-pointer ${
              selected?.time === item.time
                ? "bg-blue-200"
                : item.patient
                ? "bg-gray-100 hover:bg-blue-100"
                : "bg-white hover:bg-blue-50"
            }`}
            onClick={() => onSelect(item)}
          >
            <span className="text-left font-bold flex items-center gap-2 pl-4 md:pl-6">
              + {item.time}
              {item.patient ? (
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Ocupado"></span>
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400" title="Livre"></span>
              )}
            </span>
            <span className="text-center">{item.patient || <span className="text-gray-400 italic">Disponível</span>}</span>
            <span className="flex justify-end gap-2">
              <button
                className="p-1 rounded hover:bg-green-100 text-green-700"
                aria-label="Confirmar"
                onClick={e => { e.stopPropagation(); onConfirm && onConfirm(item); }}
                disabled={!item.patient}
                title="Confirmar"
              >
                <FaCheck />
              </button>
              <button
                className="p-1 rounded hover:bg-blue-100 text-blue-700"
                aria-label="Editar"
                onClick={e => { e.stopPropagation(); onEdit && onEdit(item); }}
                disabled={!item.patient}
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                className="p-1 rounded hover:bg-red-100 text-red-700"
                aria-label="Excluir"
                onClick={e => { e.stopPropagation(); onDelete && onDelete(item); }}
                disabled={!item.patient}
                title="Excluir"
              >
                <FaTrash />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
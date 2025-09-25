import React, { useState } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { MdPersonAdd, MdMedicalServices } from "react-icons/md";

export default function List({
  schedules,
  selected,
  onSelect,
  currentDate,
  onDelete,
  onSavePatient
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [medicoName, setMedicoName] = useState("");
  const [error, setError] = useState("");

  function startEdit(idx, patient, medico) {
    setEditingIndex(idx);
    setPatientName(patient || "");
    setMedicoName(medico || "");
    setError("");
  }

  function handleSave(idx, item) {
    if (!patientName.trim()) {
      setError("O nome do paciente é obrigatório!");
      return;
    }
    setError("");
    onSavePatient(item, patientName.trim(), medicoName.trim());
    setEditingIndex(null);
    setPatientName("");
    setMedicoName("");
  }

  function handleKeyDown(e, idx, item) {
    if (e.key === "Enter") {
      handleSave(idx, item);
    }
    if (e.key === "Escape") {
      setEditingIndex(null);
      setPatientName("");
      setMedicoName("");
      setError("");
    }
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-4 rounded-t-xl bg-[#7A97B6] text-white font-bold text-lg px-4 md:px-6 py-2 min-w-[700px]">
        <div className="text-left pl-4 md:pl-6">Horário</div>
        <div className="text-center">Paciente</div>
        <div className="text-center">Médico</div>
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
      {error && (
        <div className="text-red-600 text-sm text-center mb-2">{error}</div>
      )}
      <div className="flex flex-col gap-3 bg-gray-200 rounded-b-xl p-4 min-w-[700px]">
        {schedules.map((item, idx) => (
          <div
            key={item.time}
            className={`grid grid-cols-4 items-center rounded-lg px-4 py-2 shadow ${
              selected?.time === item.time
                ? "bg-blue-200"
                : item.patient
                ? "bg-gray-100 hover:bg-blue-100"
                : "bg-white hover:bg-blue-50"
            } cursor-pointer`}
            onClick={() => onSelect && onSelect(item)}
          >
            <span className="text-left font-bold flex items-center gap-2 pl-4 md:pl-6">
              + {item.time}
              {item.patient ? (
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Ocupado"></span>
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400" title="Livre"></span>
              )}
            </span>
            <span className="text-center flex items-center justify-center gap-2">
              {editingIndex === idx ? (
                <input
                  type="text"
                  className="px-2 py-1 border border-gray-400 rounded focus:outline-[#045397] w-32"
                  placeholder="Nome do paciente"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  autoFocus
                  onKeyDown={e => handleKeyDown(e, idx, item)}
                />
              ) : item.patient ? (
                <span className="font-semibold">{item.patient}</span>
              ) : (
                <>
                  <span className="text-gray-400 italic">Disponível</span>
                  <button
                    className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
                    aria-label="Adicionar paciente"
                    onClick={e => {
                      e.stopPropagation();
                      startEdit(idx, "", item.medico);
                    }}
                    title="Adicionar paciente"
                  >
                    <MdPersonAdd size={22} />
                  </button>
                </>
              )}
            </span>
            <span className="text-center flex items-center justify-center gap-2">
              {editingIndex === idx ? (
                <input
                  type="text"
                  className="px-2 py-1 border border-gray-400 rounded focus:outline-[#045397] w-32"
                  placeholder="Nome do médico"
                  value={medicoName}
                  onChange={e => setMedicoName(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, idx, item)}
                />
              ) : item.medico ? (
                <span className="font-semibold text-[#045397]">{item.medico}</span>
              ) : (
                <>
                  <span className="text-gray-400 italic">Disponível</span>
                  <button
                    className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
                    aria-label="Adicionar médico"
                    onClick={e => {
                      e.stopPropagation();
                      startEdit(idx, item.patient, "");
                    }}
                    title="Adicionar médico"
                  >
                    <MdMedicalServices size={22} />
                  </button>
                </>
              )}
            </span>
            <span className="flex justify-end gap-2">
              {editingIndex === idx ? (
                <>
                  <button
                    className="p-1 rounded hover:bg-green-100 text-green-700 cursor-pointer"
                    aria-label="Salvar"
                    onClick={() => handleSave(idx, item)}
                    title="Salvar"
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
                    aria-label="Cancelar"
                    onClick={() => {
                      setEditingIndex(null);
                      setPatientName("");
                      setMedicoName("");
                      setError("");
                    }}
                    title="Cancelar"
                  >
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
                    aria-label="Editar"
                    onClick={e => {
                      e.stopPropagation();
                      startEdit(idx, item.patient, item.medico);
                    }}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100 text-red-700 cursor-pointer"
                    aria-label="Excluir"
                    onClick={e => {
                      e.stopPropagation();
                      onDelete && onDelete(item);
                    }}
                    disabled={!item.patient}
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
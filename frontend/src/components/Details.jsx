import React, { useState, useEffect, useRef } from "react";
import { MdEdit, MdDelete, MdSave, MdCancel } from "react-icons/md";

export default function Details({ schedule, onSave, onDelete, editField, setEditField }) {
  const [editMode, setEditMode] = useState(false);
  const [patient, setPatient] = useState(schedule?.patient || "");
  const [phone, setPhone] = useState(schedule?.phone || "");
  const [notes, setNotes] = useState(schedule?.notes || "");
  const [medico, setMedico] = useState(schedule?.medico || "");
  const [error, setError] = useState("");

  const patientRef = useRef(null);
  const medicoRef = useRef(null);

  useEffect(() => {
    setPatient(schedule?.patient || "");
    setPhone(schedule?.phone || "");
    setNotes(schedule?.notes || "");
    setMedico(schedule?.medico || "");
    setError("");
    if (editField) setEditMode(true);
    else setEditMode(false);
  }, [schedule, editField]);

  useEffect(() => {
    if (editMode && editField === "patient" && patientRef.current) {
      patientRef.current.focus();
    }
    if (editMode && editField === "medico" && medicoRef.current) {
      medicoRef.current.focus();
    }
  }, [editMode, editField]);

  if (!schedule || (!schedule.patient && !editMode)) {
    return (
      <div className="bg-gray-200 rounded-xl p-4 mt-4 w-full text-center text-gray-500">
        Selecione um paciente para ver os detalhes.
      </div>
    );
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  }

  function handleSave() {
    if (!patient.trim()) {
      setError("O nome do paciente é obrigatório!");
      return;
    }
    setError("");
    onSave &&
      onSave({
        ...schedule,
        patient,
        phone,
        notes,
        medico,
      });
    setEditMode(false);
    setEditField("");
  }

  function handleDelete() {
    onDelete && onDelete(schedule);
    setEditField("");
  }

  function handleCancel() {
    setEditMode(false);
    setEditField("");
  }

  return (
    <div className="bg-gray-200 rounded-xl p-4 mt-4 w-full">
      {error && (
        <div className="text-red-600 text-sm text-center mb-2">{error}</div>
      )}
      <div className="mb-2">
        <span className="font-bold">Paciente:</span>{" "}
        {editMode && editField === "patient" ? (
          <input
            ref={patientRef}
            type="text"
            className="border rounded px-2 py-1"
            value={patient}
            onChange={e => setPatient(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          schedule.patient
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">Horário:</span> {schedule.time} - {schedule.date}
      </div>
      <div className="mb-2">
        <span className="font-bold">Médico:</span>{" "}
        {editMode && editField === "medico" ? (
          <input
            ref={medicoRef}
            type="text"
            className="border rounded px-2 py-1"
            value={medico}
            onChange={e => setMedico(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          schedule.medico || <span className="text-gray-400 italic">Disponível</span>
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">Telefone:</span>{" "}
        {editMode && !editField ? (
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        ) : (
          schedule.phone || <span className="text-gray-400">Não informado</span>
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">Observações:</span>{" "}
        {editMode && !editField ? (
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        ) : (
          schedule.notes || <span className="text-gray-400">Nenhuma</span>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {editMode ? (
          <>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-green-700 transition"
              onClick={handleSave}
            >
              <MdSave /> Salvar
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-gray-500 transition"
              onClick={handleCancel}
            >
              <MdCancel /> Cancelar
            </button>
          </>
        ) : (
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-blue-800 transition"
            onClick={() => {
              setEditMode(true);
              setEditField("");
            }}
          >
            <MdEdit /> Editar
          </button>
        )}
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-bold flex items-center gap-1 hover:bg-red-700 transition"
          onClick={handleDelete}
        >
          <MdDelete /> Excluir
        </button>
      </div>
    </div>
  );
}
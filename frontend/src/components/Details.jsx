import React, { useState, useEffect, useRef } from "react";
import { MdEdit, MdDelete, MdSave, MdCancel } from "react-icons/md";

export default function Details({
  schedule,
  onSave,
  onDelete,
  editField,
  setEditField,
}) {
  const [editMode, setEditMode] = useState(false);
  const [patient, setPatient] = useState(schedule?.patient || "");
  const [cpf, setCpf] = useState(schedule?.cpf || "");
  const [phone, setPhone] = useState(schedule?.phone || "");
  const [notes, setNotes] = useState(schedule?.notes || "");
  const [medico, setMedico] = useState(schedule?.medico || "");
  const [error, setError] = useState("");

  const patientRef = useRef(null);
  const medicoRef = useRef(null);

  useEffect(() => {
    setPatient(schedule?.patient || "");
    setCpf(schedule?.cpf || "");
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
      <div className="cis-panel p-4 mt-4 w-full text-center text-[var(--cis-muted)]">
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
        cpf,
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
    <div className="cis-panel p-4 mt-4 w-full relative">
      {error && (
        <div className="text-[var(--cis-danger)] bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-center mb-2">
          {error}
        </div>
      )}
      <div className="mb-2">
        <span className="font-bold">Paciente:</span>{" "}
        {editMode && editField === "patient" ? (
          <input
            ref={patientRef}
            type="text"
            className="cis-input max-w-full"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          schedule.patient
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">CPF:</span>{" "}
        {editMode && !editField ? (
          <input
            type="text"
            className="cis-input max-w-full"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
          />
        ) : (
          schedule.cpf || <span className="text-gray-400">Não informado</span>
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">Horário:</span> {schedule.time} -{" "}
        {schedule.date}
      </div>
      <div className="mb-2">
        <span className="font-bold">Médico:</span>{" "}
        {editMode && (editField === "medico" || !editField) ? (
          <input
            ref={medicoRef}
            type="text"
            className="cis-input max-w-full"
            value={medico}
            onChange={(e) => setMedico(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          schedule.medico || (
            <span className="text-gray-400 italic">Disponível</span>
          )
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">Telefone:</span>{" "}
        {editMode && !editField ? (
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        ) : (
          schedule.phone || <span className="text-gray-400">Não informado</span>
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold">Observações:</span>{" "}
        {editMode && !editField ? (
          <textarea
            className="cis-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        ) : (
          schedule.notes || <span className="text-gray-400">Nenhuma</span>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {editMode ? (
          <>
            <button
              className="cis-primary-button flex items-center gap-1"
              onClick={handleSave}
            >
              <MdSave /> Salvar
            </button>
            <button
              className="cis-secondary-button flex items-center gap-1"
              onClick={handleCancel}
            >
              <MdCancel /> Cancelar
            </button>
          </>
        ) : (
          <button
            className="cis-primary-button flex items-center gap-1"
            onClick={() => {
              setEditMode(true);
              setEditField("");
            }}
          >
            <MdEdit /> Editar
          </button>
        )}
        <button
          className="rounded-[0.55rem] bg-[var(--cis-danger)] px-4 py-2 font-bold text-white transition hover:bg-red-800 flex items-center gap-1"
          onClick={handleDelete}
        >
          <MdDelete /> Excluir
        </button>
      </div>
    </div>
  );
}

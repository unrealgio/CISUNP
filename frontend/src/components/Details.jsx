import { useState, useEffect, useRef } from "react";
import { MdEdit, MdDelete, MdSave, MdClose } from "react-icons/md";
import { ErrorMessage } from "./StatusMessage";

export default function Details({
  schedule,
  onSave,
  onDelete,
  editField,
  setEditField,
}) {
  const [editMode, setEditMode] = useState(Boolean(editField));
  const [patient, setPatient] = useState(schedule?.patient || "");
  const [cpf, setCpf] = useState(schedule?.cpf || "");
  const [phone, setPhone] = useState(schedule?.phone || "");
  const [notes, setNotes] = useState(schedule?.notes || "");
  const [medico, setMedico] = useState(schedule?.medico || "");
  const [error, setError] = useState("");

  const patientRef = useRef(null);
  const medicoRef = useRef(null);

  function iniciarEdicao() {
    setPatient(schedule?.patient || "");
    setCpf(schedule?.cpf || "");
    setPhone(schedule?.phone || "");
    setNotes(schedule?.notes || "");
    setMedico(schedule?.medico || "");
    setError("");
    setEditMode(true);
    setEditField("");
  }

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
      <div className="cis-panel p-4 mt-4 w-full text-center text-(--cis-muted)">
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

  async function handleSave() {
    if (!patient.trim()) {
      setError("O nome do paciente é obrigatório!");
      return;
    }
    setError("");
    const salvou =
      onSave &&
      (await onSave({
        ...schedule,
        patient,
        cpf,
        phone,
        notes,
        medico,
      }));
    if (salvou) {
      setEditMode(false);
      setEditField("");
    }
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
      {/* BOTÃO DE FECHAR A EDIÇÃO */}
      {editMode && (
        <div className="flex justify-end -mt-1 -mr-1 mb-1">
          <button
            type="button"
            className="p-1 rounded-lg text-(--cis-muted) hover:text-(--cis-navy) hover:bg-(--cis-blue-soft) transition"
            onClick={handleCancel}
            aria-label="Fechar edição"
            title="Fechar edição"
          >
            <MdClose size={20} />
          </button>
        </div>
      )}
      {error && (
        <ErrorMessage compacto className="mb-2">
          {error}
        </ErrorMessage>
      )}
      <div className="mb-2">
        <span className="font-bold">Paciente:</span>{" "}
        {editMode && (editField === "patient" || !editField) ? (
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
            maxLength={11}
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
            className="cis-campo-compacto"
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
          </>
        ) : (
          <button
            className="cis-primary-button flex items-center gap-1"
            onClick={iniciarEdicao}
          >
            <MdEdit /> Editar
          </button>
        )}
        <button
          className="cis-danger-button flex items-center gap-1"
          onClick={handleDelete}
        >
          <MdDelete /> Excluir
        </button>
      </div>
    </div>
  );
}

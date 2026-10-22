import { useState, useEffect, useRef } from "react";
import { MdEdit, MdSave, MdClose, MdEventBusy } from "react-icons/md";
import { ErrorMessage } from "./StatusMessage";
import BuscaPaciente from "./BuscaPaciente";
import AcoesStatus from "./AcoesStatus";
import CampoTelefone from "./CampoTelefone";
import { formatarTelefone } from "../utils/telefone";
import { formatarCpf } from "../utils/cpf";
import { STATUS } from "../utils/statusAgendamento";

function Campo({ rotulo, children }) {
  return (
    <>
      <dt className="text-sm font-semibold text-(--cis-muted)">{rotulo}</dt>
      <dd className="min-w-0 text-(--cis-ink) wrap-anywhere">{children}</dd>
    </>
  );
}

function Vazio({ children }) {
  return <span className="text-(--cis-muted)">{children}</span>;
}

export default function Details({
  schedule,
  onSave,
  onCancelar,
  onMudarStatus,
  onFechar,
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

  function selecionarPaciente(paciente) {
    setPatient(paciente.patient);
    setCpf(paciente.cpf);
    setPhone(paciente.phone || "");
    if (!medico.trim()) setMedico(paciente.medico || "");
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

  function handleCancelarConsulta() {
    onCancelar && onCancelar(schedule);
    setEditField("");
  }

  function handleCancel() {
    setEditMode(false);
    setEditField("");
  }

  // NA EDIÇÃO, O X FECHA SÓ A EDIÇÃO; FORA DELA, FECHA O PAINEL
  function handleFechar() {
    if (editMode) handleCancel();
    else onFechar && onFechar();
  }

  const editandoTudo = editMode && !editField;

  return (
    <div className="cis-panel p-4 mt-4 w-full">
      <div className="flex items-start gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--cis-muted)">
            {schedule.time} · {schedule.date}
          </p>
          {!editMode && (
            <p className="text-lg font-bold text-(--cis-navy) wrap-anywhere">
              {schedule.patient}
            </p>
          )}
          {schedule.id && schedule.status && (
            <span
              className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                background: `var(--cis-status-${schedule.status}-bg)`,
                color: `var(--cis-status-${schedule.status}-text)`,
              }}
            >
              {STATUS[schedule.status]?.rotulo || schedule.status}
            </span>
          )}
        </div>
        <button
          type="button"
          className="cis-icon-button cis-icone-neutro shrink-0"
          onClick={handleFechar}
          aria-label={editMode ? "Fechar edição" : "Fechar detalhes"}
          title={editMode ? "Fechar edição" : "Fechar detalhes"}
        >
          <MdClose size={20} />
        </button>
      </div>

      {error && (
        <ErrorMessage compacto className="mb-2">
          {error}
        </ErrorMessage>
      )}

      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 border-t border-(--cis-border) pt-3">
        {editMode && (editField === "patient" || !editField) && (
          <Campo rotulo="Paciente">
            <BuscaPaciente
              inputRef={patientRef}
              value={patient}
              onChange={setPatient}
              onSelecionar={selecionarPaciente}
              onKeyDown={handleKeyDown}
            />
          </Campo>
        )}
        <Campo rotulo="CPF">
          {editandoTudo ? (
            <input
              type="text"
              className="cis-input"
              inputMode="numeric"
              maxLength={11}
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            />
          ) : (
            formatarCpf(schedule.cpf) || <Vazio>Não informado</Vazio>
          )}
        </Campo>
        <Campo rotulo="Médico">
          {editMode && (editField === "medico" || !editField) ? (
            <input
              ref={medicoRef}
              type="text"
              className="cis-input"
              value={medico}
              maxLength={255}
              onChange={(e) => setMedico(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            schedule.medico || <Vazio>Não informado</Vazio>
          )}
        </Campo>
        <Campo rotulo="Telefone">
          {editandoTudo ? (
            <CampoTelefone value={phone} onChange={setPhone} />
          ) : (
            formatarTelefone(schedule.phone) || <Vazio>Não informado</Vazio>
          )}
        </Campo>
        <Campo rotulo="Observações">
          {editandoTudo ? (
            <textarea
              className="cis-input"
              value={notes}
              maxLength={255}
              rows={2}
              onChange={(e) => setNotes(e.target.value)}
            />
          ) : (
            schedule.notes || <Vazio>Nenhuma</Vazio>
          )}
        </Campo>
      </dl>

      {!editMode && schedule.id && (
        <div className="mt-4 border-t border-(--cis-border) pt-3">
          <AcoesStatus
            consulta={{
              id: schedule.id,
              status: schedule.status,
              date: schedule.dateISO,
            }}
            onEscolher={(status) =>
              onMudarStatus && onMudarStatus(schedule, status)
            }
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {editMode ? (
          <button
            className="cis-primary-button flex items-center justify-center gap-1"
            onClick={handleSave}
          >
            <MdSave /> Salvar
          </button>
        ) : (
          <>
            <button
              className="cis-primary-button flex items-center justify-center gap-1 text-sm"
              onClick={iniciarEdicao}
            >
              <MdEdit /> Editar
            </button>
            {schedule.id && (
              <button
                className="cis-danger-soft-button flex items-center justify-center gap-1 py-[0.6rem] text-sm"
                onClick={handleCancelarConsulta}
              >
                <MdEventBusy /> Cancelar consulta
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

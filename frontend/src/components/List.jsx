import { useState } from "react";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { MdPersonAdd, MdMedicalServices, MdEventBusy } from "react-icons/md";
import { ErrorMessage } from "./StatusMessage";
import BuscaPaciente from "./BuscaPaciente";
import CampoTelefone from "./CampoTelefone";
import { STATUS } from "../utils/statusAgendamento";

export default function List({
  schedules,
  selected,
  onSelect,
  currentDate,
  onCancelar,
  onSavePatient,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [medicoName, setMedicoName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function startEdit(idx, paciente, medico, cpfValue, phoneValue, notesValue) {
    setEditingIndex(idx);
    setPatientName(paciente || "");
    setMedicoName(medico || "");
    setCpf(cpfValue || "");
    setPhone(phoneValue || "");
    setNotes(notesValue || "");
    setError("");
  }

  // FECHA O FORMULÁRIO DE EDIÇÃO E LIMPA OS CAMPOS
  function limparEdicao() {
    setEditingIndex(null);
    setPatientName("");
    setMedicoName("");
    setCpf("");
    setPhone("");
    setNotes("");
    setError("");
  }

  function selecionarPaciente(paciente) {
    setPatientName(paciente.patient);
    setCpf(paciente.cpf);
    setPhone(paciente.phone || "");
    if (!medicoName.trim()) setMedicoName(paciente.medico || "");
  }

  async function handleSave(item) {
    if (!patientName.trim()) {
      setError("Digite o nome do paciente!");
      return;
    }
    setError("");
    // SÓ LIMPA SE SALVOU; EM CASO DE ERRO, MANTÉM O QUE FOI DIGITADO
    const salvou = await onSavePatient(
      item,
      patientName.trim(),
      medicoName.trim(),
      cpf,
      phone,
      notes,
    );
    if (salvou) limparEdicao();
  }

  function handleKeyDown(e, item) {
    if (e.key === "Enter") {
      handleSave(item);
    }
    if (e.key === "Escape") {
      limparEdicao();
    }
  }

  function handleCancelar(idx, item) {
    onCancelar && onCancelar(item);
    if (editingIndex === idx) limparEdicao();
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-(--cis-shadow)">
      <div className="grid grid-cols-4 gap-x-4 rounded-t-xl bg-(--cis-navy) text-white font-semibold text-sm md:text-base px-4 md:px-6 py-3 min-w-175">
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
        <ErrorMessage compacto className="mb-2">
          {error}
        </ErrorMessage>
      )}
      <div className="flex flex-col gap-3 bg-(--cis-background) border border-t-0 border-(--cis-border) rounded-b-xl p-4 min-w-175">
        {schedules.map((item, idx) => {
          const encerrado = item.passado && !item.patient;
          return (
            <div
              key={item.time}
              className={`grid grid-cols-4 gap-x-4 items-center rounded-lg px-4 py-2 shadow ${
                selected?.time === item.time
                  ? "bg-(--cis-orange-soft) border border-(--cis-orange)"
                  : item.patient
                    ? "bg-(--cis-surface) border border-(--cis-border) hover:border-(--cis-blue) hover:bg-(--cis-blue-soft)"
                    : "bg-(--cis-surface) border border-dashed border-(--cis-border) hover:border-(--cis-blue) hover:bg-(--cis-blue-soft)"
              } cursor-pointer transition hover:shadow-md`}
              onClick={() => onSelect && onSelect(item)}
            >
              <span className="text-left font-bold flex items-center gap-2 pl-4 md:pl-6">
                + {item.time}
                {item.patient ? (
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: `var(--cis-status-${item.status})` }}
                    title={STATUS[item.status]?.rotulo || "Ocupado"}
                    aria-label={STATUS[item.status]?.rotulo || "Ocupado"}
                    role="img"
                  ></span>
                ) : (
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-(--cis-muted)"
                    title={encerrado ? "Encerrado" : "Livre"}
                  ></span>
                )}
              </span>
              <span className="text-center flex items-center justify-center gap-2">
                {editingIndex === idx ? (
                  <div className="flex flex-col gap-2 w-full">
                    <BuscaPaciente
                      value={patientName}
                      onChange={setPatientName}
                      onSelecionar={selecionarPaciente}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      autoFocus
                    />
                    <input
                      type="text"
                      className="cis-input"
                      placeholder="CPF (somente números)"
                      inputMode="numeric"
                      maxLength={11}
                      value={cpf}
                      onChange={(e) =>
                        setCpf(e.target.value.replace(/\D/g, ""))
                      }
                    />
                    <CampoTelefone
                      value={phone}
                      onChange={setPhone}
                      placeholder="Telefone"
                    />
                    <input
                      type="text"
                      className="cis-input"
                      placeholder="Observações"
                      value={notes}
                      maxLength={255}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                ) : item.patient ? (
                  <span className="font-semibold">{item.patient}</span>
                ) : encerrado ? (
                  <span className="text-(--cis-muted) italic">Encerrado</span>
                ) : (
                  <>
                    <span className="text-(--cis-muted) italic">
                      Disponível
                    </span>
                    <button
                      className="cis-icon-button cis-icone-acao"
                      aria-label="Adicionar paciente"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(
                          idx,
                          item.patient,
                          item.medico,
                          item.cpf,
                          item.phone,
                          item.notes,
                        );
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
                    className="cis-input w-32"
                    placeholder="Nome do médico"
                    value={medicoName}
                    maxLength={255}
                    onChange={(e) => setMedicoName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, item)}
                  />
                ) : item.medico ? (
                  <span className="font-semibold text-(--cis-blue)">
                    {item.medico}
                  </span>
                ) : encerrado ? null : (
                  <>
                    <span className="text-(--cis-muted) italic">
                      Disponível
                    </span>
                    <button
                      className="cis-icon-button cis-icone-acao"
                      aria-label="Adicionar médico"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(
                          idx,
                          item.patient,
                          "",
                          item.cpf,
                          item.phone,
                          item.notes,
                        );
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
                      className="cis-icon-button cis-icone-confirmar"
                      aria-label="Salvar"
                      onClick={() => handleSave(item)}
                      title="Salvar"
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="cis-icon-button cis-icone-neutro"
                      aria-label="Fechar edição"
                      onClick={limparEdicao}
                      title="Fechar edição"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="cis-icon-button cis-icone-acao"
                      aria-label="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(
                          idx,
                          item.patient,
                          item.medico,
                          item.cpf,
                          item.phone,
                          item.notes,
                        );
                      }}
                      disabled={encerrado}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="cis-icon-button cis-icone-perigo"
                      aria-label="Cancelar consulta"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelar(idx, item);
                      }}
                      disabled={!item.patient}
                      title="Cancelar consulta"
                    >
                      <MdEventBusy size={18} />
                    </button>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

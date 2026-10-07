import { useState } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { MdPersonAdd, MdMedicalServices } from "react-icons/md";
import { ErrorMessage } from "./StatusMessage";

export default function List({
  schedules,
  selected,
  onSelect,
  currentDate,
  onDelete,
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

  async function handleSave(item) {
    if (!patientName.trim()) {
      setError("Digite o nome do paciente!");
      return;
    }
    if (!item.id && !cpf.trim()) {
      setError("Informe o CPF para cadastrar o paciente automaticamente.");
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

  function handleDelete(idx, item) {
    onDelete && onDelete(item);
    if (editingIndex === idx) limparEdicao();
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-4 rounded-t-xl bg-(--cis-navy) text-white font-semibold text-sm md:text-base px-4 md:px-6 py-3 min-w-175">
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
      <div className="flex flex-col gap-3 bg-(--cis-background) rounded-b-xl p-4 min-w-175">
        {schedules.map((item, idx) => (
          <div
            key={item.time}
            className={`grid grid-cols-4 items-center rounded-lg px-4 py-2 shadow ${
              selected?.time === item.time
                ? "bg-(--cis-orange-soft) border border-(--cis-orange)"
                : item.patient
                  ? "bg-(--cis-surface) border border-(--cis-border) hover:border-(--cis-blue)"
                  : "bg-(--cis-surface) border border-dashed border-(--cis-border) hover:border-(--cis-blue)"
            } cursor-pointer transition-colors`}
            onClick={() => onSelect && onSelect(item)}
          >
            <span className="text-left font-bold flex items-center gap-2 pl-4 md:pl-6">
              + {item.time}
              {item.patient ? (
                <span
                  className="inline-block w-2 h-2 rounded-full bg-green-500"
                  title="Ocupado"
                ></span>
              ) : (
                <span
                  className="inline-block w-2 h-2 rounded-full bg-gray-400"
                  title="Livre"
                ></span>
              )}
            </span>
            <span className="text-center flex items-center justify-center gap-2">
              {editingIndex === idx ? (
                <div className="flex flex-col gap-1 w-full">
                  <input
                    type="text"
                    className="cis-input"
                    placeholder="Nome do paciente"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
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
                    onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
                  />
                  <input
                    type="text"
                    className="cis-input"
                    placeholder="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <input
                    type="text"
                    className="cis-input"
                    placeholder="Observações"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              ) : item.patient ? (
                <span className="font-semibold">{item.patient}</span>
              ) : (
                <>
                  <span className="text-gray-400 italic">Disponível</span>
                  <button
                    className="cis-icon-button hover:bg-blue-100 text-blue-700"
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
                  onChange={(e) => setMedicoName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                />
              ) : item.medico ? (
                <span className="font-semibold text-(--cis-blue)">
                  {item.medico}
                </span>
              ) : (
                <>
                  <span className="text-gray-400 italic">Disponível</span>
                  <button
                    className="cis-icon-button hover:bg-blue-100 text-blue-700"
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
                    className="cis-icon-button hover:bg-green-100 text-green-700"
                    aria-label="Salvar"
                    onClick={() => handleSave(item)}
                    title="Salvar"
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="cis-icon-button hover:bg-gray-100 text-gray-700"
                    aria-label="Cancelar"
                    onClick={limparEdicao}
                    title="Cancelar"
                  >
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="cis-icon-button hover:bg-blue-100 text-blue-700"
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
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="cis-icon-button hover:bg-red-100 text-red-700"
                    aria-label="Excluir"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(idx, item);
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

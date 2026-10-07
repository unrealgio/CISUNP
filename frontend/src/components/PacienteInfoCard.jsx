import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaIdCard,
  FaPhone,
  FaCheck,
  FaTimes,
  FaUserMd,
} from "react-icons/fa";
import { apiFetch, mensagemDeErro } from "../api";
import { ErrorMessage } from "./StatusMessage";
import { formatarDataISO } from "../utils/date";

// MONTA O FORMULÁRIO DE EDIÇÃO COM OS DADOS ATUAIS DO PACIENTE
function formDoPaciente(paciente) {
  return {
    patient: paciente.patient || "",
    idade: paciente.idade ?? "",
    medico: paciente.medico || "",
    phone: paciente.phone || "",
    endereco: paciente.endereco || "",
    notes: paciente.notes || "",
  };
}

export default function PacienteInfoCard({
  paciente,
  onPacienteAtualizado,
  onPacienteExcluido,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => formDoPaciente(paciente));
  const [loading, setLoading] = useState(false);
  const [operationError, setOperationError] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    if (paciente && paciente.cpf) {
      apiFetch(
        `/api/agendamentos/futuros?cpf=${encodeURIComponent(paciente.cpf)}`,
      )
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Erro ao carregar agendamentos.");
          setAgendamentos(Array.isArray(data) ? data : []);
        })
        .catch(() => setAgendamentos([]));
    }
  }, [paciente]);

  function handleEditChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setOperationError("");
    try {
      const res = await apiFetch(`/api/pacientes/${paciente.cpf}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(mensagemDeErro(data, "Erro ao atualizar paciente."));

      setEditing(false);
      onPacienteAtualizado && onPacienteAtualizado();
    } catch (error) {
      setOperationError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Tem certeza que deseja excluir este paciente?"))
      return;
    if (loading) return;
    setLoading(true);
    setOperationError("");
    try {
      const res = await apiFetch(`/api/pacientes/${paciente.cpf}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir paciente.");
      onPacienteExcluido && onPacienteExcluido();
    } catch (error) {
      setOperationError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleStartEdit() {
    setForm(formDoPaciente(paciente));
    setOperationError("");
    setEditing(true);
  }

  function handleCancelEdit() {
    setOperationError("");
    setEditing(false);
  }

  return (
    <div className="cis-panel p-6 flex flex-col md:flex-row gap-6 items-start mb-4">
      {operationError && <ErrorMessage>{operationError}</ErrorMessage>}
      <div className="flex flex-col items-center min-w-30">
        <FaUserCircle
          className="text-(--cis-blue) bg-(--cis-blue-soft) rounded-full"
          size={72}
        />
        <div className="mt-2 text-gray-700 text-center">
          <div className="font-bold text-lg text-(--cis-navy)">
            {editing ? (
              <input
                type="text"
                name="patient"
                className="cis-input w-44 text-sm"
                value={form.patient}
                onChange={handleEditChange}
                placeholder="Nome do paciente"
                autoFocus
              />
            ) : (
              paciente.patient
            )}
          </div>
          <div className="text-sm text-(--cis-muted)">
            {editing ? (
              <input
                type="number"
                name="idade"
                min={0}
                max={150}
                className="cis-input w-28 text-sm"
                value={form.idade}
                onChange={handleEditChange}
                placeholder="Idade"
              />
            ) : paciente.idade != null ? (
              `${paciente.idade} anos`
            ) : (
              "Idade não informada"
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <FaPhone className="text-gray-500" />{" "}
            {editing ? (
              <input
                type="text"
                name="phone"
                className="cis-input w-28 text-sm"
                value={form.phone}
                onChange={handleEditChange}
                placeholder="Telefone"
              />
            ) : (
              paciente.phone
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <FaUserMd className="text-gray-500" />{" "}
            {editing ? (
              <input
                type="text"
                name="medico"
                className="cis-input w-28 text-sm"
                value={form.medico}
                onChange={handleEditChange}
                placeholder="Médico"
              />
            ) : (
              paciente.medico
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1">
          <div className="mb-2">
            <span className="font-bold">Futuros agendamentos:</span>
            <ul className="ml-2 mt-1">
              {agendamentos.length > 0 ? (
                agendamentos.map((ag) => (
                  <li key={ag.id} className="text-sm">
                    <span className="text-(--cis-blue)">Consulta</span>
                    {" com "}
                    <span className="font-semibold">{ag.medico}</span>
                    {" dia "}
                    {formatarDataISO(ag.date)} {" às "} {ag.time}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400">
                  Nenhum agendamento futuro
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-bold mb-1">Informações pessoais:</div>
          <div className="text-sm flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <FaIdCard className="text-(--cis-muted)" /> <span>CPF:</span>{" "}
              <span className="font-semibold">{paciente.cpf}</span>
            </span>
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-(--cis-muted)" />{" "}
              <span>Endereço:</span>{" "}
              {editing ? (
                <input
                  type="text"
                  name="endereco"
                  className="cis-input w-40 text-sm"
                  value={form.endereco}
                  onChange={handleEditChange}
                  placeholder="Endereço"
                />
              ) : (
                <span className="font-semibold">{paciente.endereco}</span>
              )}
            </span>
          </div>
          <div className="font-bold mt-3 mb-1">Observações:</div>
          <div className="text-sm">
            {editing ? (
              <textarea
                name="notes"
                className="cis-input text-sm"
                value={form.notes}
                onChange={handleEditChange}
                placeholder="Observações"
                rows={2}
              />
            ) : (
              paciente.notes || (
                <span className="text-gray-400">Nenhuma observação</span>
              )
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {editing ? (
            <div className="flex gap-2">
              <button
                className="cis-primary-button flex items-center gap-1"
                onClick={handleEditSubmit}
                disabled={loading}
                title="Salvar"
              >
                <FaCheck className="text-lg" />{" "}
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button
                className="cis-secondary-button flex items-center gap-1"
                onClick={handleCancelEdit}
                disabled={loading}
                title="Cancelar"
              >
                <FaTimes className="text-lg" /> Cancelar
              </button>
            </div>
          ) : (
            <>
              <button
                className="cis-secondary-button flex items-center gap-1"
                onClick={handleStartEdit}
                title="Editar"
                disabled={loading}
              >
                <FaEdit className="text-lg" /> Editar
              </button>
              <button
                className="rounded-[0.55rem] border border-red-200 bg-red-50 px-3 py-1 font-semibold text-red-900 transition hover:bg-red-100 flex items-center gap-1"
                onClick={handleDelete}
                title="Excluir paciente"
                disabled={loading}
              >
                <FaTrash className="text-lg" />{" "}
                {loading ? "Excluindo" : "Excluir"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

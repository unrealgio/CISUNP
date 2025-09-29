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
  FaUserMd
} from "react-icons/fa";

export default function PacienteInfoCard({
  paciente,
  onPacienteAtualizado,
  onPacienteExcluido,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    endereco: paciente.endereco || "",
    notes: paciente.notes || "",
    phone: paciente.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    if (paciente && paciente.cpf) {
      fetch(
        `http://localhost:3001/api/agendamentos/futuros?cpf=${encodeURIComponent(
          paciente.cpf
        )}`
      )
        .then((res) => res.json())
        .then((data) => setAgendamentos(data));
    }
  }, [paciente]);

  function handleEditChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch(`http://localhost:3001/api/pacientes/${paciente.cpf}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...paciente,
        endereco: form.endereco,
        notes: form.notes,
        phone: form.phone,
      }),
    });
    setLoading(false);
    setEditing(false);
    onPacienteAtualizado && onPacienteAtualizado();
  }

  async function handleDelete() {
    if (!window.confirm("Tem certeza que deseja excluir este paciente?"))
      return;
    setLoading(true);
    await fetch(`http://localhost:3001/api/pacientes/${paciente.cpf}`, {
      method: "DELETE",
    });
    setLoading(false);
    onPacienteExcluido && onPacienteExcluido();
  }

  function handleCancelEdit() {
    setForm({
      endereco: paciente.endereco || "",
      notes: paciente.notes || "",
      phone: paciente.phone || "",
    });
    setEditing(false);
  }

  return (
    <div className="bg-[#e6ecf3] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start shadow mb-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
      <div className="flex flex-col items-center min-w-[120px]">
        <FaUserCircle
          className="text-[#5A6A8E] bg-white rounded-full"
          size={72}
        />
        <div className="mt-2 text-gray-700 text-center">
          <div className="font-bold text-lg">{paciente.patient}</div>
          <div className="text-sm">{paciente.idade} anos</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <FaPhone className="text-gray-500" />{" "}
            {editing ? (
              <input
                type="text"
                name="phone"
                className="border-b border-gray-300 px-1 py-0.5 bg-transparent w-28 text-sm focus:outline-none"
                value={form.phone}
                onChange={handleEditChange}
                placeholder="Telefone"
                autoFocus
              />
            ) : (
              paciente.phone
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <FaUserMd className="text-gray-500" /> {paciente.medico}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1">
          <div className="mb-2">
            <span className="font-bold">Futuros agendamentos:</span>
            <ul className="ml-2 mt-1">
              {agendamentos.length > 0 ? (
                agendamentos.map((ag, idx) => (
                  <li key={idx} className="text-sm">
                    <span className="text-blue-500">Consulta</span>
                    {" com "}
                    <span className="font-semibold">{ag.medico}</span>
                    {" dia "}
                    {ag.date} {" às "} {ag.time}
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
              <FaIdCard className="text-gray-500" /> <span>CPF:</span>{" "}
              <span className="font-semibold">{paciente.cpf}</span>
            </span>
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-500" />{" "}
              <span>Endereço:</span>{" "}
              {editing ? (
                <input
                  type="text"
                  name="endereco"
                  className="border-b border-gray-300 px-1 py-0.5 bg-transparent w-40 text-sm focus:outline-none"
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
                className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:outline-none"
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
                className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-900 font-semibold px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 shadow border border-green-300"
                onClick={handleEditSubmit}
                disabled={loading}
                title="Salvar"
              >
                <FaCheck className="text-lg" /> Salvar
              </button>
              <button
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 shadow border border-gray-300"
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
                className="flex items-center gap-1 bg-transparent hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 border border-blue-200"
                onClick={() => setEditing(true)}
                title="Editar"
                disabled={loading}
              >
                <FaEdit className="text-lg" /> Editar
              </button>
              <button
                className="flex items-center gap-1 bg-transparent hover:bg-red-100 text-red-900 font-semibold px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 border border-red-200"
                onClick={handleDelete}
                title="Excluir paciente"
                disabled={loading}
              >
                <FaTrash className="text-lg" /> Excluir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
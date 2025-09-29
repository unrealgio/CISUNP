import React, { useState } from "react";
import { FaUserPlus, FaSave, FaUserMd, FaUsers, FaIdCard, FaPhone, FaHome } from "react-icons/fa";

export default function AddPaciente({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    patient: "",
    cpf: "",
    phone: "",
    medico: "",
    idade: "",
    endereco: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function handleChange(e) {
  let value = e.target.value;
  if (e.target.name === "cpf") {
    value = value.replace(/\D/g, ""); // remove tudo que não for número
  }
  setForm({ ...form, [e.target.name]: value });
}

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setErro("Já existe um paciente com este CPF.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Erro ao cadastrar paciente");
      const paciente = await res.json();
      if (onAdd) onAdd(paciente);
      setForm({
        patient: "",
        cpf: "",
        phone: "",
        medico: "",
        idade: "",
        endereco: "",
        notes: "",
      });
      if (onCancel) onCancel();
    } catch {
      setErro("Erro ao cadastrar paciente. Verifique os dados.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-3xl mx-auto mt-8 animate-fade-in flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-[#045397] flex items-center gap-2">
          <FaUserPlus className="text-[#7A97B6]" /> Adicionar Paciente
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              <FaUsers /> Nome do paciente:
            </label>
            <input
              type="text"
              name="patient"
              value={form.patient}
              onChange={handleChange}
              required
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              <FaIdCard /> CPF:
            </label>
            <input
              type="text"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="CPF"
            />
          </div>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              <FaPhone /> Telefone:
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="Telefone"
            />
          </div>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              <FaUserMd /> Médico responsável:
            </label>
            <input
              type="text"
              name="medico"
              value={form.medico}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="Médico"
            />
          </div>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              <FaUserMd /> Idade:
            </label>
            <input
              type="text"
              name="idade"
              value={form.idade}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="Idade"
            />
          </div>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              <FaHome /> Endereço:
            </label>
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="Endereço"
            />
          </div>
          <div>
            <label className="font-semibold text-[#045397] flex items-center gap-2">
              Observações:
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F9A23B] focus:border-[#F9A23B] outline-none text-black font-medium"
              placeholder="Observações"
              rows={2}
            />
          </div>
          {erro && (
            <div className="text-red-600 text-sm text-center">{erro}</div>
          )}
          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              className="bg-gray-300 text-[#045397] px-4 py-2 rounded font-bold hover:bg-gray-400"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#F9A23B] text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#e68a1a] transition-all duration-200"
              disabled={loading}
            >
              <FaSave /> {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
      <div className="hidden md:flex flex-col justify-center items-center flex-1 bg-[#f9fafb] rounded-xl p-8">
        <img
          src="/img/Unp_Final_Logo.png"
          alt="Logo clínica"
          className="w-40 mb-6"
        />
        <p className="text-[#045397] text-lg font-semibold text-center">
          Preencha todos os dados do paciente para cadastrá-lo na clínica.
        </p>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn .5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
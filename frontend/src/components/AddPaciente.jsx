import { useState } from "react";
import {
  FaUserPlus,
  FaSave,
  FaUserMd,
  FaUsers,
  FaIdCard,
  FaPhone,
  FaHome,
} from "react-icons/fa";
import { apiFetch, mensagemDeErro } from "../api";

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
      value = value.replace(/\D/g, "");
    }
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 409) {
        setErro("Já existe um paciente com este CPF.");
        return;
      }
      if (!res.ok) {
        setErro(
          mensagemDeErro(
            data,
            "Erro ao cadastrar paciente. Verifique os dados.",
          ),
        );
        return;
      }
      if (onAdd) onAdd(data);
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
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cis-panel p-5 md:p-7 max-w-5xl mx-auto mt-6 animate-fade-in flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-(--cis-navy) flex items-center gap-2">
          <FaUserPlus className="text-(--cis-orange)" /> Adicionar Paciente
        </h2>
        <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="cis-label">
              <FaUsers /> Nome do paciente:
            </label>
            <input
              type="text"
              name="patient"
              value={form.patient}
              onChange={handleChange}
              required
              className="cis-input"
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-1">
            <label className="cis-label">
              <FaIdCard /> CPF:
            </label>
            <input
              type="text"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
              maxLength={11}
              inputMode="numeric"
              className="cis-input"
              placeholder="CPF"
            />
          </div>
          <div className="space-y-1">
            <label className="cis-label">
              <FaPhone /> Telefone:
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="cis-input"
              placeholder="Telefone"
            />
          </div>
          <div className="space-y-1">
            <label className="cis-label">
              <FaUserMd /> Médico responsável:
            </label>
            <input
              type="text"
              name="medico"
              value={form.medico}
              onChange={handleChange}
              className="cis-input"
              placeholder="Médico"
            />
          </div>
          <div className="space-y-1">
            <label className="cis-label">
              <FaUserMd /> Idade:
            </label>
            <input
              type="number"
              min={0}
              max={150}
              name="idade"
              value={form.idade}
              onChange={handleChange}
              className="cis-input"
              placeholder="Idade"
            />
          </div>
          <div className="space-y-1">
            <label className="cis-label">
              <FaHome /> Endereço:
            </label>
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="cis-input"
              placeholder="Endereço"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="cis-label">Observações:</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="cis-input"
              placeholder="Observações"
              rows={2}
            />
          </div>
          {erro && (
            <div
              className="md:col-span-2 rounded-lg bg-red-50 border border-red-200 text-(--cis-danger) text-sm px-3 py-2 text-center"
              role="alert"
            >
              {erro}
            </div>
          )}
          <div className="md:col-span-2 flex gap-3 justify-end mt-2">
            <button
              type="button"
              className="cis-secondary-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cis-primary-button flex items-center gap-2"
              disabled={loading}
            >
              <FaSave /> {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
      <div className="hidden md:flex flex-col justify-center items-center w-64 bg-(--cis-blue-soft) rounded-xl p-6">
        <img
          src="/img/Unp_Final_Logo.png"
          alt="Logo clínica"
          className="w-28 mb-5"
        />
        <p className="text-(--cis-navy) text-base font-semibold text-center leading-relaxed">
          Preencha todos os dados do paciente para cadastrá-lo.
        </p>
      </div>
    </div>
  );
}

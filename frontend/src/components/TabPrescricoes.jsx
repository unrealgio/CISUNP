import React, { useState } from "react";
import { FaPills, FaPlus } from "react-icons/fa";
import { apiFetch } from "../api";
import { ErrorMessage } from "./StatusMessage";

export default function TabPrescricoes({
  prescricoes,
  cpf,
  erroCarregamento,
  onAdd,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medicamento: "",
    dose: "",
    frequencia: "",
    observacao: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.medicamento.trim() || loading) return;

    setErro("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/prescricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cpf }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar prescrição.");

      onAdd && onAdd(data);
      setShowForm(false);
      setForm({ medicamento: "", dose: "", frequencia: "", observacao: "" });
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cis-panel p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-[var(--cis-navy)] flex items-center gap-2">
        <FaPills className="text-[var(--cis-orange)]" /> Prescrições
        <button
          className="cis-primary-button ml-auto flex items-center gap-1"
          onClick={() => setShowForm((v) => !v)}
          disabled={loading}
        >
          <FaPlus /> Adicionar
        </button>
      </h2>
      {erroCarregamento && <ErrorMessage>{erroCarregamento}</ErrorMessage>}
      {erro && <ErrorMessage>{erro}</ErrorMessage>}
      {showForm && (
        <form className="mb-4 space-y-2" onSubmit={handleSubmit}>
          <input
            name="medicamento"
            value={form.medicamento}
            onChange={handleChange}
            placeholder="Medicamento"
            className="cis-input"
            required
          />
          <input
            name="dose"
            value={form.dose}
            onChange={handleChange}
            placeholder="Dose"
            className="cis-input"
          />
          <input
            name="frequencia"
            value={form.frequencia}
            onChange={handleChange}
            placeholder="Frequência"
            className="cis-input"
          />
          <input
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            placeholder="Observação"
            className="cis-input"
          />
          <button
            type="submit"
            className="cis-primary-button"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
      {prescricoes.length === 0 ? (
        <p className="text-gray-500">Nenhuma prescrição cadastrada.</p>
      ) : (
        <div className="space-y-4">
          {prescricoes.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-[var(--cis-border)] border-l-4 border-l-[var(--cis-orange)] bg-[var(--cis-orange-soft)] p-4 flex gap-4 items-center"
            >
              <FaPills className="text-[var(--cis-orange)] text-2xl mr-2" />
              <div>
                <p>
                  <strong>Medicamento:</strong> {p.medicamento}
                </p>
                <p>
                  <strong>Dose:</strong> {p.dose}
                </p>
                <p>
                  <strong>Frequência:</strong> {p.frequencia}
                </p>
                <p>
                  <strong>Observação:</strong> {p.observacao}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

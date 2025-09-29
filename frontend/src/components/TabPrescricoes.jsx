import React, { useState } from "react";
import { FaPills, FaPlus } from "react-icons/fa";

export default function TabPrescricoes({ prescricoes, cpf, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medicamento: "",
    dose: "",
    frequencia: "",
    observacao: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.medicamento.trim()) return;
    fetch("http://localhost:3001/api/prescricoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cpf }),
    })
      .then(res => res.json())
      .then(nova => {
        onAdd && onAdd(nova);
        setShowForm(false);
        setForm({ medicamento: "", dose: "", frequencia: "", observacao: "" });
      });
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-[#045397] flex items-center gap-2">
        <FaPills className="text-[#F9A23B]" /> Prescrições
        <button
          className="ml-auto bg-[#F9A23B] text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-[#e68a1a] transition"
          onClick={() => setShowForm(v => !v)}
        >
          <FaPlus /> Adicionar
        </button>
      </h2>
      {showForm && (
        <form className="mb-4 space-y-2" onSubmit={handleSubmit}>
          <input name="medicamento" value={form.medicamento} onChange={handleChange} placeholder="Medicamento" className="border rounded px-2 py-1 w-full" required />
          <input name="dose" value={form.dose} onChange={handleChange} placeholder="Dose" className="border rounded px-2 py-1 w-full" />
          <input name="frequencia" value={form.frequencia} onChange={handleChange} placeholder="Frequência" className="border rounded px-2 py-1 w-full" />
          <input name="observacao" value={form.observacao} onChange={handleChange} placeholder="Observação" className="border rounded px-2 py-1 w-full" />
          <button type="submit" className="bg-[#045397] text-white px-4 py-2 rounded font-bold">Salvar</button>
        </form>
      )}
      {prescricoes.length === 0 ? (
        <p className="text-gray-500">Nenhuma prescrição cadastrada.</p>
      ) : (
        <div className="space-y-4">
          {prescricoes.map(p => (
            <div
              key={p.id}
              className="bg-gradient-to-r from-[#f9fafb] to-[#fef6e4] rounded-lg p-4 border-l-4 border-[#F9A23B] shadow transition hover:scale-[1.02] hover:shadow-lg flex gap-4 items-center"
            >
              <FaPills className="text-[#F9A23B] text-2xl mr-2" />
              <div>
                <p><strong>Medicamento:</strong> {p.medicamento}</p>
                <p><strong>Dose:</strong> {p.dose}</p>
                <p><strong>Frequência:</strong> {p.frequencia}</p>
                <p><strong>Observação:</strong> {p.observacao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
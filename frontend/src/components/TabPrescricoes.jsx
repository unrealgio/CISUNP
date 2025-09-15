import React from "react";
import { FaPills } from "react-icons/fa";

export default function TabPrescricoes({ prescricoes }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-[#045397] flex items-center gap-2">
        <FaPills className="text-[#F9A23B]" /> Prescrições
      </h2>
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
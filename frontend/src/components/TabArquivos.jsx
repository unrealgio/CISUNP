import React, { useState } from "react";
import { FaFileDownload, FaFilePdf, FaFileImage, FaNotesMedical, FaUpload } from "react-icons/fa";

export default function TabArquivos({ arquivos, setArquivos }) {
  const [uploading, setUploading] = useState(false);

  function getFileIcon(tipo) {
    if (tipo === "PDF") return <FaFilePdf className="text-red-500" />;
    if (tipo === "Imagem") return <FaFileImage className="text-blue-400" />;
    return <FaNotesMedical className="text-[#045397]" />;
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    setTimeout(() => {
      const tipo = file.type.includes("pdf")
        ? "PDF"
        : file.type.includes("image")
        ? "Imagem"
        : "Outro";
      const novoArquivo = {
        id: arquivos.length + 1,
        nome: file.name,
        tipo,
        data: new Date().toLocaleDateString(),
      };
      setArquivos([...arquivos, novoArquivo]);
      setUploading(false);
    }, 1000);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-[#045397] flex items-center gap-2">
        <FaFileDownload className="text-[#045397]" /> Arquivos
      </h2>
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer bg-[#F9A23B] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#e68a1a] transition w-fit">
          <FaUpload />
          {uploading ? "Enviando..." : "Enviar novo arquivo"}
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf,image/*"
          />
        </label>
      </div>
      {arquivos.length === 0 ? (
        <p className="text-gray-500">Nenhum arquivo disponível.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {arquivos.map(arq => (
            <div
              key={arq.id}
              className="bg-gradient-to-r from-[#f9fafb] to-[#e3eaf6] rounded-lg p-4 border-l-4 border-[#045397] shadow flex items-center gap-4 transition hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(arq.tipo)}
                <div>
                  <p><strong>Nome:</strong> {arq.nome}</p>
                  <p><strong>Tipo:</strong> {arq.tipo}</p>
                  <p><strong>Data:</strong> {arq.data}</p>
                </div>
              </div>
              <button className="bg-[#F9A23B] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#e68a1a] transition flex items-center gap-2">
                <FaFileDownload /> Baixar
              </button>
            </div>
          ))}
        </div>
      )}
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

import React, { useRef, useState } from "react";
import {
  FaNotesMedical,
  FaCalendarAlt,
  FaUndo,
  FaTrash,
  FaTooth,
  FaUserMd,
  FaPencilAlt,
  FaSmile,
  FaCheckCircle,
} from "react-icons/fa";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function TabProntuario({ prontuario }) {
  const canvasRef = useRef();
  const [saudeBucal, setSaudeBucal] = useState({
    anestesia: "",
    dor: "",
    sangramento: "",
    sangramentoQuando: "",
    bocaSeca: "",
    ranger: "",
    maxilar: "",
    tratamento: "",
    fumante: "",
    escova: "",
    fioDental: "",
  });
  const [antecedentes, setAntecedentes] = useState("");
  const [exame, setExame] = useState({
    higiene: "normal",
    halitose: "ausente",
    tartaro: "ausente",
    gengiva: "normal",
    mucosa: "normal",
    lingua: "",
    palato: "",
    assolaobucal: "",
    labios: "",
  });
  const [alteracoes, setAlteracoes] = useState("");
  const [toast, setToast] = useState(null);

  function handleClearCanvas() {
    canvasRef.current.clearCanvas();
    setToast({ type: "info", message: "Canvas limpo!" });
  }
  function handleUndoCanvas() {
    canvasRef.current.undo();
    setToast({ type: "info", message: "Último traço desfeito!" });
  }

  function handleSaudeBucalChange(e) {
    setSaudeBucal({ ...saudeBucal, [e.target.name]: e.target.value });
  }
  function handleExameChange(e) {
    setExame({ ...exame, [e.target.name]: e.target.value });
  }

  // Toast desaparece após 2s
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-6 animate-fade-in">
      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2
            ${toast.type === "info" ? "bg-[#F9A23B] text-white" : "bg-green-500 text-white"}
            animate-toast`}
        >
          <FaCheckCircle />
          <span>{toast.message}</span>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-[#045397] flex items-center gap-2 animate-slide-in">
        <FaNotesMedical className="text-[#7A97B6]" /> Prontuário Odontológico
      </h2>
      {/* Saúde Bucal */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-[#F9A23B] text-lg flex items-center gap-2">
          <FaSmile /> Saúde Bucal
        </div>
        <div className="grid md:grid-cols-2 gap-4 bg-[#f9fafb] rounded-lg p-4 border shadow">
          <div className="space-y-2">
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaUserMd /> Teve reação com anestesia dental?
              <select
                name="anestesia"
                value={saudeBucal.anestesia}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaTooth /> Sente dor nos dentes ou gengiva?
              <select
                name="dor"
                value={saudeBucal.dor}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaTooth /> Sangramento na gengiva?
              <select
                name="sangramento"
                value={saudeBucal.sangramento}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
              <input
                name="sangramentoQuando"
                value={saudeBucal.sangramentoQuando}
                onChange={handleSaudeBucalChange}
                placeholder="Quando?"
                className="ml-2 rounded border px-2 py-1"
              />
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaSmile /> Sente gosto ruim ou boca seca?
              <select
                name="bocaSeca"
                value={saudeBucal.bocaSeca}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaSmile /> Costuma ranger os dentes?
              <select
                name="ranger"
                value={saudeBucal.ranger}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaSmile /> Dor no maxilar ou ouvido?
              <select
                name="maxilar"
                value={saudeBucal.maxilar}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaUserMd /> Último tratamento dentário:
              <input
                name="tratamento"
                value={saudeBucal.tratamento}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaUserMd /> Fumante?
              <select
                name="fumante"
                value={saudeBucal.fumante}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaTooth /> Escova os dentes quantas vezes ao dia?
              <input
                name="escova"
                value={saudeBucal.escova}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </label>
            <label className="block font-semibold text-[#045397] flex items-center gap-2">
              <FaTooth /> Utiliza fio dental?
              <select
                name="fioDental"
                value={saudeBucal.fioDental}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      {/* Antecedentes Familiares */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-[#F9A23B] text-lg flex items-center gap-2">
          <FaUserMd /> Antecedentes Familiares
        </div>
        <textarea
          className="w-full rounded-lg border p-3"
          rows={2}
          placeholder="Descreva antecedentes familiares relevantes..."
          value={antecedentes}
          onChange={(e) => setAntecedentes(e.target.value)}
        />
      </div>
      {/* Exame Clínico */}
      <div className="mb-6">
        <div className="font-semibold mb-2 text-[#F9A23B] text-lg">
          Exame Clínico
        </div>
        <div className="bg-[#f9fafb] rounded-lg p-4 border shadow mb-4 space-y-2">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="font-semibold text-[#045397]">Higiene:</label>
              <select
                name="higiene"
                value={exame.higiene}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="normal">Normal</option>
                <option value="regular">Regular</option>
                <option value="ruim">Ruim</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#045397]">Halitose:</label>
              <select
                name="halitose"
                value={exame.halitose}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="ausente">Ausente</option>
                <option value="moderada">Moderada</option>
                <option value="forte">Forte</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#045397]">Tártaro:</label>
              <select
                name="tartaro"
                value={exame.tartaro}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="ausente">Ausente</option>
                <option value="pouco">Pouco</option>
                <option value="muito">Muito</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="font-semibold text-[#045397]">Gengiva:</label>
              <select
                name="gengiva"
                value={exame.gengiva}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="normal">Normal</option>
                <option value="gengivite">Gengivite</option>
                <option value="periodontite">Periodontite</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#045397]">Mucosa:</label>
              <select
                name="mucosa"
                value={exame.mucosa}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value="normal">Normal</option>
                <option value="alterada">Alterada</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="font-semibold text-[#045397]">Língua:</label>
              <input
                name="lingua"
                value={exame.lingua}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-[#045397]">Palato:</label>
              <input
                name="palato"
                value={exame.palato}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-[#045397]">
                Assoalho Bucal:
              </label>
              <input
                name="assolaobucal"
                value={exame.assolaobucal}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-[#045397]">Lábios:</label>
              <input
                name="labios"
                value={exame.labios}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Arcada dentária desenhável */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-[#F9A23B] text-lg flex items-center gap-2">
          <FaPencilAlt /> Marque os procedimentos na arcada dentária:
        </div>
        <div className="flex flex-col items-center w-full">
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              height: "700  px",
              borderRadius: "0.75rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              border: "1px solid #e5e7eb",
              marginBottom: "1rem",
              background: "#fff",
              overflow: "hidden",
              display: "grid",
              position: "relative",
            }}
            className="animate-canvas"
          >
            <img
              src="/img/arcada.jpg"
              alt="Arcada Dentária"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                gridArea: "1 / 1 / 2 / 2",
                zIndex: 1,
                pointerEvents: "none",
                transition: "transform 0.3s",
              }}
            />
            <ReactSketchCanvas
              ref={canvasRef}
              width="900px"
              height="350px"
              strokeWidth={3}
              strokeColor="#FF5733"
              canvasColor="transparent"
              style={{
                width: "100%",
                height: "100%",
                gridArea: "1 / 1 / 2 / 2",
                zIndex: 2,
                transition: "box-shadow 0.2s",
              }}
            />
          </div>
          <div className="flex flex-row gap-2">
            <button
              className="bg-[#F9A23B] text-white px-4 py-2 rounded shadow button-animate hover:bg-[#e68a1a] font-semibold flex items-center gap-2"
              onClick={handleUndoCanvas}
              type="button"
            >
              <FaUndo /> Desfazer
            </button>
            <button
              className="bg-[#7A97B6] text-white px-4 py-2 rounded shadow button-animate hover:bg-[#045397] font-semibold flex items-center gap-2"
              onClick={handleClearCanvas}
              type="button"
            >
              <FaTrash /> Limpar
            </button>
          </div>
        </div>
      </div>
      {/* Alterações */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-[#F9A23B] text-lg flex items-center gap-2">
          <FaSmile /> Alterações
        </div>
        <textarea
          className="w-full rounded-lg border p-3"
          rows={5}
          placeholder="Descreva as alterações encontradas..."
          value={alteracoes}
          onChange={(e) => setAlteracoes(e.target.value)}
        />
      </div>
      {/* Registros do Prontuário */}
      <div>
        <div className="font-semibold mb-2 text-[#F9A23B] text-lg flex items-center gap-2">
          <FaCalendarAlt /> Registros do Prontuário:
        </div>
        {prontuario.length === 0 ? (
          <p className="text-gray-500">Nenhum registro de prontuário.</p>
        ) : (
          <div className="space-y-4">
            {prontuario.map((registro) => (
              <div
                key={registro.id}
                className="bg-gradient-to-r from-[#f9fafb] to-[#e3eaf6] rounded-lg p-4 border-l-4 border-[#7A97B6] shadow transition hover:scale-[1.02] hover:shadow-lg flex gap-4 items-center animate-slide-in"
              >
                <FaCalendarAlt className="text-[#7A97B6] text-2xl mr-2" />
                <div>
                  <p>
                    <strong>Data:</strong> {registro.data}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {registro.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn .5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-slide-in {
          animation: slideIn .5s;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px);}
          to { opacity: 1; transform: translateX(0);}
        }
        .button-animate {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .button-animate:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(249,162,59,0.2);
        }
        .animate-canvas {
          animation: fadeInCanvas .7s;
        }
        @keyframes fadeInCanvas {
          from { opacity: 0; transform: scale(0.98);}
          to { opacity: 1; transform: scale(1);}
        }
        .animate-toast {
          animation: toastIn .3s;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
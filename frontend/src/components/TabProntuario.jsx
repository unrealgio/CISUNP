import React, { useRef, useState, useEffect } from "react";
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
  FaDownload,
  FaSave,
} from "react-icons/fa";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useParams } from "react-router-dom";
import { apiFetch, apiUrl } from "../api";
import { dataLocalISO, formatarDataISO } from "../utils/date";

export default function TabProntuario() {
  const canvasRef = useRef();
  const { cpf } = useParams();

  // RESPOSTAS DO QUESTIONÁRIO DE SAÚDE BUCAL
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

  // EXAME CLÍNICO (OS SELECTS JÁ INICIAM COM O VALOR MAIS COMUM)
  const [exame, setExame] = useState({
    higiene: "normal",
    halitose: "ausente",
    tartaro: "ausente",
    gengiva: "normal",
    mucosa: "normal",
    lingua: "",
    palato: "",
    assoalhoBucal: "",
    labios: "",
  });
  const [alteracoes, setAlteracoes] = useState("");

  // ESTADO DA TELA: AVISOS, HISTÓRICO, CARREGAMENTO E ERROS
  const [toast, setToast] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // CARREGA O HISTÓRICO DE PRONTUÁRIOS DO PACIENTE
  useEffect(() => {
    setLoading(true);
    setErro(null);
    apiFetch(`/api/prontuarios?cpf=${encodeURIComponent(cpf)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRegistros(data);
        else setRegistros([]);
      })
      .catch(() => setErro("Erro ao carregar registros do prontuário."))
      .finally(() => setLoading(false));
  }, [cpf]);

  // AÇÕES DO DESENHO NA ARCADA
  function handleClearCanvas() {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      showToast("info", "Canvas limpo!");
    }
  }
  function handleUndoCanvas() {
    if (canvasRef.current) {
      canvasRef.current.undo();
      showToast("info", "Último traço desfeito!");
    }
  }

  // ATUALIZA O CAMPO ALTERADO PELO ATRIBUTO NAME DO INPUT
  function handleSaudeBucalChange(e) {
    setSaudeBucal({ ...saudeBucal, [e.target.name]: e.target.value });
  }
  function handleExameChange(e) {
    setExame({ ...exame, [e.target.name]: e.target.value });
  }

  function showToast(type, message) {
    setToast({ type, message });
  }

  // ESCONDE O AVISO APÓS 2 SEGUNDOS
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ENVIA O PRONTUÁRIO COM O DESENHO EM PNG PARA O BACKEND GERAR O PDF
  async function handleSalvarProntuario() {
    setLoading(true);
    setErro(null);
    let desenho = "";
    try {
      if (canvasRef.current) {
        desenho = await canvasRef.current.exportImage("png");
      }
      const dados = {
        saudeBucal,
        antecedentes,
        exame,
        alteracoes,
        desenho,
      };
      const date = dataLocalISO();
      const time = new Date().toLocaleTimeString("pt-BR").slice(0, 5);

      const res = await apiFetch("/api/prontuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, date, time, dados }),
      });
      if (!res.ok) throw new Error("Erro ao salvar prontuário.");
      const registro = await res.json();
      showToast("success", "Prontuário salvo e PDF gerado!");
      setRegistros((prev) => [registro, ...prev]);
      if (canvasRef.current) canvasRef.current.clearCanvas();
    } catch {
      setErro("Erro ao salvar prontuário.");
      showToast("info", "Erro ao salvar prontuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cis-panel p-6 md:p-8 mt-6 animate-fade-in">
      {/* AVISO FLUTUANTE */}
      {toast && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2
            ${
              toast.type === "info"
                ? "bg-(--cis-unp-orange) text-white"
                : "bg-green-500 text-white"
            }
            animate-toast`}
        >
          <FaCheckCircle />
          <span>{toast.message}</span>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-(--cis-unp-blue) flex items-center gap-2 animate-slide-in">
        <FaNotesMedical className="text-(--cis-unp-steel)" /> Prontuário
        Odontológico
      </h2>
      {erro && (
        <div className="bg-red-50 border border-red-200 text-(--cis-danger) rounded-lg p-4 mb-4 text-center font-semibold">
          {erro}
        </div>
      )}
      {/* SAÚDE BUCAL */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-(--cis-unp-orange) text-lg flex items-center gap-2">
          <FaSmile /> Saúde Bucal
        </div>
        <div className="grid md:grid-cols-2 gap-4 bg-(--cis-soft-gray) rounded-lg p-4 border shadow">
          <div className="space-y-2">
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
              <FaUserMd /> Último tratamento dentário:
              <input
                name="tratamento"
                value={saudeBucal.tratamento}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </label>
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
              <FaTooth /> Escova os dentes quantas vezes ao dia?
              <input
                name="escova"
                value={saudeBucal.escova}
                onChange={handleSaudeBucalChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </label>
            <label className="font-semibold text-(--cis-unp-blue) flex items-center gap-2">
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
      {/* ANTECEDENTES FAMILIARES */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-(--cis-unp-orange) text-lg flex items-center gap-2">
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
      {/* EXAME CLÍNICO */}
      <div className="mb-6">
        <div className="font-semibold mb-2 text-(--cis-unp-orange) text-lg">
          Exame Clínico
        </div>
        <div className="bg-(--cis-soft-gray) rounded-lg p-4 border shadow mb-4 space-y-2">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="font-semibold text-(--cis-unp-blue)">
                Higiene:
              </label>
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
              <label className="font-semibold text-(--cis-unp-blue)">
                Halitose:
              </label>
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
              <label className="font-semibold text-(--cis-unp-blue)">
                Tártaro:
              </label>
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
              <label className="font-semibold text-(--cis-unp-blue)">
                Gengiva:
              </label>
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
              <label className="font-semibold text-(--cis-unp-blue)">
                Mucosa:
              </label>
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
              <label className="font-semibold text-(--cis-unp-blue)">
                Língua:
              </label>
              <input
                name="lingua"
                value={exame.lingua}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-(--cis-unp-blue)">
                Palato:
              </label>
              <input
                name="palato"
                value={exame.palato}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-(--cis-unp-blue)">
                Assoalho Bucal:
              </label>
              <input
                name="assoalhoBucal"
                value={exame.assoalhoBucal}
                onChange={handleExameChange}
                className="ml-2 rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-(--cis-unp-blue)">
                Lábios:
              </label>
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
      {/* DESENHO NA ARCADA DENTÁRIA (900x700, MESMO TAMANHO USADO NO PDF) */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-(--cis-unp-orange) text-lg flex items-center gap-2">
          <FaPencilAlt /> Marque os procedimentos na arcada dentária:
        </div>
        <div className="flex flex-col items-center w-full">
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              height: "700px",
              borderRadius: "0.75rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              border: "1px solid var(--cis-line)",
              marginBottom: "1rem",
              background: "var(--cis-surface)",
              overflow: "hidden",
              display: "grid",
              position: "relative",
            }}
            className="animate-canvas"
          >
            <ReactSketchCanvas
              ref={canvasRef}
              width="900px"
              height="700px"
              backgroundImage="/img/arcada.jpg"
              strokeWidth={3}
              strokeColor="#FF5733"
              canvasColor="transparent"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "0.75rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                border: "1px solid var(--cis-line)",
                marginBottom: "1rem",
                background: "var(--cis-surface)",
                overflow: "hidden",
                display: "block",
              }}
            />
          </div>
          <div className="flex flex-row gap-2">
            <button
              className="bg-(--cis-unp-orange) text-white px-4 py-2 rounded shadow button-animate hover:bg-(--cis-unp-orange-hover) font-semibold flex items-center gap-2"
              onClick={handleUndoCanvas}
              type="button"
            >
              <FaUndo /> Desfazer
            </button>
            <button
              className="bg-(--cis-unp-steel) text-white px-4 py-2 rounded shadow button-animate hover:bg-(--cis-unp-blue) font-semibold flex items-center gap-2"
              onClick={handleClearCanvas}
              type="button"
            >
              <FaTrash /> Limpar
            </button>
          </div>
        </div>
      </div>
      {/* ALTERAÇÕES ENCONTRADAS */}
      <div className="mb-6 animate-fade-in">
        <div className="font-semibold mb-2 text-(--cis-unp-orange) text-lg flex items-center gap-2">
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
      <div className="mb-8 flex justify-end">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
          onClick={handleSalvarProntuario}
          type="button"
          disabled={loading}
        >
          <FaSave /> {loading ? "Salvando..." : "Salvar/Exportar PDF"}
        </button>
      </div>
      {/* HISTÓRICO DE PRONTUÁRIOS COM LINK PARA O PDF */}
      <div>
        <div className="font-semibold mb-2 text-(--cis-unp-orange) text-lg flex items-center gap-2">
          <FaCalendarAlt /> Registros do Prontuário:
        </div>
        {loading ? (
          <p className="text-gray-500">Carregando registros</p>
        ) : registros.length === 0 ? (
          <p className="text-gray-500">Nenhum registro de prontuário.</p>
        ) : (
          <div className="space-y-4">
            {registros.map((registro) => (
              <div
                key={registro.id}
                className="bg-linear-to-r from-(--cis-soft-gray) to-(--cis-soft-blue) rounded-lg p-4 border-l-4 border-(--cis-unp-steel) shadow transition hover:scale-[1.02] hover:shadow-lg flex gap-4 items-center animate-slide-in"
              >
                <FaCalendarAlt className="text-(--cis-unp-steel) text-2xl mr-2" />
                <div>
                  <p>
                    <strong>Data:</strong> {formatarDataISO(registro.date)}
                  </p>
                  <p>
                    <strong>Hora:</strong> {registro.time}
                  </p>
                  <a
                    href={apiUrl(`/uploads/prontuarios/${registro.pdf}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline flex items-center gap-1 mt-2"
                  >
                    <FaDownload /> Baixar PDF do Prontuário
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  FaTooth,
  FaPlus,
  FaCheck,
  FaEdit,
  FaTrash,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import { apiFetch, mensagemDeErro } from "../api";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { ErrorMessage, EstadoVazio, LoadingMessage } from "./StatusMessage";
import { dataLocalISO, formatarDataISO } from "../utils/date";

const SUGESTOES = [
  "Avaliação",
  "Limpeza (profilaxia)",
  "Raspagem",
  "Aplicação de flúor",
  "Restauração",
  "Tratamento de canal",
  "Extração",
  "Selante",
  "Clareamento",
  "Prótese",
  "Radiografia",
];

const formVazio = {
  tipo: "",
  dente: "",
  status: "planejado",
  data: "",
  observacao: "",
};

function formDoProcedimento(p) {
  return {
    tipo: p.tipo,
    dente: p.dente || "",
    status: p.status,
    data: p.data || "",
    observacao: p.observacao || "",
  };
}

export default function TabProcedimentos({
  cpf,
  iniciarComFormulario = false,
  onAlterado,
}) {
  const procedimentos = useBuscarDados(
    `/api/procedimentos?cpf=${encodeURIComponent(cpf)}`,
    "Erro ao carregar procedimentos.",
  );
  const [showForm, setShowForm] = useState(iniciarComFormulario);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const lista = Array.isArray(procedimentos.dados) ? procedimentos.dados : [];
  const planejados = lista.filter((p) => p.status === "planejado");
  const realizados = lista.filter((p) => p.status === "realizado");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function abrirNovo() {
    if (showForm && !editandoId) {
      setShowForm(false);
      return;
    }
    setEditandoId(null);
    setForm(formVazio);
    setErro("");
    setShowForm(true);
  }

  function abrirEdicao(p) {
    setEditandoId(p.id);
    setForm(formDoProcedimento(p));
    setErro("");
    setShowForm(true);
  }

  function fecharFormulario() {
    setShowForm(false);
    setEditandoId(null);
    setForm(formVazio);
  }

  // ENVIA PARA A API (SEM ID CRIA, COM ID ATUALIZA) E RECARREGA A LISTA E O RESUMO
  async function salvar(dados, id) {
    setErro("");
    setSalvando(true);
    try {
      const res = await apiFetch(
        id ? `/api/procedimentos/${id}` : "/api/procedimentos",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...dados, cpf }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(mensagemDeErro(data, "Erro ao salvar procedimento."));
      procedimentos.recarregar();
      onAlterado && onAlterado();
      return true;
    } catch (error) {
      setErro(error.message);
      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.tipo.trim() || salvando) return;
    if (await salvar(form, editandoId)) fecharFormulario();
  }

  function marcarRealizado(p) {
    salvar(
      {
        ...formDoProcedimento(p),
        status: "realizado",
        data: p.data || dataLocalISO(),
      },
      p.id,
    );
  }

  async function excluir(p) {
    if (!window.confirm(`Excluir o procedimento "${p.tipo}"?`)) return;
    setErro("");
    setSalvando(true);
    try {
      const res = await apiFetch(`/api/procedimentos/${p.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(mensagemDeErro(data, "Erro ao excluir procedimento."));
      if (editandoId === p.id) fecharFormulario();
      procedimentos.recarregar();
      onAlterado && onAlterado();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function renderItem(p) {
    const planejado = p.status === "planejado";
    return (
      <li
        key={p.id}
        className={`rounded-lg border border-(--cis-border) border-l-4 p-4 flex gap-4 items-start ${
          planejado
            ? "border-l-(--cis-orange) bg-(--cis-orange-soft)"
            : "border-l-(--cis-blue) bg-(--cis-blue-soft)"
        }`}
      >
        <FaTooth
          className={`text-2xl shrink-0 mt-1 ${
            planejado ? "text-(--cis-orange-text)" : "text-(--cis-blue)"
          }`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 wrap-anywhere">
          <p className="font-semibold text-(--cis-navy)">
            {p.tipo}
            {p.dente && (
              <span className="font-normal text-(--cis-muted)">
                {" "}
                · dente {p.dente}
              </span>
            )}
          </p>
          <p className="text-sm text-(--cis-muted)">
            {p.data
              ? `${planejado ? "Previsto para" : "Realizado em"} ${formatarDataISO(p.data)}`
              : "Sem data prevista"}
          </p>
          {p.observacao && <p className="text-sm mt-1">{p.observacao}</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          {planejado && (
            <button
              type="button"
              className="cis-icon-button cis-icone-confirmar"
              onClick={() => marcarRealizado(p)}
              disabled={salvando}
              title="Marcar como realizado"
              aria-label={`Marcar ${p.tipo} como realizado`}
            >
              <FaCheck />
            </button>
          )}
          <button
            type="button"
            className="cis-icon-button cis-icone-acao"
            onClick={() => abrirEdicao(p)}
            disabled={salvando}
            title="Editar"
            aria-label={`Editar ${p.tipo}`}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="cis-icon-button cis-icone-perigo"
            onClick={() => excluir(p)}
            disabled={salvando}
            title="Excluir"
            aria-label={`Excluir ${p.tipo}`}
          >
            <FaTrash />
          </button>
        </div>
      </li>
    );
  }

  return (
    <div className="cis-panel p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-(--cis-navy) flex items-center gap-2">
        <FaTooth className="text-(--cis-orange-text) shrink-0" /> Procedimentos
        <button
          className="cis-soft-button ml-auto flex items-center gap-1"
          onClick={abrirNovo}
          disabled={salvando}
        >
          <FaPlus /> Adicionar
        </button>
      </h2>
      {procedimentos.erro && <ErrorMessage>{procedimentos.erro}</ErrorMessage>}
      {erro && <ErrorMessage className="mb-4">{erro}</ErrorMessage>}

      {showForm && (
        <form
          className="mb-6 grid gap-3 md:grid-cols-2 rounded-lg border border-(--cis-border) bg-(--cis-background) p-4"
          onSubmit={handleSubmit}
        >
          <h3 className="md:col-span-2 font-semibold text-(--cis-navy)">
            {editandoId ? "Editar procedimento" : "Novo procedimento"}
          </h3>
          <label className="flex flex-col gap-1">
            <span className="cis-rotulo-campo">Procedimento</span>
            <input
              name="tipo"
              list="sugestoes-procedimento"
              value={form.tipo}
              maxLength={120}
              onChange={handleChange}
              placeholder="Ex.: Restauração"
              className="cis-input"
              required
              autoFocus
            />
            <datalist id="sugestoes-procedimento">
              {SUGESTOES.map((sugestao) => (
                <option key={sugestao} value={sugestao} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1">
            <span className="cis-rotulo-campo">Dente (opcional)</span>
            <input
              name="dente"
              value={form.dente}
              maxLength={2}
              inputMode="numeric"
              pattern="[1-4][1-8]|[5-8][1-5]"
              title="Numeração FDI: 11 a 48 (permanentes) ou 51 a 85 (de leite)"
              onChange={handleChange}
              placeholder="Numeração FDI, ex.: 36"
              className="cis-input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="cis-rotulo-campo">Situação</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="cis-input"
            >
              <option value="planejado">Planejado</option>
              <option value="realizado">Realizado</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="cis-rotulo-campo">
              {form.status === "realizado"
                ? "Data"
                : "Data prevista (opcional)"}
            </span>
            <input
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
              className="cis-input"
              required={form.status === "realizado"}
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="cis-rotulo-campo">Observação</span>
            <input
              name="observacao"
              value={form.observacao}
              maxLength={255}
              onChange={handleChange}
              placeholder="Observação"
              className="cis-input"
            />
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="cis-primary-button"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="cis-secondary-button"
              onClick={fecharFormulario}
              disabled={salvando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {procedimentos.carregando && !procedimentos.dados ? (
        <LoadingMessage>Carregando procedimentos</LoadingMessage>
      ) : lista.length === 0 ? (
        <EstadoVazio
          icone={<FaTooth />}
          titulo="Nenhum procedimento registrado."
          dica="Use o botão Adicionar para montar o plano de tratamento."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <section>
            <h3 className="cis-titulo-secao">
              <FaClipboardList /> Plano de tratamento ({planejados.length})
            </h3>
            {planejados.length === 0 ? (
              <EstadoVazio
                compacto
                icone={<FaClipboardList />}
                titulo="Nenhum procedimento planejado."
              />
            ) : (
              <ul className="space-y-3">{planejados.map(renderItem)}</ul>
            )}
          </section>
          <section>
            <h3 className="cis-titulo-secao">
              <FaCheckCircle /> Realizados ({realizados.length})
            </h3>
            {realizados.length === 0 ? (
              <EstadoVazio
                compacto
                icone={<FaCheckCircle />}
                titulo="Nenhum procedimento realizado ainda."
              />
            ) : (
              <ul className="space-y-3">{realizados.map(renderItem)}</ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

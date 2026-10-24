import { useState } from "react";
import { FaFileDownload, FaFilePdf, FaFileImage, FaUpload, FaFolderOpen, FaTrash } from "react-icons/fa";
import { apiFetch, mensagemDeErro } from "../api";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { ErrorMessage, EstadoVazio, LoadingMessage } from "./StatusMessage";
import { formatarDataHora } from "../utils/date";

const CATEGORIAS = {
  exame: { rotulo: "Exame", plural: "Exames" },
  documento: { rotulo: "Documento", plural: "Documentos" },
  outro: { rotulo: "Outro", plural: "Outros" },
};

const TIPOS_PERMITIDOS = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function getFileIcon(tipoMime) {
  if (tipoMime === "application/pdf") return <FaFilePdf className="text-(--cis-danger) text-2xl shrink-0" />;
  return <FaFileImage className="text-(--cis-blue) text-2xl shrink-0" />;
}

export default function TabArquivos({ cpf, categoriaInicial = "exame", onAlterado }) {
  const arquivos = useBuscarDados(`/api/arquivos?cpf=${encodeURIComponent(cpf)}`, "Erro ao carregar arquivos.");
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [filtro, setFiltro] = useState("todos");
  const [enviando, setEnviando] = useState(false);
  const [ocupadoId, setOcupadoId] = useState(null);
  const [erro, setErro] = useState("");

  const lista = Array.isArray(arquivos.dados) ? arquivos.dados : [];
  const filtrados = filtro === "todos" ? lista : lista.filter((a) => a.categoria === filtro);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setErro("");
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setErro("Envie um PDF ou uma imagem (PNG, JPG ou WEBP).");
      return;
    }
    if (file.size > TAMANHO_MAXIMO) {
      setErro("O arquivo deve ter no máximo 10 MB.");
      return;
    }

    setEnviando(true);
    try {
      const parametros = new URLSearchParams({
        cpf,
        categoria,
        nome: file.name,
      });
      const res = await apiFetch(`/api/arquivos?${parametros}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(mensagemDeErro(data, "Erro ao enviar arquivo."));
      arquivos.alterarDados((prev) => [data, ...(prev || [])]);
      onAlterado && onAlterado();
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  async function baixar(arquivo) {
    setErro("");
    setOcupadoId(arquivo.id);
    try {
      const res = await apiFetch(`/api/arquivos/${arquivo.id}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(mensagemDeErro(data, "Erro ao baixar arquivo."));
      }
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = arquivo.nome;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErro(error.message);
    } finally {
      setOcupadoId(null);
    }
  }

  async function excluir(arquivo) {
    if (!window.confirm(`Excluir o arquivo "${arquivo.nome}"?`)) return;
    setErro("");
    setOcupadoId(arquivo.id);
    try {
      const res = await apiFetch(`/api/arquivos/${arquivo.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(mensagemDeErro(data, "Erro ao excluir arquivo."));
      arquivos.alterarDados((prev) => prev.filter((a) => a.id !== arquivo.id));
      onAlterado && onAlterado();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOcupadoId(null);
    }
  }

  return (
    <div className="cis-panel p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-(--cis-navy) flex items-center gap-2">
        <FaFileDownload className="text-(--cis-blue)" /> Arquivos
      </h2>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="cis-rotulo-campo">Categoria do arquivo</span>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="cis-input w-44"
            disabled={enviando}
          >
            {Object.entries(CATEGORIAS).map(([chave, { rotulo }]) => (
              <option key={chave} value={chave}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label
          className={`cis-primary-button flex items-center gap-2 w-fit has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--cis-orange-text) ${
            enviando ? "cursor-wait opacity-60" : "cursor-pointer"
          }`}
        >
          <FaUpload />
          {enviando ? "Enviando..." : "Enviar novo arquivo"}
          <input
            type="file"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={enviando}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
          />
        </label>
        <span className="text-xs text-(--cis-muted)">PDF ou imagem, até 10 MB.</span>
      </div>

      {erro && <ErrorMessage className="mb-4">{erro}</ErrorMessage>}
      {arquivos.erro && <ErrorMessage className="mb-4">{arquivos.erro}</ErrorMessage>}

      {lista.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrar por categoria">
          {["todos", ...Object.keys(CATEGORIAS)].map((chave) => (
            <button
              key={chave}
              type="button"
              className="cis-filtro"
              aria-pressed={filtro === chave}
              onClick={() => setFiltro(chave)}
            >
              {chave === "todos" ? "Todos" : CATEGORIAS[chave].plural} (
              {chave === "todos" ? lista.length : lista.filter((a) => a.categoria === chave).length})
            </button>
          ))}
        </div>
      )}

      {arquivos.carregando && !arquivos.dados ? (
        <LoadingMessage>Carregando arquivos</LoadingMessage>
      ) : filtrados.length === 0 ? (
        <EstadoVazio
          icone={<FaFolderOpen />}
          titulo={lista.length === 0 ? "Nenhum arquivo disponível" : "Nenhum arquivo nesta categoria"}
          dica="Envie exames, radiografias ou documentos do paciente."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtrados.map((arq) => (
            <li
              key={arq.id}
              className="rounded-lg border border-(--cis-border) border-l-4 border-l-(--cis-blue) bg-(--cis-blue-soft) p-4 flex items-center gap-4"
            >
              {getFileIcon(arq.tipoMime)}
              <div className="min-w-0 flex-1 wrap-anywhere">
                <p className="font-semibold text-(--cis-navy)">{arq.nome}</p>
                <p className="text-sm text-(--cis-muted)">
                  {CATEGORIAS[arq.categoria]?.rotulo || arq.categoria} · {formatarTamanho(arq.tamanho)} ·{" "}
                  {formatarDataHora(arq.createdAt)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  className="cis-icon-button cis-icone-acao"
                  onClick={() => baixar(arq)}
                  disabled={ocupadoId === arq.id}
                  title="Baixar"
                  aria-label={`Baixar ${arq.nome}`}
                >
                  <FaFileDownload />
                </button>
                <button
                  type="button"
                  className="cis-icon-button cis-icone-perigo"
                  onClick={() => excluir(arq)}
                  disabled={ocupadoId === arq.id}
                  title="Excluir"
                  aria-label={`Excluir ${arq.nome}`}
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

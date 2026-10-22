import { useId, useRef, useState } from "react";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { formatarCpf } from "../utils/cpf";

// CAMPO DE NOME DO PACIENTE COM SUGESTÕES DOS PACIENTES CADASTRADOS
export default function BuscaPaciente({
  value,
  onChange,
  onSelecionar,
  onKeyDown,
  inputRef,
  autoFocus = false,
}) {
  const [termo, setTermo] = useState("");
  const [aberta, setAberta] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const espera = useRef(null);
  const idLista = useId();

  const termoLimpo = termo.trim();
  const busca = useBuscarDados(
    termoLimpo.length >= 2
      ? `/api/pacientes/busca?q=${encodeURIComponent(termoLimpo)}`
      : null,
    "Erro ao buscar pacientes.",
  );
  const sugestoes = aberta && Array.isArray(busca.dados) ? busca.dados : [];

  // ESPERA A DIGITAÇÃO PARAR ANTES DE BUSCAR, PARA NÃO FAZER UMA REQUISIÇÃO POR TECLA
  function handleChange(e) {
    const texto = e.target.value;
    onChange(texto);
    setAberta(true);
    setAtivo(-1);
    clearTimeout(espera.current);
    espera.current = setTimeout(() => setTermo(texto), 250);
  }

  function escolher(paciente) {
    onSelecionar(paciente);
    setAberta(false);
    setAtivo(-1);
  }

  function handleKeyDown(e) {
    if (sugestoes.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setAtivo((i) => (i + 1) % sugestoes.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setAtivo((i) => (i <= 0 ? sugestoes.length - 1 : i - 1));
        return;
      }
      if (e.key === "Enter" && ativo >= 0) {
        e.preventDefault();
        escolher(sugestoes[ativo]);
        return;
      }
      if (e.key === "Escape") {
        setAberta(false);
        return;
      }
    }
    onKeyDown && onKeyDown(e);
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        className="cis-input"
        placeholder="Nome do paciente"
        value={value}
        maxLength={120}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setAberta(false)}
        autoFocus={autoFocus}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={sugestoes.length > 0}
        aria-controls={idLista}
        aria-activedescendant={ativo >= 0 ? `${idLista}-${ativo}` : undefined}
      />
      {sugestoes.length > 0 && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Pacientes cadastrados"
          className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-(--cis-border) bg-(--cis-surface) text-left shadow-(--cis-shadow)"
        >
          {sugestoes.map((paciente, indice) => (
            <li
              key={paciente.id}
              id={`${idLista}-${indice}`}
              role="option"
              aria-selected={indice === ativo}
              className={`cursor-pointer px-3 py-2 ${
                indice === ativo ? "bg-(--cis-blue-soft)" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(paciente);
              }}
              onMouseEnter={() => setAtivo(indice)}
            >
              <span className="block font-semibold text-(--cis-navy) wrap-anywhere">
                {paciente.patient}
              </span>
              <span className="block text-xs text-(--cis-muted)">
                CPF {formatarCpf(paciente.cpf)}
                {paciente.phone ? ` · ${paciente.phone}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

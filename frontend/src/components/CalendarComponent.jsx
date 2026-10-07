import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { dataLocalISO } from "../utils/date";

function chaveDoMes(date) {
  return dataLocalISO(new Date(date.getFullYear(), date.getMonth(), 1));
}

function dataDaChave(chave) {
  const [ano, mes] = chave.split("-").map(Number);
  return new Date(ano, mes - 1, 1);
}

function nomeDoMes(date) {
  const texto = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function diaDaSemanaCurto(date) {
  return date
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 3);
}

export default function CalendarComponent({
  value,
  onChange,
  atualizacao = 0,
}) {
  const [mesVisivel, setMesVisivel] = useState(() =>
    chaveDoMes(value || new Date()),
  );

  // ACOMPANHA O MÊS DA DATA SELECIONADA
  const mesSelecionado = value ? chaveDoMes(value) : null;
  const [mesSelecionadoAnterior, setMesSelecionadoAnterior] =
    useState(mesSelecionado);
  if (mesSelecionado !== mesSelecionadoAnterior) {
    setMesSelecionadoAnterior(mesSelecionado);
    if (mesSelecionado) setMesVisivel(mesSelecionado);
  }

  // BUSCA OS DIAS COM AGENDAMENTO DO MÊS VISÍVEL
  const primeiroDia = dataDaChave(mesVisivel);
  const ano = primeiroDia.getFullYear();
  const mes = primeiroDia.getMonth();
  const inicio = dataLocalISO(new Date(ano, mes, -6));
  const fim = dataLocalISO(new Date(ano, mes + 1, 14));
  const dias = useBuscarDados(
    `/api/agendamentos/dias?inicio=${inicio}&fim=${fim}`,
    "Erro ao carregar dias com agendamento.",
    atualizacao,
  );
  const diasMarcados = useMemo(
    () => new Set(Array.isArray(dias.dados) ? dias.dados : []),
    [dias.dados],
  );

  function irParaHoje() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    onChange(hoje);
  }

  return (
    <div className="cis-panel overflow-hidden w-full">
      <Calendar
        className="cis-calendar"
        locale="pt-BR"
        value={value}
        onChange={onChange}
        activeStartDate={dataDaChave(mesVisivel)}
        onActiveStartDateChange={({ activeStartDate }) =>
          activeStartDate && setMesVisivel(chaveDoMes(activeStartDate))
        }
        minDetail="month"
        navigationLabel={({ date }) => nomeDoMes(date)}
        formatShortWeekday={(locale, date) => diaDaSemanaCurto(date)}
        nextLabel={<FaChevronRight aria-label="Próximo mês" />}
        prevLabel={<FaChevronLeft aria-label="Mês anterior" />}
        next2Label={null}
        prev2Label={null}
        tileContent={({ date, view }) =>
          view === "month" && diasMarcados.has(dataLocalISO(date)) ? (
            <span className="cis-calendar__marcador" aria-hidden="true" />
          ) : null
        }
      />
      <div className="px-4 py-3 border-t border-(--cis-border) bg-(--cis-background) flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs text-(--cis-muted)">
          <span className="cis-calendar__legenda" aria-hidden="true" />
          Dias com agendamento
        </span>
        <button
          type="button"
          className="cis-secondary-button text-sm"
          onClick={irParaHoje}
          aria-label="Ir para hoje"
        >
          Hoje
        </button>
      </div>
    </div>
  );
}

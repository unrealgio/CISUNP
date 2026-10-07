import { useState, useMemo } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import CalendarComponent from "../components/CalendarComponent";
import List from "../components/List";
import Details from "../components/Details";
import { apiFetch, mensagemDeErro } from "../api";
import { LoadingMessage } from "../components/StatusMessage";
import { dataLocalISO } from "../utils/date";
import { useBuscarDados } from "../hooks/useBuscarDados";

const fixedTimes = [
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [editField, setEditField] = useState("");
  const [agendaError, setAgendaError] = useState("");
  const [saving, setSaving] = useState(false);
  const [versaoAgenda, setVersaoAgenda] = useState(0);

  const agendamentos = useBuscarDados(
    "/api/agendamentos?date=" + dataLocalISO(selectedDate),
    "Erro ao carregar agenda.",
  );
  const loading = agendamentos.carregando;

  // ORGANIZA OS AGENDAMENTOS DO DIA POR HORÁRIO
  const patients = useMemo(() => {
    const map = {};
    (agendamentos.dados || []).forEach((item) => {
      map[item.time] = {
        id: item.id,
        patient: item.patient || "",
        cpf: item.cpf || "",
        phone: item.phone || "",
        notes: item.notes || "",
        medico: item.medico || "",
      };
    });
    return map;
  }, [agendamentos.dados]);

  // MONTA OS DADOS DE UM HORÁRIO DA LISTA A PARTIR DOS AGENDAMENTOS CARREGADOS
  function montarHorario(time) {
    return {
      time,
      id: patients[time]?.id,
      patient: patients[time]?.patient || "",
      cpf: patients[time]?.cpf || "",
      phone: patients[time]?.phone || "",
      notes: patients[time]?.notes || "",
      medico: patients[time]?.medico || "",
      date: selectedDate.toLocaleDateString("pt-BR"),
    };
  }

  const schedules = fixedTimes.map(montarHorario);
  const selectedSchedule =
    schedules.find((item) => item.time === selectedTime) || null;

  function handleChangeDate(date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setEditField("");
  }

  // HORÁRIO COM ID JÁ EXISTE (PUT); SEM ID É UM NOVO AGENDAMENTO (POST)
  // RETORNA TRUE SE SALVOU, PARA O FORMULÁRIO SÓ SER LIMPO EM CASO DE SUCESSO
  async function salvarAgendamento(agendamento, onSuccess) {
    if (!agendamento.patient.trim()) return false;
    if (saving) return false;
    setAgendaError("");
    setSaving(true);
    try {
      const res = await apiFetch(
        agendamento.id
          ? `/api/agendamentos/${agendamento.id}`
          : "/api/agendamentos",
        {
          method: agendamento.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            time: agendamento.time,
            date: dataLocalISO(selectedDate),
            patient: agendamento.patient,
            cpf: agendamento.cpf || "",
            phone: agendamento.phone || "",
            medico: agendamento.medico || "",
            notes: agendamento.notes || "",
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(mensagemDeErro(data, "Erro ao salvar agendamento."));
      agendamentos.recarregar();
      setVersaoAgenda((v) => v + 1);
      onSuccess && onSuccess();
      return true;
    } catch (error) {
      setAgendaError(error.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function handleSavePatient(
    item,
    patientName,
    medicoName = "",
    cpf = "",
    phone = "",
    notes = "",
  ) {
    return salvarAgendamento({
      id: item.id,
      time: item.time,
      patient: patientName,
      medico: medicoName,
      cpf,
      phone,
      notes,
    });
  }

  function handleSaveDetails(updated) {
    return salvarAgendamento(updated, () => setEditField(""));
  }

  function handleDeleteAgendamento(item) {
    if (!item.id) return;
    if (saving) return;
    if (
      !window.confirm(
        `Excluir o agendamento de ${item.patient} às ${item.time}?`,
      )
    )
      return;

    setAgendaError("");
    setSaving(true);
    apiFetch(`/api/agendamentos/${item.id}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Erro ao excluir agendamento.");
        agendamentos.recarregar();
        setVersaoAgenda((v) => v + 1);
        setSelectedTime(null);
        setEditField("");
      })
      .catch((error) => setAgendaError(error.message))
      .finally(() => setSaving(false));
  }

  function handleSelect(item, field = "") {
    setSelectedTime(item.time);
    setEditField(field);
  }

  const erroExibido = agendaError || agendamentos.erro;

  return (
    <>
      <Header />
      <Menu active="agenda" />
      {erroExibido && (
        <div className="mx-6 mt-4 rounded-lg bg-red-100 px-4 py-3 text-center text-red-700">
          {erroExibido}
        </div>
      )}
      {(loading || saving) && (
        <LoadingMessage>
          {loading ? "Carregando" : "Salvando alterações"}
        </LoadingMessage>
      )}
      <div className="flex gap-6 bg-(--cis-background-strong) p-6 rounded-xl">
        <div className="flex-1">
          <List
            schedules={schedules}
            selected={selectedSchedule}
            onSelect={handleSelect}
            currentDate={selectedDate}
            onDelete={handleDeleteAgendamento}
            onSavePatient={handleSavePatient}
          />
        </div>
        <div className="flex flex-col gap-4 w-85">
          <CalendarComponent
            value={selectedDate}
            onChange={handleChangeDate}
            atualizacao={versaoAgenda}
          />
          <Details
            key={`${selectedTime}|${editField}`}
            schedule={selectedSchedule}
            onSave={handleSaveDetails}
            onDelete={handleDeleteAgendamento}
            editField={editField}
            setEditField={setEditField}
          />
        </div>
      </div>
    </>
  );
}

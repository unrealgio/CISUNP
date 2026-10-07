import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import CalendarComponent from "../components/CalendarComponent";
import List from "../components/List";
import Details from "../components/Details";
import { apiFetch, mensagemDeErro } from "../api";
import { LoadingMessage } from "../components/StatusMessage";
import { dataLocalISO } from "../utils/date";

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
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editField, setEditField] = useState("");
  const [patients, setPatients] = useState({});
  const [agendaError, setAgendaError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // INCREMENTAR FAZ O CALENDÁRIO RECARREGAR OS DIAS COM AGENDAMENTO
  const [versaoAgenda, setVersaoAgenda] = useState(0);

  // MONTA OS DADOS DE UM HORÁRIO DA LISTA A PARTIR DOS AGENDAMENTOS CARREGADOS
  const montarHorario = useCallback(
    (time, map) => ({
      time,
      id: map[time]?.id,
      patient: map[time]?.patient || "",
      cpf: map[time]?.cpf || "",
      phone: map[time]?.phone || "",
      notes: map[time]?.notes || "",
      medico: map[time]?.medico || "",
      date: selectedDate.toLocaleDateString("pt-BR"),
    }),
    [selectedDate],
  );

  // manterSelecao: APÓS SALVAR, MANTÉM O HORÁRIO SELECIONADO COM OS DADOS ATUALIZADOS
  const fetchAgendamentos = useCallback(
    ({ manterSelecao = false } = {}) => {
      setAgendaError("");
      setLoading(true);
      apiFetch("/api/agendamentos?date=" + dataLocalISO(selectedDate))
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Erro ao carregar agenda.");

          const map = {};
          data.forEach((item) => {
            map[item.time] = {
              id: item.id,
              patient: item.patient || "",
              cpf: item.cpf || "",
              phone: item.phone || "",
              notes: item.notes || "",
              medico: item.medico || "",
            };
          });
          setPatients(map);
          setSelectedSchedule((atual) =>
            manterSelecao && atual ? montarHorario(atual.time, map) : null,
          );
          setEditField("");
        })
        .catch((error) => setAgendaError(error.message))
        .finally(() => setLoading(false));
    },
    [selectedDate, montarHorario],
  );

  // RECARREGA A AGENDA SEMPRE QUE A DATA SELECIONADA MUDA
  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

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
      fetchAgendamentos({ manterSelecao: true });
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
        fetchAgendamentos();
        setVersaoAgenda((v) => v + 1);
        setSelectedSchedule(null);
        setEditField("");
      })
      .catch((error) => setAgendaError(error.message))
      .finally(() => setSaving(false));
  }

  function handleSelect(item, field = "") {
    setSelectedSchedule(item);
    setEditField(field);
  }

  const schedules = fixedTimes.map((time) => montarHorario(time, patients));

  return (
    <>
      <Header />
      <Menu active="agenda" />
      {agendaError && (
        <div className="mx-6 mt-4 rounded-lg bg-red-100 px-4 py-3 text-center text-red-700">
          {agendaError}
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
            onChange={setSelectedDate}
            atualizacao={versaoAgenda}
          />
          <Details
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

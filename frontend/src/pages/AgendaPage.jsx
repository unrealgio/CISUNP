import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import CalendarComponent from "../components/CalendarComponent";
import List from "../components/List";
import Details from "../components/Details";
import { apiFetch } from "../api";
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

  useEffect(() => {
    fetchAgendamentos();
    // eslint-disable-next-line
  }, [selectedDate]);

  function fetchAgendamentos() {
    setAgendaError("");
    setLoading(true);
    apiFetch("/api/agendamentos?date=" + dataLocalISO(selectedDate))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar agenda.");

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
        setSelectedSchedule(null);
        setEditField("");
      })
      .catch((error) => setAgendaError(error.message))
      .finally(() => setLoading(false));
  }

  // HORÁRIO COM ID JÁ EXISTE (PUT); SEM ID É UM NOVO AGENDAMENTO (POST)
  function salvarAgendamento(agendamento, onSuccess) {
    if (!agendamento.patient.trim()) return;
    if (saving) return;
    setAgendaError("");
    setSaving(true);
    apiFetch(
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
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Erro ao salvar agendamento.");
        fetchAgendamentos();
        onSuccess && onSuccess();
      })
      .catch((error) => setAgendaError(error.message))
      .finally(() => setSaving(false));
  }

  function handleSavePatient(
    item,
    patientName,
    medicoName = "",
    cpf = "",
    phone = "",
    notes = "",
  ) {
    salvarAgendamento({
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
    salvarAgendamento(updated, () => {
      setSelectedSchedule(updated);
      setEditField("");
    });
  }

  function handleDeleteAgendamento(item) {
    if (!item.id) return;
    if (saving) return;

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

  const schedules = fixedTimes.map((time) => ({
    time,
    id: patients[time]?.id,
    patient: patients[time]?.patient || "",
    cpf: patients[time]?.cpf || "",
    phone: patients[time]?.phone || "",
    notes: patients[time]?.notes || "",
    medico: patients[time]?.medico || "",
    date: selectedDate.toLocaleDateString("pt-BR"),
  }));

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
      <div className="flex gap-6 bg-gray-300 p-6 rounded-xl">
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
        <div className="flex flex-col gap-4 w-[340px]">
          <CalendarComponent value={selectedDate} onChange={setSelectedDate} />
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

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import CalendarComponent from "../components/CalendarComponent";
import List from "../components/List";
import Details from "../components/Details";

const fixedTimes = [
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editField, setEditField] = useState(""); // "patient" ou "medico" ou ""
  const [patients, setPatients] = useState({});
  // Removido o estado loading e message

  useEffect(() => {
    fetch("http://localhost:3001/api/agendamentos?date=" + selectedDate.toISOString().slice(0,10))
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(item => {
          map[item.time] = {
            patient: item.patient || "",
            phone: item.phone || "",
            notes: item.notes || "",
            medico: item.medico || ""
          };
        });
        setPatients(map);
        setSelectedSchedule(null);
        setEditField("");
      });
  }, [selectedDate]);

  function handleSavePatient(item, patientName, medicoName = "") {
    if (!patientName.trim()) {
      return;
    }
    fetch("http://localhost:3001/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        time: item.time,
        date: selectedDate.toISOString().slice(0,10),
        patient: patientName,
        phone: patients[item.time]?.phone || "",
        notes: patients[item.time]?.notes || "",
        medico: medicoName || patients[item.time]?.medico || ""
      }),
    })
      .then(res => res.json())
      .then(() => {
        setPatients(prev => ({
          ...prev,
          [item.time]: {
            patient: patientName,
            phone: prev[item.time]?.phone || "",
            notes: prev[item.time]?.notes || "",
            medico: medicoName || prev[item.time]?.medico || ""
          }
        }));
      });
  }

  function handleSaveDetails(updated) {
    if (!updated.patient.trim()) {
      return;
    }
    fetch("http://localhost:3001/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        time: updated.time,
        date: selectedDate.toISOString().slice(0,10),
        patient: updated.patient,
        phone: updated.phone,
        notes: updated.notes,
        medico: updated.medico
      }),
    })
      .then(res => res.json())
      .then(() => {
        setPatients(prev => ({
          ...prev,
          [updated.time]: {
            patient: updated.patient,
            phone: updated.phone,
            notes: updated.notes,
            medico: updated.medico
          }
        }));
        setSelectedSchedule(updated);
        setEditField("");
      });
  }

  function handleDeleteAgendamento(item) {
    fetch("http://localhost:3001/api/agendamentos/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        time: item.time,
        date: selectedDate.toISOString().slice(0,10)
      }),
    })
      .then(res => res.json())
      .then(() => {
        setPatients(prev => ({
          ...prev,
          [item.time]: { patient: "", phone: "", notes: "", medico: "" }
        }));
        if (selectedSchedule && selectedSchedule.time === item.time) {
          setSelectedSchedule(null);
          setEditField("");
        }
      });
  }

  function handleSelect(item, field = "") {
    setSelectedSchedule(item);
    setEditField(field);
  }

  const schedules = fixedTimes.map(time => ({
    time,
    patient: patients[time]?.patient || "",
    phone: patients[time]?.phone || "",
    notes: patients[time]?.notes || "",
    medico: patients[time]?.medico || "",
    date: selectedDate.toLocaleDateString("pt-BR")
  }));

  return (
    <>
      <Header />
      <Menu active="agenda" />
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
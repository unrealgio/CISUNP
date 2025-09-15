import React, { useState } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import CalendarComponent from "../components/CalendarComponent";
import List from "../components/List";
import Details from "../components/Details";

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const schedules = [
    { time: "12:30", patient: "", date: "21/08/2025" },
    { time: "13:00", patient: "", date: "21/08/2025" },
    { time: "13:30", patient: "", date: "21/08/2025" },
    { time: "14:00", patient: "Giovanni Felipe O. Silva", date: "21/08/2025", phone: "(84)99999-8888", notes: "" },
    { time: "14:30", patient: "", date: "21/08/2025" },
    { time: "15:00", patient: "", date: "21/08/2025" },
    { time: "15:30", patient: "", date: "21/08/2025" },
    { time: "16:00", patient: "", date: "21/08/2025" },
    { time: "16:30", patient: "", date: "21/08/2025" },
    { time: "17:00", patient: "", date: "21/08/2025" },
    { time: "17:30", patient: "", date: "21/08/2025" },
    { time: "18:00", patient: "", date: "21/08/2025" },
  ];

  return (
    <>
      <Header />
      <Menu active="agenda" />
      <div className="flex gap-6 bg-gray-300 p-6 rounded-xl">
        <div className="flex-1">
          <List
            schedules={schedules}
            selected={selectedSchedule}
            onSelect={setSelectedSchedule}
            currentDate={selectedDate}
          />
        </div>
        <div className="flex flex-col gap-4 w-[340px]">
          <CalendarComponent value={selectedDate} onChange={setSelectedDate} />
          <Details schedule={selectedSchedule} />
        </div>
      </div>
    </>
  );
}
import React from "react";
import Calendar from "react-calendar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";


//DATAS QUE SERÃO MARCADAS NO CALENDÁRIO, PODE SER PASSADO COMO PROP PARA ALTERAR DINAMICAMENTE
const markedDates = [new Date(2025, 7, 21), new Date(2025, 7, 14)];

export default function CalendarComponent({ value, onChange, marked = markedDates }) {
  const selectedDate =
    value && (Array.isArray(value) ? value[0] : value) instanceof Date
      ? Array.isArray(value)
        ? value[0]
        : value
      : null;

  return (
    <div className="bg-[#7A97B6] rounded-xl p-4 w-full max-w-xs mx-auto shadow">
      <Calendar
        onChange={onChange}
        value={value}
        locale="pt-BR"
        className="!bg-[#7A97B6] !text-white !border-0"
        nextLabel={<FaChevronRight aria-label="Próximo mês" />}
        prevLabel={<FaChevronLeft aria-label="Mês anterior" />}
        next2Label={null}
        prev2Label={null}
        tileContent={({ date }) =>
          marked.some((d) => d.toDateString() === date.toDateString()) ? (
            <div className="flex justify-center mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            </div>
          ) : null
        }
        tileClassName={({ date }) => {
          const isSelected =
            selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return [
            "!bg-[#7A97B6] !text-white",
            isSelected
              ? "!bg-[#F9A23B] !text-white font-bold rounded-full shadow-lg"
              : "",
            isToday && !isSelected
              ? "!bg-[#045397] !text-white font-bold rounded-full"
              : "",
            isWeekend && !isSelected ? "!text-blue-200" : "",
            "transition-all duration-150",
            "hover:!bg-[#F9A23B]/70 hover:!text-white",
          ].join(" ");
        }}
      />
      <div className="flex justify-between mt-2">
        <button
          className="text-xs text-white bg-[#045397] px-3 py-1 rounded hover:bg-[#F9A23B] transition"
          onClick={() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            onChange(today);
          }}
          aria-label="Ir para hoje"
        >
          Hoje
        </button>
        <span className="text-white font-semibold text-sm">
          {selectedDate
            ? selectedDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>
      </div>
      <style>
        {`
          .react-calendar__tile:focus { outline: none; }
          .react-calendar__tile {
            border-radius: 9999px !important;
          }
          .react-calendar__navigation button {
            min-width: 32px;
            min-height: 32px;
            border-radius: 9999px;
            transition: background 0.2s;
          }
          .react-calendar__navigation button:focus,
          .react-calendar__navigation button:hover {
            background: #F9A23B;
            color: #fff;
          }
        `}
      </style>
    </div>
  );
}
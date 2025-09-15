import React from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import ConsultasList from "../components/ConsultasList";

export default function ConsultaPage() {
  return (
    <>
      <Header />
      <Menu active="consultas" />
      <div className="bg-gray-200 min-h-screen">
        <ConsultasList />
      </div>
    </>
  );
}
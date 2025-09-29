import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import PacienteTabs from "../components/PacienteTabs";
import PacienteInfoCard from "../components/PacienteInfoCard";
import PacienteResumoCards from "../components/PacienteResumoCards";
import TabPrescricoes from "../components/TabPrescricoes";
import TabProntuario from "../components/TabProntuario";
import TabArquivos from "../components/TabArquivos";

const resumoPadrao = { consultas: 0, procedimentos: 0, exames: 0, faltas: 0 };

export default function PacientePage() {
  const { cpf } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [paciente, setPaciente] = useState(undefined);
  const [arquivos, setArquivos] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [prontuario, setProntuario] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/pacientes/${encodeURIComponent(cpf)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.patient) {
          // Garante que o campo resumo sempre existe
          setPaciente({ ...data, resumo: data.resumo || resumoPadrao });
          setProntuario([]);
          setArquivos([]);
        } else {
          setPaciente(null);
        }
      })
      .catch(() => {
        setPaciente(null);
      });
  }, [cpf]);

  useEffect(() => {
    fetch(
      `http://localhost:3001/api/prescricoes?cpf=${encodeURIComponent(cpf)}`
    )
      .then((res) => res.json())
      .then(setPrescricoes);
  }, [cpf]);

  function handleAddPrescricao(nova) {
    setPrescricoes((prev) => [...prev, nova]);
  }

  if (paciente === undefined) {
    return (
      <>
        <Header />
        <Menu active="pacientes" />
        <div className="p-6">Carregando...</div>
      </>
    );
  }

  if (paciente === null) {
    return (
      <>
        <Header />
        <Menu active="pacientes" />
        <div className="p-6 text-red-600">Paciente não encontrado!</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Menu active="pacientes" />
      <div className="bg-gradient-to-br from-[#e3eaf6] to-[#f9fafb] min-h-screen px-2 md:px-8 py-6">
        <PacienteTabs active={activeTab} onTabChange={setActiveTab} />
        <div className="mt-4">
          <PacienteInfoCard paciente={paciente} />
          <PacienteResumoCards resumo={paciente.resumo} />
        </div>
        {activeTab === "prescricoes" && (
          <TabPrescricoes
            prescricoes={prescricoes}
            cpf={cpf}
            onAdd={handleAddPrescricao}
          />
        )}
        {activeTab === "prontuario" && (
          <TabProntuario prontuario={prontuario} />
        )}
        {activeTab === "arquivos" && (
          <TabArquivos arquivos={arquivos} setArquivos={setArquivos} />
        )}
      </div>
    </>
  );
}
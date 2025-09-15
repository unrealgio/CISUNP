import React, { useState } from "react";
import Header from "../components/Header";
import Menu from "../components/Menu";
import PacienteTabs from "../components/PacienteTabs";
import PacienteInfoCard from "../components/PacienteInfoCard";
import PacienteResumoCards from "../components/PacienteResumoCards";
import TabPrescricoes from "../components/TabPrescricoes";
import TabProntuario from "../components/TabProntuario";
import TabArquivos from "../components/TabArquivos";

export default function PacientePage() {
  const [activeTab, setActiveTab] = useState("info");
  const [arquivos, setArquivos] = useState([
    { id: 1, nome: "Exame de Sangue.pdf", tipo: "PDF", data: "12/09/2025" },
    { id: 2, nome: "Raio-X.jpg", tipo: "Imagem", data: "18/09/2025" },
  ]);
  const prescricoes = [
    { id: 1, medicamento: "Paracetamol", dose: "500mg", frequencia: "2x ao dia", observacao: "Após refeições" },
    { id: 2, medicamento: "Amoxicilina", dose: "250mg", frequencia: "3x ao dia", observacao: "Por 7 dias" },
  ];
  const prontuario = [
    { id: 1, data: "10/09/2025", descricao: "Restauração no dente 16. Sem complicações." },
    { id: 2, data: "15/09/2025", descricao: "Extração do dente 28. Orientações pós-operatórias fornecidas." },
  ];
  const paciente = {
    nome: "Giovanni Felipe Oliveira da Silva",
    idade: 26,
    telefone: "(84)99882-0265",
    avatar: "",
    observacoes: "Paciente mais sensível à dor! Agendar procedimento com tempo extra.",
    observacoesAutor: "Fulano Flor",
    observacoesData: "20/09/2025 17:21",
    agendamentos: [
      { tipo: "Consulta", profissional: "Fulano Flor", data: "25/09/2025", hora: "15:00" },
      { tipo: "Procedimento", profissional: "Cicrano Arruda", data: "27/09/2025", hora: "16:00" },
    ],
    resumo: {
      consultas: 5,
      procedimentos: 2,
      exames: 3,
      faltas: 0,
    },
  };

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
        {activeTab === "prescricoes" && <TabPrescricoes prescricoes={prescricoes} />}
        {activeTab === "prontuario" && <TabProntuario prontuario={prontuario} />}
        {activeTab === "arquivos" && <TabArquivos arquivos={arquivos} setArquivos={setArquivos} />}
      </div>
    </>
  );
}
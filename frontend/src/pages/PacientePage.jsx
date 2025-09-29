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

export default function PacientePage() {
  const { cpf } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [paciente, setPaciente] = useState(undefined);
  const [arquivos, setArquivos] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [prontuario, setProntuario] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/pacientes?cpf=${encodeURIComponent(cpf)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].patient) {
          const agendamentos = data.map(a => ({
            tipo: "Consulta",
            profissional: a.medico,
            data: a.date,
            hora: a.time,
            observacoes: a.notes,
          }));
          setPaciente({
            nome: data[0].patient,
            cpf: data[0].cpf,
            telefone: data[0].phone,
            idade: 30, // valor fictício, ajuste conforme necessário
            observacoes: data[0].notes || "",
            observacoesAutor: data[0].medico || "Equipe",
            observacoesData: data[0].date || "",
            agendamentos,
            resumo: {
              consultas: agendamentos.length,
              procedimentos: 0,
              exames: 0,
              faltas: 0,
            },
          });
          setProntuario(
            agendamentos.map((a, idx) => ({
              id: idx + 1,
              data: a.data,
              descricao: a.observacoes || "Consulta realizada.",
            }))
          );
          setArquivos([
            { id: 1, nome: "Exame de Sangue.pdf", tipo: "PDF", data: "12/09/2025" },
          ]);
        } else {
          setPaciente(null);
        }
      })
      .catch(() => {
        setPaciente(null);
      });
  }, [cpf]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/prescricoes?cpf=${encodeURIComponent(cpf)}`)
      .then(res => res.json())
      .then(setPrescricoes);
  }, [cpf]);

  function handleAddPrescricao(nova) {
    setPrescricoes(prev => [...prev, nova]);
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
        {activeTab === "prontuario" && <TabProntuario prontuario={prontuario} />}
        {activeTab === "arquivos" && <TabArquivos arquivos={arquivos} setArquivos={setArquivos} />}
      </div>
    </>
  );
}
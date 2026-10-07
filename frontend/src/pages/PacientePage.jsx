import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import PacienteTabs from "../components/PacienteTabs";
import PacienteInfoCard from "../components/PacienteInfoCard";
import PacienteResumoCards from "../components/PacienteResumoCards";
import TabPrescricoes from "../components/TabPrescricoes";
import TabProntuario from "../components/TabProntuario";
import TabArquivos from "../components/TabArquivos";
import { apiFetch } from "../api";
import { ErrorMessage, LoadingMessage } from "../components/StatusMessage";

const resumoPadrao = { consultas: 0, procedimentos: 0, exames: 0, faltas: 0 };

export default function PacientePage() {
  const { cpf } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [paciente, setPaciente] = useState(undefined);
  const [arquivos, setArquivos] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [erro, setErro] = useState("");
  const [erroPrescricoes, setErroPrescricoes] = useState("");
  // INCREMENTAR FORÇA RECARREGAR O PACIENTE (EX.: APÓS EDITAR)
  const [recarregar, setRecarregar] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setArquivos([]);
  }, [cpf]);

  useEffect(() => {
    setErro("");
    apiFetch(`/api/pacientes/${encodeURIComponent(cpf)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 404) return setPaciente(null);
          throw new Error(data.error || "Erro ao carregar paciente.");
        }

        if (data && data.patient) {
          setPaciente({ ...data, resumo: data.resumo || resumoPadrao });
        } else {
          setPaciente(null);
        }
      })
      .catch((error) => {
        setErro(error.message);
        setPaciente(null);
      });
  }, [cpf, recarregar]);

  useEffect(() => {
    setErroPrescricoes("");
    apiFetch(`/api/prescricoes?cpf=${encodeURIComponent(cpf)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data))
          throw new Error(data.error || "Erro ao carregar prescrições.");
        setPrescricoes(data);
      })
      .catch((error) => {
        setPrescricoes([]);
        setErroPrescricoes(error.message);
      });
  }, [cpf]);

  function handleAddPrescricao(nova) {
    setPrescricoes((prev) => [nova, ...prev]);
  }

  if (paciente === undefined) {
    return (
      <>
        <Header />
        <Menu active="pacientes" />
        <LoadingMessage>Carregando paciente</LoadingMessage>
      </>
    );
  }

  if (paciente === null) {
    return (
      <>
        <Header />
        <Menu active="pacientes" />
        <div className="p-6">
          {erro ? (
            <ErrorMessage>{erro}</ErrorMessage>
          ) : (
            "Paciente não encontrado!"
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Menu active="pacientes" />
      <div className="bg-linear-to-br from-(--cis-soft-blue) to-(--cis-soft-gray) min-h-screen px-2 md:px-8 py-6">
        <PacienteTabs active={activeTab} onTabChange={setActiveTab} />
        <div className="mt-4">
          <PacienteInfoCard
            paciente={paciente}
            onPacienteAtualizado={() => setRecarregar((n) => n + 1)}
            onPacienteExcluido={() =>
              navigate("/buscar-paciente", { replace: true })
            }
          />
          <PacienteResumoCards resumo={paciente.resumo} />
        </div>
        {activeTab === "prescricoes" && (
          <TabPrescricoes
            prescricoes={prescricoes}
            cpf={cpf}
            erroCarregamento={erroPrescricoes}
            onAdd={handleAddPrescricao}
          />
        )}
        {activeTab === "prontuario" && <TabProntuario />}
        {activeTab === "arquivos" && (
          <TabArquivos arquivos={arquivos} setArquivos={setArquivos} />
        )}
      </div>
    </>
  );
}

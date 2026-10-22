import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import PacienteTabs from "../components/PacienteTabs";
import PacienteInfoCard from "../components/PacienteInfoCard";
import PacienteResumoCards from "../components/PacienteResumoCards";
import TabPrescricoes from "../components/TabPrescricoes";
import TabProcedimentos from "../components/TabProcedimentos";
import TabProntuario from "../components/TabProntuario";
import TabArquivos from "../components/TabArquivos";
import { useBuscarDados } from "../hooks/useBuscarDados";
import { ErrorMessage, LoadingMessage } from "../components/StatusMessage";

// RECRIA A PÁGINA DO ZERO QUANDO O CPF DA URL MUDA
export default function PacientePage() {
  const { cpf } = useParams();
  return <ConteudoPaciente key={cpf} cpf={cpf} />;
}

function ConteudoPaciente({ cpf }) {
  const [activeTab, setActiveTab] = useState("info");
  const [novoProcedimento, setNovoProcedimento] = useState({
    aberto: false,
    vez: 0,
  });
  const navigate = useNavigate();

  const buscaPaciente = useBuscarDados(
    `/api/pacientes/${encodeURIComponent(cpf)}`,
    "Erro ao carregar paciente.",
  );
  const erro = buscaPaciente.status === 404 ? "" : buscaPaciente.erro;
  const paciente =
    buscaPaciente.carregando && !buscaPaciente.dados
      ? undefined
      : buscaPaciente.dados?.patient
        ? buscaPaciente.dados
        : null;

  const buscaResumo = useBuscarDados(
    `/api/pacientes/${encodeURIComponent(cpf)}/resumo`,
    "Erro ao carregar o resumo do paciente.",
  );

  const buscaPrescricoes = useBuscarDados(
    `/api/prescricoes?cpf=${encodeURIComponent(cpf)}`,
    "Erro ao carregar prescrições.",
  );
  const prescricoes = Array.isArray(buscaPrescricoes.dados)
    ? buscaPrescricoes.dados
    : [];
  const erroPrescricoes = buscaPrescricoes.erro;

  function handleAddPrescricao(nova) {
    buscaPrescricoes.alterarDados((prev) => [nova, ...(prev || [])]);
  }

  function trocarAba(aba) {
    setActiveTab(aba);
    setNovoProcedimento((atual) => ({ ...atual, aberto: false }));
  }

  // BOTÕES DOS CARDS DE RESUMO
  function handleCardAction(card) {
    const consultasDoPaciente = `/consultas?cpf=${encodeURIComponent(cpf)}`;
    if (card === "consultas") navigate(consultasDoPaciente);
    if (card === "faltas") navigate(`${consultasDoPaciente}&status=faltou`);
    if (card === "exames") trocarAba("arquivos");
    if (card === "procedimentos") {
      setActiveTab("procedimentos");
      setNovoProcedimento((atual) => ({ aberto: true, vez: atual.vez + 1 }));
    }
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
        <PacienteTabs active={activeTab} onTabChange={trocarAba} />
        <div className="mt-4">
          <PacienteInfoCard
            paciente={paciente}
            onPacienteAtualizado={buscaPaciente.recarregar}
            onPacienteExcluido={() =>
              navigate("/buscar-paciente", { replace: true })
            }
          />
          {buscaResumo.erro && (
            <ErrorMessage compacto className="mb-2">
              {buscaResumo.erro}
            </ErrorMessage>
          )}
          <PacienteResumoCards
            resumo={buscaResumo.dados}
            onAction={handleCardAction}
          />
        </div>
        {activeTab === "prescricoes" && (
          <TabPrescricoes
            prescricoes={prescricoes}
            cpf={cpf}
            erroCarregamento={erroPrescricoes}
            onAdd={handleAddPrescricao}
          />
        )}
        {activeTab === "procedimentos" && (
          <TabProcedimentos
            key={novoProcedimento.vez}
            cpf={cpf}
            iniciarComFormulario={novoProcedimento.aberto}
            onAlterado={buscaResumo.recarregar}
          />
        )}
        {activeTab === "prontuario" && <TabProntuario cpf={cpf} />}
        {activeTab === "arquivos" && (
          <TabArquivos cpf={cpf} onAlterado={buscaResumo.recarregar} />
        )}
      </div>
    </>
  );
}

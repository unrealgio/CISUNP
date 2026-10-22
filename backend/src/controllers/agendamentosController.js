const Agendamentos = require("../models/Agendamentos");
const Paciente = require("../models/Paciente");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");
const { hojeLocal } = require("../utils/datas");

const naoCancelado = { [Op.ne]: "cancelada" };

// TRAZ O PACIENTE JUNTO (MESMO SE EXCLUÍDO, PARA O HISTÓRICO CONTINUAR COM NOME)
const incluirPaciente = {
  model: Paciente,
  as: "paciente",
  paranoid: false,
  attributes: ["patient", "cpf", "phone", "idade"],
};

// RESPONDE NO FORMATO DE SEMPRE: NOME, CPF E TELEFONE VÊM DO CADASTRO OU DO PRÓPRIO AGENDAMENTO (AVULSO)
function comDadosDoPaciente(agendamento) {
  const { paciente, ...dados } = agendamento.toJSON();
  if (!paciente) return { ...dados, cpf: null, idade: null };
  return {
    ...dados,
    patient: paciente.patient,
    cpf: paciente.cpf,
    phone: paciente.phone,
    idade: paciente.idade,
  };
}

// LISTA OS AGENDAMENTOS POR DATA
exports.buscarPorData = async (req, res) => {
  const { date } = req.query;
  try {
    const agendamentos = await Agendamentos.findAll({
      where: { date, status: naoCancelado },
      include: [incluirPaciente],
      order: [["time", "ASC"]],
    });
    res.json(agendamentos.map(comDadosDoPaciente));
  } catch (err) {
    console.error("Erro ao listar agendamentos:", err);
    res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
};

// LISTA OS DIAS DE UM INTERVALO QUE POSSUEM AGENDAMENTOS (USADO NO CALENDÁRIO)
exports.diasComAgendamento = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const dias = await Agendamentos.findAll({
      attributes: ["date"],
      where: { date: { [Op.between]: [inicio, fim] }, status: naoCancelado },
      group: ["date"],
      raw: true,
    });
    res.json(dias.map((dia) => dia.date));
  } catch (err) {
    console.error("Erro ao listar dias com agendamentos:", err);
    res.status(500).json({ error: "Erro ao listar dias com agendamentos." });
  }
};

// COM CPF: CRIA O PACIENTE OU ATUALIZA NOME E TELEFONE (O MÉDICO SÓ PREENCHE SE ESTIVER VAZIO)
// SEM CPF: AGENDAMENTO AVULSO, SEM CADASTRO
async function sincronizarPaciente(
  { cpf, patient, phone, medico },
  transaction,
) {
  if (!cpf) return null;
  const nome = patient.trim();
  const [paciente, created] = await Paciente.findOrCreate({
    where: { cpf },
    defaults: { patient: nome, cpf, phone: phone || null, medico },
    paranoid: false,
    transaction,
  });
  if (created) return paciente;
  if (paciente.deletedAt) await paciente.restore({ transaction });

  const alteracoes = { patient: nome };
  if (phone) alteracoes.phone = phone;
  if (!paciente.medico && medico) alteracoes.medico = medico;
  await paciente.update(alteracoes, { transaction });
  return paciente;
}

// NOME E TELEFONE SÓ FICAM NO AGENDAMENTO QUANDO NÃO HÁ PACIENTE CADASTRADO
function camposDoAgendamento(body, paciente) {
  const { time, date, patient, phone, notes, medico } = body;
  return {
    time,
    date,
    notes,
    medico,
    pacienteId: paciente ? paciente.id : null,
    patient: paciente ? null : patient.trim(),
    phone: paciente ? null : phone || null,
  };
}

// DESFAZ A TRANSAÇÃO E RESPONDE COM O ERRO ADEQUADO
async function responderErroAoSalvar(res, transaction, err) {
  if (transaction && !transaction.finished) await transaction.rollback();
  if (err.name === "SequelizeUniqueConstraintError") {
    return res
      .status(409)
      .json({ error: "Já existe um agendamento neste horário." });
  }
  console.error("Erro ao salvar agendamento:", err);
  res.status(500).json({ error: "Erro ao salvar agendamento." });
}

// CRIA UM AGENDAMENTO
exports.criar = async (req, res) => {
  const { time, date } = req.body;
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const ocupado = await Agendamentos.findOne({
      where: { date, time, status: naoCancelado },
      transaction,
    });
    if (ocupado) {
      await transaction.rollback();
      return res
        .status(409)
        .json({ error: "Já existe um agendamento neste horário." });
    }

    const paciente = await sincronizarPaciente(req.body, transaction);
    const agendamento = await Agendamentos.create(
      camposDoAgendamento(req.body, paciente),
      { transaction },
    );
    await transaction.commit();
    await agendamento.reload({ include: [incluirPaciente] });
    res.status(201).json(comDadosDoPaciente(agendamento));
  } catch (err) {
    await responderErroAoSalvar(res, transaction, err);
  }
};

// ATUALIZA UM AGENDAMENTO
exports.atualizar = async (req, res) => {
  const { id } = req.params;
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const agendamento = await Agendamentos.findByPk(id, { transaction });
    if (!agendamento) {
      await transaction.rollback();
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    const paciente = await sincronizarPaciente(req.body, transaction);
    await agendamento.update(camposDoAgendamento(req.body, paciente), {
      transaction,
    });
    await transaction.commit();
    await agendamento.reload({ include: [incluirPaciente] });
    res.json(comDadosDoPaciente(agendamento));
  } catch (err) {
    await responderErroAoSalvar(res, transaction, err);
  }
};

// LISTA TODOS OS AGENDAMENTOS (PÁGINA CONSULTAS), INCLUSIVE OS CANCELADOS
exports.listarTodos = async (req, res) => {
  try {
    const agendamentos = await Agendamentos.findAll({
      include: [incluirPaciente],
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });
    res.json(agendamentos.map(comDadosDoPaciente));
  } catch (err) {
    console.error("Erro ao listar consultas:", err);
    res.status(500).json({ error: "Erro ao listar consultas." });
  }
};

// ALTERA O STATUS DE UM AGENDAMENTO
exports.atualizarStatus = async (req, res) => {
  try {
    const agendamento = await Agendamentos.findByPk(req.params.id, {
      include: [incluirPaciente],
    });
    if (!agendamento) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }
    await agendamento.update({ status: req.body.status });
    res.json(comDadosDoPaciente(agendamento));
  } catch (err) {
    await responderErroAoSalvar(res, null, err);
  }
};

// EXCLUI UM AGENDAMENTO
exports.excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Agendamentos.destroy({ where: { id } });
    if (!deleted)
      return res.status(404).json({ error: "Agendamento não encontrado." });
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir agendamento:", err);
    res.status(500).json({ error: "Erro ao excluir agendamento." });
  }
};

// LISTA OS AGENDAMENTOS FUTUROS
exports.futurosPorPaciente = async (req, res) => {
  try {
    const agendamentos = await Agendamentos.findAll({
      where: {
        pacienteId: req.paciente.id,
        date: { [Op.gte]: hojeLocal() },
        status: naoCancelado,
      },
      include: [incluirPaciente],
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });
    res.json(agendamentos.map(comDadosDoPaciente));
  } catch (err) {
    console.error("Erro ao buscar agendamentos futuros:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos futuros." });
  }
};

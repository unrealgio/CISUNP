const { Op } = require("sequelize");
const Paciente = require("../models/Paciente");
const Agendamentos = require("../models/Agendamentos");
const Procedimento = require("../models/Procedimento");
const Arquivo = require("../models/Arquivo");
const sequelize = require("../../config/database");
const { hojeLocal } = require("../utils/datas");

// LISTA TODOS OS PACIENTES
exports.listarTodos = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({ order: [["patient", "ASC"]] });
    res.json(pacientes);
  } catch (err) {
    console.error("Erro ao listar pacientes:", err);
    res.status(500).json({ error: "Erro ao listar pacientes." });
  }
};

// SUGESTÕES PARA O CAMPO DE PACIENTE DA AGENDA: PARTE DO NOME OU INÍCIO DO CPF
exports.buscar = async (req, res) => {
  const termo = req.query.q.trim();
  const apenasNumeros = termo.replace(/\D/g, "");
  const termoLiteral = termo.replace(/[\\%_]/g, "\\$&");
  const condicoes = [{ patient: { [Op.iLike]: `%${termoLiteral}%` } }];
  if (apenasNumeros.length >= 2) {
    condicoes.push({ cpf: { [Op.startsWith]: apenasNumeros } });
  }
  try {
    const pacientes = await Paciente.findAll({
      where: { [Op.or]: condicoes },
      attributes: ["id", "patient", "cpf", "phone", "medico"],
      order: [["patient", "ASC"]],
      limit: 8,
    });
    res.json(pacientes);
  } catch (err) {
    console.error("Erro ao buscar pacientes:", err);
    res.status(500).json({ error: "Erro ao buscar pacientes." });
  }
};

// FAZ A BUSCA DE UM PACIENTE PELO CPF
exports.buscarPorCpf = async (req, res) => {
  const { cpf } = req.params;
  try {
    const paciente = await Paciente.findOne({ where: { cpf } });
    if (!paciente)
      return res.status(404).json({ error: "Paciente não encontrado." });
    res.json(paciente);
  } catch (err) {
    console.error("Erro ao buscar paciente:", err);
    res.status(500).json({ error: "Erro ao buscar paciente." });
  }
};

// NÚMEROS DOS CARDS DE RESUMO DA FICHA DO PACIENTE
exports.resumo = async (req, res) => {
  const { cpf } = req.params;
  try {
    const paciente = await Paciente.findOne({ where: { cpf } });
    if (!paciente)
      return res.status(404).json({ error: "Paciente não encontrado." });

    const pacienteId = paciente.id;
    const [
      consultas,
      faltas,
      cancelamentos,
      procedimentos,
      procedimentosPlanejados,
      exames,
    ] = await Promise.all([
      Agendamentos.count({ where: { pacienteId, status: "realizada" } }),
      Agendamentos.count({ where: { pacienteId, status: "faltou" } }),
      Agendamentos.count({ where: { pacienteId, status: "cancelada" } }),
      Procedimento.count({ where: { pacienteId, status: "realizado" } }),
      Procedimento.count({ where: { pacienteId, status: "planejado" } }),
      Arquivo.count({ where: { pacienteId, categoria: "exame" } }),
    ]);
    res.json({
      consultas,
      faltas,
      cancelamentos,
      procedimentos,
      procedimentosPlanejados,
      exames,
    });
  } catch (err) {
    console.error("Erro ao montar o resumo do paciente:", err);
    res.status(500).json({ error: "Erro ao carregar o resumo do paciente." });
  }
};

// EXTRAI OS CAMPOS EDITÁVEIS DO PACIENTE A PARTIR DO CORPO DA REQUISIÇÃO
function camposDoPaciente(body) {
  const { patient, phone, medico, endereco, notes } = body;
  // IDADE VAZIA VIRA NULL, PQ O POSTGRES NÃO ACEITA CAMPO VAZIO
  const idade =
    body.idade === "" || body.idade == null ? null : Number(body.idade);
  return { patient: patient.trim(), phone, medico, idade, endereco, notes };
}

// CRIA UM PACIENTE (O CPF NÃO PODE ESTAR CADASTRADO; SE O PACIENTE FOI EXCLUÍDO, ELE É REATIVADO)
exports.criar = async (req, res) => {
  try {
    const existente = await Paciente.findOne({
      where: { cpf: req.body.cpf },
      paranoid: false,
    });
    if (existente?.deletedAt) {
      await existente.restore();
      await existente.update(camposDoPaciente(req.body));
      return res.status(201).json(existente);
    }

    const paciente = await Paciente.create({
      cpf: req.body.cpf,
      ...camposDoPaciente(req.body),
    });
    res.status(201).json(paciente);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: "Já existe um paciente com este CPF." });
    }
    console.error("Erro ao salvar paciente:", err);
    res.status(500).json({ error: "Erro ao salvar paciente." });
  }
};

// EXCLUI UM PACIENTE E CANCELA OS AGENDAMENTOS FUTUROS DELE
exports.excluir = async (req, res) => {
  const { cpf } = req.params;
  const transaction = await sequelize.transaction();
  try {
    const paciente = await Paciente.findOne({ where: { cpf }, transaction });
    if (!paciente) {
      await transaction.rollback();
      return res.status(404).json({ error: "Paciente não encontrado." });
    }
    await paciente.destroy({ transaction });
    await Agendamentos.update(
      { status: "cancelada" },
      {
        where: {
          pacienteId: paciente.id,
          date: { [Op.gte]: hojeLocal() },
          status: { [Op.in]: ["pendente", "confirmada"] },
        },
        transaction,
      },
    );
    await transaction.commit();
    res.json({ success: true });
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Erro ao excluir paciente:", err);
    res.status(500).json({ error: "Erro ao excluir paciente." });
  }
};

// ATUALIZA OS DADOS DE UM PACIENTE (CPF NÃO PODE SER ALTERADO)
exports.atualizar = async (req, res) => {
  const { cpf } = req.params;
  try {
    const paciente = await Paciente.findOne({ where: { cpf } });
    if (!paciente)
      return res.status(404).json({ error: "Paciente não encontrado." });
    await paciente.update(camposDoPaciente(req.body));
    res.json(paciente);
  } catch (err) {
    console.error("Erro ao atualizar paciente:", err);
    res.status(500).json({ error: "Erro ao atualizar paciente." });
  }
};

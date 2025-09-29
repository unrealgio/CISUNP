const Paciente = require("../models/Paciente");

// LISTA TODOS OS PACIENTES
exports.listarTodos = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({ order: [["patient", "ASC"]] });
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar pacientes." });
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
    res.status(500).json({ error: "Erro ao buscar paciente." });
  }
};

// CRIA OU ATUALIZA UM PACIENTE
exports.criarOuAtualizar = async (req, res) => {
  const { patient, cpf, phone, medico, idade, endereco, notes } = req.body;
  if (!patient || !cpf)
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  try {
    const [paciente, created] = await Paciente.findOrCreate({
      where: { cpf },
      defaults: { patient, phone, medico, idade, endereco, notes },
    });
    if (!created) {
      await paciente.update({ patient, phone, medico, idade, endereco, notes });
    }
    res.json(paciente);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: "Já existe um paciente com este CPF." });
    }
    res.status(500).json({ error: "Erro ao salvar paciente." });
  }
};

// EXCLUI UM PACIENTE PELO CPF
exports.excluir = async (req, res) => {
  const { cpf } = req.params;
  try {
    await Paciente.destroy({ where: { cpf } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir paciente." });
  }
};

// ATUALIZA INFORMAÇÕES ESPECÍFICAS DE UM PACIENTE
exports.atualizar = async (req, res) => {
  const { cpf } = req.params;
  const { endereco, notes, phone } = req.body;
  try {
    const paciente = await Paciente.findOne({ where: { cpf } });
    if (!paciente)
      return res.status(404).json({ error: "Paciente não encontrado." });
    await paciente.update({ endereco, notes, phone });
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar paciente." });
  }
};

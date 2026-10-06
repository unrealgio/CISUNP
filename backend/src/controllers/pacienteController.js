const Paciente = require("../models/Paciente");

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

// EXTRAI OS CAMPOS EDITÁVEIS DO PACIENTE A PARTIR DO CORPO DA REQUISIÇÃO
function camposDoPaciente(body) {
  const { patient, phone, medico, endereco, notes } = body;
  // IDADE VAZIA VIRA NULL, PQ O POSTGRES NÃO ACEITA CAMPO VAZIO
  const idade =
    body.idade === "" || body.idade == null ? null : Number(body.idade);
  return { patient: patient.trim(), phone, medico, idade, endereco, notes };
}

// CRIA UM PACIENTE (O CPF NÃO PODE ESTAR CADASTRADO)
exports.criar = async (req, res) => {
  try {
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

// EXCLUI UM PACIENTE
exports.excluir = async (req, res) => {
  const { cpf } = req.params;
  try {
    await Paciente.destroy({ where: { cpf } });
    res.json({ success: true });
  } catch (err) {
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

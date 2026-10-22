const Paciente = require("../models/Paciente");

// TROCA O CPF RECEBIDO PELO PACIENTE CADASTRADO
async function carregarPaciente(req, res, next) {
  const cpf = req.query.cpf || req.body?.cpf;
  try {
    const paciente = await Paciente.findOne({ where: { cpf } });
    if (!paciente) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }
    req.paciente = paciente;
    next();
  } catch (err) {
    console.error("Erro ao buscar paciente:", err);
    res.status(500).json({ error: "Erro ao buscar paciente." });
  }
}

module.exports = { carregarPaciente };

const Procedimento = require("../models/Procedimento");

function camposDoProcedimento(req) {
  const { tipo, dente, data, status, observacao } = req.body;
  return {
    pacienteId: req.paciente.id,
    tipo: tipo.trim(),
    dente: dente || null,
    data: data || null,
    status,
    observacao,
  };
}

// LISTA OS PROCEDIMENTOS DE UM PACIENTE (PLANEJADOS PRIMEIRO, DEPOIS OS MAIS RECENTES)
exports.listarPorCpf = async (req, res) => {
  try {
    const lista = await Procedimento.findAll({
      where: { pacienteId: req.paciente.id },
      order: [
        ["status", "ASC"],
        ["data", "DESC NULLS LAST"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar procedimentos:", err);
    res.status(500).json({ error: "Erro ao listar procedimentos." });
  }
};

// ADICIONA UM PROCEDIMENTO
exports.adicionar = async (req, res) => {
  try {
    const procedimento = await Procedimento.create(camposDoProcedimento(req));
    res.status(201).json(procedimento);
  } catch (err) {
    console.error("Erro ao adicionar procedimento:", err);
    res.status(500).json({ error: "Erro ao adicionar procedimento." });
  }
};

// ATUALIZA UM PROCEDIMENTO
exports.atualizar = async (req, res) => {
  try {
    const procedimento = await Procedimento.findByPk(req.params.id);
    if (!procedimento) {
      return res.status(404).json({ error: "Procedimento não encontrado." });
    }
    await procedimento.update(camposDoProcedimento(req));
    res.json(procedimento);
  } catch (err) {
    console.error("Erro ao atualizar procedimento:", err);
    res.status(500).json({ error: "Erro ao atualizar procedimento." });
  }
};

// EXCLUI UM PROCEDIMENTO
exports.excluir = async (req, res) => {
  try {
    const deleted = await Procedimento.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ error: "Procedimento não encontrado." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir procedimento:", err);
    res.status(500).json({ error: "Erro ao excluir procedimento." });
  }
};

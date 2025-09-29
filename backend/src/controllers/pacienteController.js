const { sequelize } = require("../models/Agendamentos");

exports.buscarPorCpf = async (req, res) => {
  const { cpf } = req.query;
  try {
    let query = `
      SELECT patient, cpf, phone, medico, notes, date, time
      FROM "Agendamentos"
      WHERE TRIM(cpf) = '${cpf}'
      ORDER BY date DESC, time DESC
    `;
    const [results] = await sequelize.query(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar paciente." });
  }
};

exports.listarTodos = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT DISTINCT patient, cpf, phone, medico
      FROM "Agendamentos"
      WHERE patient IS NOT NULL AND patient <> ''
      ORDER BY patient
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pacientes." });
  }
};
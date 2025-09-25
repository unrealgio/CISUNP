const express = require("express");
const router = express.Router();
const Agendamentos = require("../models/Agendamentos");

// Buscar agendamentos por data
router.get("/", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Data obrigatória" });
  const lista = await Agendamentos.findAll({ where: { date } });
  res.json(lista);
});

// Criar ou atualizar paciente em um horário/data
router.post("/", async (req, res) => {
  const { time, date, patient, phone, notes, medico } = req.body;
  if (!time || !date) return res.status(400).json({ error: "Horário e data obrigatórios" });

  let agendamento = await Agendamentos.findOne({ where: { time, date } });
  if (agendamento) {
    agendamento.patient = patient;
    agendamento.phone = phone;
    agendamento.notes = notes;
    agendamento.medico = medico;
    await agendamento.save();
    return res.json(agendamento);
  } else {
    agendamento = await Agendamentos.create({ time, date, patient, phone, notes, medico });
    return res.json(agendamento);
  }
});

// Excluir agendamento (limpar dados) via POST
router.post("/delete", async (req, res) => {
  const { time, date } = req.body;
  const agendamento = await Agendamentos.findOne({ where: { time, date } });
  if (!agendamento) return res.status(404).json({ error: "Horário não encontrado" });
  agendamento.patient = "";
  agendamento.phone = "";
  agendamento.notes = "";
  agendamento.medico = "";
  await agendamento.save();
  res.json({ success: true });
});

module.exports = router;
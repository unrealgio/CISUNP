const express = require("express");
const router = express.Router();
const prescricaoController = require("../controllers/prescricaoController");
const { authenticateToken } = require("../middleware/middleware");
const { carregarPaciente } = require("../middleware/paciente");
const {
  validateCpfQuery,
  validatePrescricaoBody,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get(
  "/",
  validateCpfQuery,
  carregarPaciente,
  prescricaoController.listarPorCpf,
);
router.post(
  "/",
  validatePrescricaoBody,
  carregarPaciente,
  prescricaoController.adicionar,
);

module.exports = router;

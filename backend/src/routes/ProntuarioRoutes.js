const express = require("express");
const router = express.Router();
const prontuarioController = require("../controllers/prontuarioController");
const { authenticateToken } = require("../middleware/middleware");
const { carregarPaciente } = require("../middleware/paciente");
const {
  validateCpfQuery,
  validateProntuarioBody,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get(
  "/",
  validateCpfQuery,
  carregarPaciente,
  prontuarioController.listarPorCpf,
);
router.post(
  "/",
  validateProntuarioBody,
  carregarPaciente,
  prontuarioController.adicionar,
);

module.exports = router;

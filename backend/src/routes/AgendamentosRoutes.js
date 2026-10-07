const express = require("express");
const router = express.Router();
const agendamentosController = require("../controllers/agendamentosController");
const authenticateToken = require("../middleware/middleware");
const {
  validateAgendamentoQuery,
  validateIntervaloQuery,
  validateAgendamentoBody,
  validateCpfQuery,
  validateIdParam,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get("/", validateAgendamentoQuery, agendamentosController.buscarPorData);
router.get(
  "/dias",
  validateIntervaloQuery,
  agendamentosController.diasComAgendamento,
);
router.post("/", validateAgendamentoBody, agendamentosController.criar);
router.put(
  "/:id",
  validateIdParam,
  validateAgendamentoBody,
  agendamentosController.atualizar,
);
router.delete("/:id", validateIdParam, agendamentosController.excluir);
router.get(
  "/futuros",
  validateCpfQuery,
  agendamentosController.futurosPorPaciente,
);

module.exports = router;

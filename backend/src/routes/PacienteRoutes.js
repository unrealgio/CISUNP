const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/pacienteController");
const authenticateToken = require("../middleware/middleware");
const {
  validateCpfParam,
  validatePacienteBody,
  validatePacienteUpdate,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get("/todos", pacienteController.listarTodos);
router.get("/:cpf", validateCpfParam, pacienteController.buscarPorCpf);
router.post("/", validatePacienteBody, pacienteController.criar);
router.delete("/:cpf", validateCpfParam, pacienteController.excluir);
router.put("/:cpf", validatePacienteUpdate, pacienteController.atualizar);

module.exports = router;

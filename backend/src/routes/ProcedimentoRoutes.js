const express = require("express");
const router = express.Router();
const procedimentoController = require("../controllers/procedimentoController");
const { authenticateToken } = require("../middleware/middleware");
const { carregarPaciente } = require("../middleware/paciente");
const { validateCpfQuery, validateIdParam, validateProcedimentoBody } = require("../middleware/validation");

router.use(authenticateToken);

router.get("/", validateCpfQuery, carregarPaciente, procedimentoController.listarPorCpf);
router.post("/", validateProcedimentoBody, carregarPaciente, procedimentoController.adicionar);
router.put("/:id", validateIdParam, validateProcedimentoBody, carregarPaciente, procedimentoController.atualizar);
router.delete("/:id", validateIdParam, procedimentoController.excluir);

module.exports = router;

const express = require("express");
const router = express.Router();
const procedimentoController = require("../controllers/procedimentoController");
const { authenticateToken } = require("../middleware/middleware");
const {
  validateCpfQuery,
  validateIdParam,
  validateProcedimentoBody,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get("/", validateCpfQuery, procedimentoController.listarPorCpf);
router.post("/", validateProcedimentoBody, procedimentoController.adicionar);
router.put(
  "/:id",
  validateIdParam,
  validateProcedimentoBody,
  procedimentoController.atualizar,
);
router.delete("/:id", validateIdParam, procedimentoController.excluir);

module.exports = router;

const express = require("express");
const router = express.Router();
const agendamentosController = require("../controllers/agendamentosController");

router.get("/", agendamentosController.buscarPorData);
router.post("/", agendamentosController.criarOuAtualizar);
router.post("/excluir/", agendamentosController.excluir);

module.exports = router;
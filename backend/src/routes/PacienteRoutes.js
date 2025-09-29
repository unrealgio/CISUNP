const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/pacienteController");

// ADICIONAR MIDDLEWARE DE AUTENTICAÇÃO CASO NECESSÁRIO, E IMPLEMENTA-LO EM TODAS AS ROTAS QUE NECESSITAM DE AUTENTICAÇÃO
// const authenticateToken = require("../middleware/middleware");

router.get("/todos", pacienteController.listarTodos);
router.get("/:cpf", pacienteController.buscarPorCpf);
router.post("/", pacienteController.criarOuAtualizar);
router.delete("/:cpf", pacienteController.excluir);
router.put("/:cpf", pacienteController.atualizar);

module.exports = router;
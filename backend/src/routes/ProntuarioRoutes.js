const express = require("express");
const router = express.Router();
const prontuarioController = require("../controllers/prontuarioController");

router.get("/", prontuarioController.listarPorCpf);
router.post("/", prontuarioController.adicionar);

module.exports = router;
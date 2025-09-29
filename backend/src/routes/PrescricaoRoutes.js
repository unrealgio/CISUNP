const express = require("express");
const router = express.Router();
const prescricaoController = require("../controllers/prescricaoController");

router.get("/", prescricaoController.listarPorCpf);
router.post("/", prescricaoController.adicionar);

module.exports = router;
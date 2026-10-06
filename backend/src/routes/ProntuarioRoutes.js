const express = require("express");
const router = express.Router();
const prontuarioController = require("../controllers/prontuarioController");
const authenticateToken = require("../middleware/middleware");
const { validateCpfQuery } = require("../middleware/validation");

router.use(authenticateToken);

router.get("/", validateCpfQuery, prontuarioController.listarPorCpf);
router.post("/", prontuarioController.adicionar);

module.exports = router;

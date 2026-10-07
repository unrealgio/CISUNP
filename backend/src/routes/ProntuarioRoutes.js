const express = require("express");
const router = express.Router();
const prontuarioController = require("../controllers/prontuarioController");
const authenticateToken = require("../middleware/middleware");
const {
  validateCpfQuery,
  validateProntuarioBody,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get("/", validateCpfQuery, prontuarioController.listarPorCpf);
router.post("/", validateProntuarioBody, prontuarioController.adicionar);

module.exports = router;

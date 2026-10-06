const express = require("express");
const router = express.Router();
const prescricaoController = require("../controllers/prescricaoController");
const authenticateToken = require("../middleware/middleware");
const {
  validateCpfQuery,
  validatePrescricaoBody,
} = require("../middleware/validation");

router.use(authenticateToken);

router.get("/", validateCpfQuery, prescricaoController.listarPorCpf);
router.post("/", validatePrescricaoBody, prescricaoController.adicionar);

module.exports = router;

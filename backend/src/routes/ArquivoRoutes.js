const express = require("express");
const router = express.Router();
const arquivoController = require("../controllers/arquivoController");
const { authenticateToken } = require("../middleware/middleware");
const {
  validateCpfQuery,
  validateIdParam,
  validateArquivoUpload,
} = require("../middleware/validation");
const { EXTENSOES_PERMITIDAS, TAMANHO_MAXIMO } = require("../utils/arquivos");

router.use(authenticateToken);

router.get("/", validateCpfQuery, arquivoController.listarPorCpf);
router.post(
  "/",
  express.raw({
    type: Object.keys(EXTENSOES_PERMITIDAS),
    limit: TAMANHO_MAXIMO,
  }),
  validateArquivoUpload,
  arquivoController.enviar,
);
router.get("/:id/download", validateIdParam, arquivoController.baixar);
router.delete("/:id", validateIdParam, arquivoController.excluir);

router.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ error: "O arquivo deve ter no máximo 10 MB." });
  }
  next(err);
});

module.exports = router;

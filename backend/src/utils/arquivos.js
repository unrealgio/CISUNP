const path = require("path");

const CATEGORIAS_ARQUIVO = ["exame", "documento", "outro"];

const EXTENSOES_PERMITIDAS = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const TAMANHO_MAXIMO = 10 * 1024 * 1024;

// OS TESTES TROCAM A PASTA PARA NÃO MISTURAR ARQUIVOS DE TESTE COM OS REAIS
const PASTA_ARQUIVOS = process.env.PASTA_ARQUIVOS || path.join(__dirname, "..", "..", "uploads", "arquivos");

module.exports = {
  CATEGORIAS_ARQUIVO,
  EXTENSOES_PERMITIDAS,
  TAMANHO_MAXIMO,
  PASTA_ARQUIVOS,
};

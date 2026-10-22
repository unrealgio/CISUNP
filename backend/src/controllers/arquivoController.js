const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const Arquivo = require("../models/Arquivo");
const { EXTENSOES_PERMITIDAS, PASTA_ARQUIVOS } = require("../utils/arquivos");

// O CAMINHO NO DISCO É DETALHE INTERNO: NÃO VAI NA RESPOSTA
function semCaminho(arquivo) {
  const { caminho, ...dados } = arquivo.toJSON();
  return dados;
}

// LISTA OS ARQUIVOS DE UM PACIENTE
exports.listarPorCpf = async (req, res) => {
  try {
    const lista = await Arquivo.findAll({
      where: { cpf: req.query.cpf },
      order: [["createdAt", "DESC"]],
    });
    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar arquivos:", err);
    res.status(500).json({ error: "Erro ao listar arquivos." });
  }
};

// SALVA O ARQUIVO NO DISCO COM UM NOME GERADO PELO SERVIDOR (O NOME ORIGINAL FICA SÓ NO BANCO)
exports.enviar = async (req, res) => {
  const { cpf, categoria, nome } = req.query;
  const tipoMime = req.get("Content-Type");
  const caminho = path.join(
    cpf,
    `${crypto.randomUUID()}${EXTENSOES_PERMITIDAS[tipoMime]}`,
  );
  const destino = path.join(PASTA_ARQUIVOS, caminho);
  try {
    await fs.mkdir(path.dirname(destino), { recursive: true });
    await fs.writeFile(destino, req.body);
    const arquivo = await Arquivo.create({
      cpf,
      nome: nome.trim(),
      categoria,
      tipoMime,
      tamanho: req.body.length,
      caminho,
    });
    res.status(201).json(semCaminho(arquivo));
  } catch (err) {
    await fs.rm(destino, { force: true });
    console.error("Erro ao enviar arquivo:", err);
    res.status(500).json({ error: "Erro ao enviar arquivo." });
  }
};

// ENVIA O CONTEÚDO DO ARQUIVO PARA DOWNLOAD
exports.baixar = async (req, res) => {
  try {
    const arquivo = await Arquivo.unscoped().findByPk(req.params.id);
    if (!arquivo) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }
    res.download(
      path.join(PASTA_ARQUIVOS, arquivo.caminho),
      arquivo.nome,
      { headers: { "Content-Type": arquivo.tipoMime } },
      (err) => {
        if (err && !res.headersSent) {
          res
            .status(404)
            .json({ error: "Arquivo não encontrado no servidor." });
        }
      },
    );
  } catch (err) {
    console.error("Erro ao baixar arquivo:", err);
    res.status(500).json({ error: "Erro ao baixar arquivo." });
  }
};

// EXCLUI O REGISTRO DO BANCO E O ARQUIVO DO DISCO
exports.excluir = async (req, res) => {
  try {
    const arquivo = await Arquivo.unscoped().findByPk(req.params.id);
    if (!arquivo) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }
    await arquivo.destroy();
    await fs.rm(path.join(PASTA_ARQUIVOS, arquivo.caminho), { force: true });
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir arquivo:", err);
    res.status(500).json({ error: "Erro ao excluir arquivo." });
  }
};

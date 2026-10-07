const Prontuario = require("../models/Prontuario");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Jimp = require("jimp");

// FUNÇÃO AUXILIAR PARA FORMATAR OS DADOS DO PRONTUÁRIO
function formatarDadosProntuario(dados) {
  let texto = "";

  if (dados.saudeBucal) {
    texto += "Saúde Bucal:\n";
    texto += `- Teve reação com anestesia dental? ${dados.saudeBucal.anestesia || "-"}\n`;
    texto += `- Sente dor nos dentes ou gengiva? ${dados.saudeBucal.dor || "-"}\n`;
    texto += `- Sangramento na gengiva? ${dados.saudeBucal.sangramento || "-"}\n`;
    texto += `  Quando? ${dados.saudeBucal.sangramentoQuando || "-"}\n`;
    texto += `- Sente gosto ruim ou boca seca? ${dados.saudeBucal.bocaSeca || "-"}\n`;
    texto += `- Costuma ranger os dentes? ${dados.saudeBucal.ranger || "-"}\n`;
    texto += `- Dor no maxilar ou ouvido? ${dados.saudeBucal.maxilar || "-"}\n`;
    texto += `- Último tratamento dentário: ${dados.saudeBucal.tratamento || "-"}\n`;
    texto += `- Fumante? ${dados.saudeBucal.fumante || "-"}\n`;
    texto += `- Escova os dentes quantas vezes ao dia? ${dados.saudeBucal.escova || "-"}\n`;
    texto += `- Utiliza fio dental? ${dados.saudeBucal.fioDental || "-"}\n\n`;
  }

  texto += `Antecedentes Familiares: ${dados.antecedentes || "-"}\n\n`;

  if (dados.exame) {
    texto += "Exame Clínico:\n";
    texto += `- Higiene: ${dados.exame.higiene || "-"}\n`;
    texto += `- Halitose: ${dados.exame.halitose || "-"}\n`;
    texto += `- Tártaro: ${dados.exame.tartaro || "-"}\n`;
    texto += `- Gengiva: ${dados.exame.gengiva || "-"}\n`;
    texto += `- Mucosa: ${dados.exame.mucosa || "-"}\n`;
    texto += `- Língua: ${dados.exame.lingua || "-"}\n`;
    texto += `- Palato: ${dados.exame.palato || "-"}\n`;
    texto += `- Assoalho Bucal: ${dados.exame.assoalhoBucal || "-"}\n`;
    texto += `- Lábios: ${dados.exame.labios || "-"}\n\n`;
  }

  texto += `Alterações: ${dados.alteracoes || "-"}\n`;

  return texto;
}

// LISTA OS PRONTUÁRIOS DE UM PACIENTE PELO CPF
exports.listarPorCpf = async (req, res) => {
  try {
    const { cpf } = req.query;
    if (!cpf) {
      return res.status(400).json({ error: "CPF não informado." });
    }
    const registros = await Prontuario.findAll({
      where: { cpf },
      order: [["createdAt", "DESC"]],
    });
    res.json(registros);
  } catch (err) {
    console.error("Erro ao listar prontuários:", err);
    res.status(500).json({ error: "Erro ao listar prontuários." });
  }
};

// ADICIONA UM NOVO PRONTUÁRIO E GERA O PDF
exports.adicionar = async (req, res) => {
  try {
    const { cpf, date, time, dados } = req.body;
    if (!cpf || !date || !time || !dados) {
      return res
        .status(400)
        .json({ error: "CPF, data, hora e dados são obrigatórios." });
    }

    const pdfName = `prontuario_${cpf}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, "../../uploads/prontuarios", pdfName);

    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

    const doc = new PDFDocument({
      // DEFINE O TAMANHO DA PÁGINA IGUAL AO CANVAS DO FRONTEND
      size: [900, 700],
      margin: 40,
    });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text("Prontuário Odontológico", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`CPF: ${cpf}`);
    doc.text(`Data: ${date}`);
    doc.text(`Hora: ${time}`);
    doc.moveDown();

    doc.fontSize(14).text("Dados do Prontuário:");
    const dadosSemDesenho = { ...dados };
    delete dadosSemDesenho.desenho;
    doc
      .fontSize(12)
      .text(formatarDadosProntuario(dadosSemDesenho), { lineGap: 2 });
    doc.moveDown();

    // FAZ A MESCLA DO DESENHO COM A IMAGEM DA ARCADA DENTÁRIA
    if (
      dados.desenho &&
      typeof dados.desenho === "string" &&
      dados.desenho.startsWith("data:image/png")
    ) {
      try {
        const base64Data = dados.desenho.replace(
          /^data:image\/png;base64,/,
          "",
        );
        const desenhoBuffer = Buffer.from(base64Data, "base64");

        // CARREGA A IMAGEM DA ARCADA DENTÁRIA
        const arcadaPath = path.join(
          __dirname,
          "../../..",
          "frontend",
          "public",
          "img",
          "arcada.jpg",
        );
        const arcada = await Jimp.read(arcadaPath);

        // CARREGA O DESENHO DO PACIENTE
        const desenho = await Jimp.read(desenhoBuffer);

        // REDIMENSIONA AMBAS AS IMAGENS PARA 900x700
        arcada.resize(900, 700);
        desenho.resize(900, 700);

        // MESCLA O DESENHO COM A IMAGEM DA ARCADA
        arcada.composite(desenho, 0, 0);

        // CONVERTE A IMAGEM FINAL PARA BUFFER
        const finalBuffer = await arcada.getBufferAsync(Jimp.MIME_PNG);

        doc.addPage({ size: [900, 700], margin: 40 });
        doc
          .fontSize(14)
          .text("Desenho da arcada dentária:", { align: "center" });
        doc.image(finalBuffer, 0, 40, { width: 900, height: 700 });
        doc.moveDown();
      } catch (imgErr) {
        console.error("Erro ao renderizar desenho do prontuário:", imgErr);
        doc.addPage();
        doc
          .fontSize(14)
          .text("Não foi possível renderizar o desenho.", { align: "center" });
      }
    } else {
      doc.addPage();
      doc
        .fontSize(14)
        .text("Não foi possível renderizar o desenho.", { align: "center" });
    }

    doc.end();

    await new Promise((resolve) => stream.on("finish", resolve));

    try {
      const prontuario = await Prontuario.create({
        cpf,
        date,
        time,
        dados,
        pdf: pdfName,
      });
      res.json(prontuario);
    } catch (dbErr) {
      console.error("Erro ao salvar prontuário no banco de dados:", dbErr);
      // REMOVE O PDF SE HOUVER ERRO AO SALVAR NO BANCO
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      res
        .status(500)
        .json({ error: "Erro ao salvar prontuário no banco de dados." });
    }
  } catch (err) {
    console.error("Erro ao adicionar prontuário:", err);
    res.status(500).json({ error: "Erro ao adicionar prontuário." });
  }
};

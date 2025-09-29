const Prontuario = require("../models/Prontuario");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Jimp = require("jimp");

exports.listarPorCpf = async (req, res) => {
  try {
    const { cpf } = req.query;
    if (!cpf) {
      return res.status(400).json({ error: "CPF não informado." });
    }
    const registros = await Prontuario.findAll({ where: { cpf } });
    res.json(registros);
  } catch (err) {
    console.error("Erro ao listar prontuários:", err);
    res.status(500).json({ error: "Erro ao listar prontuários." });
  }
};

exports.adicionar = async (req, res) => {
  try {
    const { cpf, date, time, dados } = req.body;

    const pdfName = `prontuario_${cpf}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, "../../uploads/prontuarios", pdfName);

    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

    const doc = new PDFDocument();
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
    doc.fontSize(12).text(JSON.stringify(dadosSemDesenho, null, 2));
    doc.moveDown();

    // Mesclar desenho PNG com arcada antes de inserir no PDF
    if (dados.desenho && typeof dados.desenho === "string" && dados.desenho.startsWith("data:image/png")) {
      console.log("Mesclando desenho com arcada...");
      const base64Data = dados.desenho.replace(/^data:image\/png;base64,/, "");
      const desenhoBuffer = Buffer.from(base64Data, "base64");

      // Carregue a imagem da arcada dentária
      const arcadaPath = path.join(__dirname, "../../..", "frontend", "public", "img", "arcada.jpg");
      const arcada = await Jimp.read(arcadaPath);

      // Carregue o desenho do usuário
      const desenho = await Jimp.read(desenhoBuffer);

      // Mescle o desenho sobre a arcada
      arcada.composite(desenho, 0, 0);

      // Converta para buffer PNG
      const finalBuffer = await arcada.getBufferAsync(Jimp.MIME_PNG);

      doc.addPage();
      doc.fontSize(14).text("Desenho da arcada dentária:", { align: "center" });
      doc.image(finalBuffer, {
        fit: [500, 300],
        align: "center",
        valign: "center",
      });
      doc.moveDown();
    } else {
      doc.addPage();
      doc.fontSize(14).text("Não foi possível renderizar o desenho.", { align: "center" });
    }

    doc.end();

    await new Promise((resolve) => stream.on("finish", resolve));

    const prontuario = await Prontuario.create({
      cpf,
      date,
      time,
      dados,
      pdf: pdfName,
    });

    res.json(prontuario);
  } catch (err) {
    console.error("Erro ao adicionar prontuário:", err);
    res.status(500).json({ error: "Erro ao adicionar prontuário." });
  }
};
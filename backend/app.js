const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const agendamentosRoutes = require("./src/routes/AgendamentosRoutes");
const prescricaoRoutes = require("./src/routes/PrescricaoRoutes");
const prontuarioRoutes = require("./src/routes/ProntuarioRoutes");
const pacienteRoutes = require("./src/routes/PacienteRoutes");
const procedimentoRoutes = require("./src/routes/ProcedimentoRoutes");
const arquivoRoutes = require("./src/routes/ArquivoRoutes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", authRoutes);
app.use("/api/agendamentos", agendamentosRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/prescricoes", prescricaoRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use("/api/procedimentos", procedimentoRoutes);
app.use("/api/arquivos", arquivoRoutes);
app.use(
  "/uploads/prontuarios",
  express.static(path.join(__dirname, "uploads/prontuarios")),
);

app.get("/", (req, res) => {
  res.send("RUNNING BACKEND");
});

module.exports = app;

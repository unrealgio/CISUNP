const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const sequelize = require("./config/database");
const User = require("./src/models/User");
const authRoutes = require("./src/routes/authRoutes");
const agendamentosRoutes = require("./src/routes/AgendamentosRoutes");
const prescricaoRoutes = require("./src/routes/PrescricaoRoutes");
const prontuarioRoutes = require("./src/routes/ProntuarioRoutes");
const pacienteRoutes = require("./src/routes/PacienteRoutes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", authRoutes);
app.use("/api/agendamentos", agendamentosRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/prescricoes", prescricaoRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use(
  "/uploads/prontuarios",
  express.static(path.join(__dirname, "uploads/prontuarios")),
);

app.get("/", (req, res) => {
  res.send("RUNNING BACKEND");
});

// SINCRONIZANDO BANCO E INICIANDO SERVIDOR
sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("Banco sincronizado e tabelas criadas!");

    // CRIANDO USUÁRIO ADMIN PADRÃO
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const [user, created] = await User.findOrCreate({
      where: { email: "admin@cis.com" },
      defaults: { senha: adminPasswordHash },
    });
    if (!created && user.senha === adminPassword) {
      user.senha = adminPasswordHash;
      await user.save();
    }
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao sincronizar banco:", err);
  });

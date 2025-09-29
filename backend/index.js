const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

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
app.use("/uploads/prontuarios",express.static(path.join(__dirname, "uploads/prontuarios"))
);

app.get("/", (req, res) => {
  res.send("RUNING BACKEND");
});

//SINCRONIZANDO BANCO E INICIANDO SERVIDOR
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Banco sincronizado e tabelas criadas!");

    //CRIANDO USUÁRIO ADMIN PADRÃO
    const [user, created] = await User.findOrCreate({
      where: { email: "admin@cis.com" },
      defaults: { senha: "BemVindo" },
    });
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao sincronizar banco:", err);
  });

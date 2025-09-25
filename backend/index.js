const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
const User = require("./src/models/User");
const Agendamentos = require("./src/models/Agendamentos");
const authRoutes = require("./src/routes/authRoutes");
const agendamentosRoutes = require("./src/routes/AgendamentosRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/agendamentos", agendamentosRoutes);

app.get("/", (req, res) => {
  res.send("API do CIS rodando!");
});

// Sincroniza o banco e ajusta tabelas conforme modelo
sequelize.sync({ force: true }).then(async () => {
  console.log("Banco sincronizado e tabelas criadas!");

  // Usuário padrão
  const [user, created] = await User.findOrCreate({
    where: { email: "admin@cis.com" },
    defaults: { senha: "BemVindo" }
  });
  if (created) {
    console.log("Usuário padrão criado!");
  } else {
    console.log("Usuário padrão já existe.");
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch((err) => {
  console.error("Erro ao sincronizar banco:", err);
});
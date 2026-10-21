const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const sequelize = require("./config/database");
const User = require("./src/models/User");
const app = require("./app");

// CONECTANDO AO BANCO (ESTRUTURA CRIADA PELAS MIGRATIONS) E INICIANDO SERVIDOR
sequelize
  .authenticate()
  .then(async () => {
    console.log("Banco conectado!");

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
    console.error("Erro ao iniciar o backend:", err);
  });

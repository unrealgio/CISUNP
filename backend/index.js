const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const sequelize = require("./config/database");
const User = require("./src/models/User");
const app = require("./app");

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

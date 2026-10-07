const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../../config/auth");
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD;

// VALIDA A SESSÃO DO USUÁRIO A PARTIR DO TOKEN
exports.session = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "email"],
    });

    if (!user) {
      return res.status(401).json({ error: "Sessão inválida." });
    }

    res.json({ user });
  } catch (err) {
    console.error("Erro ao validar sessão:", err);
    res.status(500).json({ error: "Erro ao validar sessão." });
  }
};

// AUTENTICA O USUÁRIO E GERA O TOKEN DE ACESSO
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      if (senha !== DEFAULT_PASSWORD) {
        return res.status(401).json({ error: "Usuário ou senha inválidos." });
      }

      user = await User.create({
        email,
        senha: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "2h",
      });
      return res.status(201).json({ token, firstAccess: true });
    }

    // VERIFICAÇÃO DE SENHA
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    // SE FOR PRIMEIRO ACESSO, SOLICITA TROCA DE SENHA
    const firstAccess = await bcrypt.compare(DEFAULT_PASSWORD, user.senha);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token, firstAccess });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no login." });
  }
};

// ALTERA A SENHA DO USUÁRIO
exports.changePassword = async (req, res) => {
  const { email, novaSenha } = req.body;
  try {
    if (req.user.email !== email) {
      return res.status(403).json({ error: "Usuário não autorizado" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    user.senha = await bcrypt.hash(novaSenha, 10);
    await user.save();
    res.json({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    res.status(500).json({ error: "Erro ao alterar senha." });
  }
};

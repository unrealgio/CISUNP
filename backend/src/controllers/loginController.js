const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../../config/auth");
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD;

function gerarToken(user, trocarSenha) {
  return jwt.sign({ id: user.id, email: user.email, trocarSenha }, JWT_SECRET, {
    expiresIn: "2h",
  });
}

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

      const token = gerarToken(user, true);
      return res.status(201).json({ token, firstAccess: true });
    }

    // VERIFICAÇÃO DE SENHA
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    // SE FOR PRIMEIRO ACESSO, SOLICITA TROCA DE SENHA
    const firstAccess = await bcrypt.compare(DEFAULT_PASSWORD, user.senha);

    const token = gerarToken(user, firstAccess);
    res.json({ token, firstAccess });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no login." });
  }
};

// ALTERA A SENHA DO USUÁRIO
exports.changePassword = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const senhaCorreta = await bcrypt.compare(senhaAtual, user.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ error: "Senha atual incorreta." });
    }

    user.senha = await bcrypt.hash(novaSenha, 10);
    await user.save();
    res.json({
      message: "Senha alterada com sucesso!",
      token: gerarToken(user, false),
    });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    res.status(500).json({ error: "Erro ao alterar senha." });
  }
};

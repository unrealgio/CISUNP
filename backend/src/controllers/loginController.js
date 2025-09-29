const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    if (!email || !senha) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }

    let user = await User.findOne({ where: { email } });

    // CRIAÇÃO USUARIO PADRÃO SE NÃO EXISTIR
    if (!user) {
      const senhaHash = await bcrypt.hash("BemVindo", 10);
      user = await User.create({ email, senha: senhaHash });
      return res.status(201).json({
        token: jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
          expiresIn: "2h",
        }),
        firstAccess: true,
      });
    }

    // VERIFICAÇÃO DE SENHA
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // SE FOR PRIMEIRO ACESSO, SOLICITA TROCA DE SENHA
    const firstAccess = await bcrypt.compare("BemVindo", user.senha);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token, firstAccess });
  } catch (err) {
    res.status(500).json({ error: "Erro no login." });
  }
};

// ALTERA A SENHA DO USUÁRIO
exports.changePassword = async (req, res) => {
  const { email, novaSenha } = req.body;
  try {
    if (!email || !novaSenha) {
      return res
        .status(400)
        .json({ error: "E-mail e nova senha são obrigatórios." });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    user.senha = await bcrypt.hash(novaSenha, 10);
    await user.save();
    res.json({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao alterar senha." });
  }
};

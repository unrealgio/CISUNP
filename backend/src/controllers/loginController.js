const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  let user = await User.findOne({ where: { email } });

  // Se não existe, cria com senha padrão (hash)
  if (!user) {
    const senhaHash = await bcrypt.hash("BemVindo", 10);
    user = await User.create({ email, senha: senhaHash });
    return res.status(201).json({
      token: jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" }),
      firstAccess: true
    });
  }

  // Verifica senha
  const senhaCorreta = await bcrypt.compare(senha, user.senha);
  if (!senhaCorreta) {
    return res.status(401).json({ error: "Senha incorreta" });
  }

  // Se senha padrão, sinaliza para trocar
  const firstAccess = await bcrypt.compare("BemVindo", user.senha);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, firstAccess });
};

exports.changePassword = async (req, res) => {
  const { email, novaSenha } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  user.senha = await bcrypt.hash(novaSenha, 10);
  await user.save();
  res.json({ message: "Senha alterada com sucesso!" });
};
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/auth");

function verificarToken(req, res, next, permitirTrocaDeSenha) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Sessão expirada ou inválida." });
    }
    // TOKEN DO PRIMEIRO ACESSO SÓ SERVE PARA TROCAR A SENHA
    if (user.trocarSenha && !permitirTrocaDeSenha) {
      return res.status(403).json({ error: "Troque a senha para continuar." });
    }
    req.user = user;
    next();
  });
}

function authenticateToken(req, res, next) {
  verificarToken(req, res, next, false);
}

function authenticateTrocaDeSenha(req, res, next) {
  verificarToken(req, res, next, true);
}

module.exports = { authenticateToken, authenticateTrocaDeSenha };

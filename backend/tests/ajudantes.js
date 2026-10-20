const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/auth");
const app = require("../app");

function gerarTokenDeTeste(dados = {}, opcoes = { expiresIn: "5m" }) {
  return jwt.sign(
    { id: 1, email: "teste@cis.com", trocarSenha: false, ...dados },
    JWT_SECRET,
    opcoes,
  );
}

function iniciarServidor() {
  return new Promise((resolve) => {
    const servidor = app.listen(0, () => {
      const { port } = servidor.address();
      resolve({
        url: `http://localhost:${port}`,
        fechar: () => new Promise((fim) => servidor.close(fim)),
      });
    });
  });
}

function rodarMiddleware(middleware, req) {
  const res = { statusCode: 200, corpo: undefined };
  res.status = (codigo) => {
    res.statusCode = codigo;
    return res;
  };
  res.json = (corpo) => {
    res.corpo = corpo;
    return res;
  };

  let chamouNext = false;
  middleware(req, res, () => {
    chamouNext = true;
  });
  return { res, chamouNext };
}

module.exports = { gerarTokenDeTeste, iniciarServidor, rodarMiddleware };

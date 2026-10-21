// DATA DE HOJE NO FORMATO AAAA-MM-DD, NO FUSO DO SERVIDOR
function hojeLocal() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

module.exports = { hojeLocal };

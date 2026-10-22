// DATA DE HOJE NO FORMATO AAAA-MM-DD, NO FUSO DO SERVIDOR
function hojeLocal() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// HORA ATUAL NO FORMATO HH:MM, NO FUSO DO SERVIDOR
function horaLocal() {
  const agora = new Date();
  const hora = String(agora.getHours()).padStart(2, "0");
  const minuto = String(agora.getMinutes()).padStart(2, "0");
  return `${hora}:${minuto}`;
}

module.exports = { hojeLocal, horaLocal };

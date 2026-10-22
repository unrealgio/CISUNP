function apenasDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

// DDD SEM ZERO + FIXO (8 DÍGITOS, COMEÇANDO DE 2 A 8) OU CELULAR (9 + 8 DÍGITOS)
function isTelefone(digitos) {
  return /^[1-9]{2}(9\d{8}|[2-8]\d{7})$/.test(digitos);
}

// O BANCO GUARDA SÓ OS NÚMEROS, VAZIO VIRA NULL
function telefoneParaSalvar(valor) {
  return apenasDigitos(valor) || null;
}

module.exports = { apenasDigitos, isTelefone, telefoneParaSalvar };

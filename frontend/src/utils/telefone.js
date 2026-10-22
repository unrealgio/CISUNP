export function apenasDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

// MÁSCARA PROGRESSIVA ENQUANTO SE DIGITA: (84) 3201-1234 (FIXO) OU (84) 99999-0000 (CELULAR)
export function mascaraTelefone(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  if (!digitos) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  if (numero.length <= 4) return `(${ddd}) ${numero}`;
  const corte = numero.length === 9 ? 5 : 4;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

// PARA EXIBIR: SÓ FORMATA SE FOR UM TELEFONE COMPLETO; SENÃO MOSTRA COMO ESTÁ
export function formatarTelefone(valor) {
  const digitos = apenasDigitos(valor);
  return digitos.length === 10 || digitos.length === 11
    ? mascaraTelefone(digitos)
    : valor || "";
}

// FORMATA A DATA NO FUSO LOCAL
export function dataLocalISO(date = new Date()) {
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mes}-${dia}`;
}

// CONVERTE "AAAA-MM-DD" PARA "DD/MM/AAAA"
export function formatarDataISO(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// FORMATA UM TIMESTAMP DO BANCO (EX.: createdAt) COMO "DD/MM/AAAA, HH:MM"
export function formatarDataHora(valor) {
  if (!valor) return "";
  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

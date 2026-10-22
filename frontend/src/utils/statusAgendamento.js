export const STATUS = {
  pendente: {
    rotulo: "Pendente",
    plural: "Pendentes",
    acao: "Voltar para pendente",
  },
  confirmada: {
    rotulo: "Confirmada",
    plural: "Confirmadas",
    acao: "Confirmar",
  },
  realizada: {
    rotulo: "Realizada",
    plural: "Realizadas",
    acao: "Marcar como realizada",
  },
  faltou: {
    rotulo: "Faltou",
    plural: "Faltas",
    acao: "Marcar falta",
  },
  cancelada: {
    rotulo: "Cancelada",
    plural: "Canceladas",
    acao: "Cancelar consulta",
  },
};

// REALIZADA E FALTA SÓ FAZEM SENTIDO PARA CONSULTAS DE HOJE OU DO PASSADO
export function statusDisponivel(status, consulta, hoje) {
  return consulta.date <= hoje || !["realizada", "faltou"].includes(status);
}

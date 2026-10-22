const { STATUS_AGENDAMENTO } = require("../utils/statusAgendamento");
const { STATUS_PROCEDIMENTO } = require("../utils/statusProcedimento");
const {
  CATEGORIAS_ARQUIVO,
  EXTENSOES_PERMITIDAS,
} = require("../utils/arquivos");

function fail(res, errors) {
  return res.status(400).json({ error: "Dados inválidos.", details: errors });
}

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function isTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isCpf(value) {
  return typeof value === "string" && /^\d{11}$/.test(value);
}

function validateLogin(req, res, next) {
  const { email, senha } = req.body || {};
  const errors = [];

  if (!isEmail(email)) errors.push("E-mail inválido.");
  if (typeof senha !== "string" || senha.length < 6 || senha.length > 72) {
    errors.push("A senha deve ter entre 6 e 72 caracteres.");
  }

  return errors.length ? fail(res, errors) : next();
}

function validateChangePassword(req, res, next) {
  const { senhaAtual, novaSenha } = req.body || {};
  const errors = [];

  if (typeof senhaAtual !== "string" || !senhaAtual) {
    errors.push("Informe a senha atual.");
  }
  if (
    typeof novaSenha !== "string" ||
    novaSenha.length < 8 ||
    novaSenha.length > 72
  ) {
    errors.push("A nova senha deve ter entre 8 e 72 caracteres.");
  }
  if (novaSenha === senhaAtual) {
    errors.push("A nova senha deve ser diferente da atual.");
  }

  return errors.length ? fail(res, errors) : next();
}

function validateCpfParam(req, res, next) {
  return isCpf(req.params.cpf)
    ? next()
    : fail(res, ["CPF deve conter 11 números."]);
}

function validateCpfQuery(req, res, next) {
  return isCpf(req.query.cpf)
    ? next()
    : fail(res, ["CPF deve conter 11 números."]);
}

function validateIdParam(req, res, next) {
  return /^\d+$/.test(req.params.id) && Number(req.params.id) > 0
    ? next()
    : fail(res, ["Identificador inválido."]);
}

function validarTamanhos(body, campos, errors) {
  for (const [campo, rotulo] of Object.entries(campos)) {
    if (body[campo] != null && String(body[campo]).length > 255) {
      errors.push(`O campo ${rotulo} deve ter no máximo 255 caracteres.`);
    }
  }
}

// VALIDAÇÕES COMUNS AO CADASTRO E À EDIÇÃO DE PACIENTE
function validarCamposPaciente(body, errors) {
  const { patient, idade } = body;

  if (
    typeof patient !== "string" ||
    patient.trim().length < 2 ||
    patient.length > 120
  ) {
    errors.push("Nome do paciente deve ter entre 2 e 120 caracteres.");
  }
  if (
    idade !== undefined &&
    idade !== null &&
    idade !== "" &&
    !(/^\d{1,3}$/.test(String(idade)) && Number(idade) <= 150)
  ) {
    errors.push("Idade deve ser um número entre 0 e 150.");
  }
  validarTamanhos(
    body,
    {
      phone: "Telefone",
      medico: "Médico",
      endereco: "Endereço",
      notes: "Observações",
    },
    errors,
  );
}

function validatePacienteBody(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (!isCpf(body.cpf)) errors.push("CPF deve conter 11 números.");
  validarCamposPaciente(body, errors);

  return errors.length ? fail(res, errors) : next();
}

function validatePacienteUpdate(req, res, next) {
  const errors = [];

  if (!isCpf(req.params.cpf)) errors.push("CPF deve conter 11 números.");
  validarCamposPaciente(req.body || {}, errors);

  return errors.length ? fail(res, errors) : next();
}

function validateAgendamentoQuery(req, res, next) {
  return isDate(req.query.date)
    ? next()
    : fail(res, ["Data deve estar no formato AAAA-MM-DD."]);
}

function validateIntervaloQuery(req, res, next) {
  const { inicio, fim } = req.query;
  if (!isDate(inicio) || !isDate(fim)) {
    return fail(res, ["Início e fim devem estar no formato AAAA-MM-DD."]);
  }
  return inicio <= fim
    ? next()
    : fail(res, ["A data de início deve ser anterior à data de fim."]);
}

function validateAgendamentoBody(req, res, next) {
  const body = req.body || {};
  const { time, date, patient, cpf } = body;
  const errors = [];

  if (!isTime(time)) errors.push("Horário deve estar no formato HH:MM.");
  if (!isDate(date)) errors.push("Data deve estar no formato AAAA-MM-DD.");
  if (
    typeof patient !== "string" ||
    patient.trim().length < 2 ||
    patient.length > 120
  ) {
    errors.push("Nome do paciente deve ter entre 2 e 120 caracteres.");
  }
  if (cpf && !isCpf(cpf)) {
    errors.push("CPF deve conter 11 números.");
  }
  validarTamanhos(
    body,
    { phone: "Telefone", medico: "Médico", notes: "Observações" },
    errors,
  );

  return errors.length ? fail(res, errors) : next();
}

function validateStatusBody(req, res, next) {
  const { status } = req.body || {};
  return STATUS_AGENDAMENTO.includes(status)
    ? next()
    : fail(res, [`Status deve ser: ${STATUS_AGENDAMENTO.join(", ")}.`]);
}

function validatePrescricaoBody(req, res, next) {
  const { cpf, medicamento } = req.body || {};
  const errors = [];

  if (!isCpf(cpf)) errors.push("CPF deve conter 11 números.");
  if (
    typeof medicamento !== "string" ||
    medicamento.trim().length < 2 ||
    medicamento.length > 255
  ) {
    errors.push("Medicamento deve ter entre 2 e 255 caracteres.");
  }
  validarTamanhos(
    req.body || {},
    { dose: "Dose", frequencia: "Frequência", observacao: "Observação" },
    errors,
  );

  return errors.length ? fail(res, errors) : next();
}

function validateProntuarioBody(req, res, next) {
  const { cpf, date, time, dados } = req.body || {};
  const errors = [];

  // O CPF É USADO NO NOME DO ARQUIVO DO PDF, POR ISSO SÓ ACEITA 11 NÚMEROS
  if (!isCpf(cpf)) errors.push("CPF deve conter 11 números.");
  if (!isDate(date)) errors.push("Data deve estar no formato AAAA-MM-DD.");
  if (!isTime(time)) errors.push("Horário deve estar no formato HH:MM.");
  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) {
    errors.push("Dados do prontuário inválidos.");
  } else if (dados.desenho != null && typeof dados.desenho !== "string") {
    errors.push("Desenho do prontuário inválido.");
  }

  return errors.length ? fail(res, errors) : next();
}

// DENTE NA NUMERAÇÃO FDI: 11 A 48 (PERMANENTES) OU 51 A 85 (DE LEITE)
function isDente(value) {
  return typeof value === "string" && /^([1-4][1-8]|[5-8][1-5])$/.test(value);
}

function validateProcedimentoBody(req, res, next) {
  const body = req.body || {};
  const { cpf, tipo, dente, data, status } = body;
  const errors = [];

  if (!isCpf(cpf)) errors.push("CPF deve conter 11 números.");
  if (typeof tipo !== "string" || tipo.trim().length < 2 || tipo.length > 120) {
    errors.push("Procedimento deve ter entre 2 e 120 caracteres.");
  }
  if (dente && !isDente(dente)) {
    errors.push("Dente deve seguir a numeração FDI (ex.: 11, 36, 85).");
  }
  if (data && !isDate(data)) {
    errors.push("Data deve estar no formato AAAA-MM-DD.");
  }
  if (!STATUS_PROCEDIMENTO.includes(status)) {
    errors.push(`Status deve ser: ${STATUS_PROCEDIMENTO.join(", ")}.`);
  } else if (status === "realizado" && !data) {
    errors.push("Informe a data do procedimento realizado.");
  }
  validarTamanhos(body, { observacao: "Observação" }, errors);

  return errors.length ? fail(res, errors) : next();
}

function validateArquivoUpload(req, res, next) {
  const { cpf, categoria, nome } = req.query;
  const errors = [];

  if (!isCpf(cpf)) errors.push("CPF deve conter 11 números.");
  if (!CATEGORIAS_ARQUIVO.includes(categoria)) {
    errors.push(`Categoria deve ser: ${CATEGORIAS_ARQUIVO.join(", ")}.`);
  }
  if (typeof nome !== "string" || !nome.trim() || nome.length > 255) {
    errors.push("Nome do arquivo deve ter entre 1 e 255 caracteres.");
  }
  if (!EXTENSOES_PERMITIDAS[req.get("Content-Type")]) {
    errors.push("Envie um PDF ou uma imagem (PNG, JPG ou WEBP).");
  } else if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    errors.push("O arquivo está vazio.");
  }

  return errors.length ? fail(res, errors) : next();
}

module.exports = {
  validateLogin,
  validateChangePassword,
  validateCpfParam,
  validateCpfQuery,
  validateIdParam,
  validatePacienteBody,
  validatePacienteUpdate,
  validateAgendamentoQuery,
  validateIntervaloQuery,
  validateAgendamentoBody,
  validateStatusBody,
  validatePrescricaoBody,
  validateProntuarioBody,
  validateProcedimentoBody,
  validateArquivoUpload,
};

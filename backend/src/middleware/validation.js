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
  const { email, novaSenha } = req.body || {};
  const errors = [];

  if (!isEmail(email)) errors.push("E-mail inválido.");
  if (
    typeof novaSenha !== "string" ||
    novaSenha.length < 8 ||
    novaSenha.length > 72
  ) {
    errors.push("A nova senha deve ter entre 8 e 72 caracteres.");
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
  for (const field of ["phone", "medico", "endereco", "notes"]) {
    if (body[field] != null && String(body[field]).length > 255) {
      errors.push(`Campo ${field} excede o limite de 255 caracteres.`);
    }
  }
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
  const { time, date, patient } = req.body || {};
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
  if (req.body.cpf && !isCpf(req.body.cpf)) {
    errors.push("CPF deve conter 11 números.");
  }

  return errors.length ? fail(res, errors) : next();
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
  validatePrescricaoBody,
};

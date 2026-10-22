import { apenasDigitos, mascaraTelefone } from "../utils/telefone";

// CAMPO DE TELEFONE COM MÁSCARA: MOSTRA (84) 99999-0000, MAS ENTREGA SÓ OS DÍGITOS
export default function CampoTelefone({
  value,
  onChange,
  onKeyDown,
  placeholder = "(84) 99999-0000",
  className = "cis-input",
}) {
  const exibido = mascaraTelefone(value);

  function handleChange(e) {
    let digitos = apenasDigitos(e.target.value);
    if (
      e.target.value.length < exibido.length &&
      digitos === apenasDigitos(value)
    ) {
      digitos = digitos.slice(0, -1);
    }
    onChange(digitos.slice(0, 11));
  }

  return (
    <input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      className={className}
      placeholder={placeholder}
      value={exibido}
      maxLength={15}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  );
}

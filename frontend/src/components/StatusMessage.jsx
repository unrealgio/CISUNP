export function LoadingMessage({ children = "Carregando" }) {
  return <div className="p-6 text-center text-(--cis-muted)">{children}</div>;
}

// CAIXA DE ERRO: PADRÃO (DESTAQUE) OU COMPACTA (DENTRO DE FORMULÁRIOS)
// className: ESPAÇAMENTO OU POSIÇÃO EXTRA (EX.: "mb-2")
const estilosErro = {
  padrao:
    "rounded-lg bg-(--cis-danger-soft) px-4 py-3 text-center font-semibold text-(--cis-danger)",
  compacto:
    "rounded-lg bg-(--cis-danger-soft) border border-(--cis-danger-line) text-(--cis-danger) text-sm px-3 py-2 text-center",
};

export function EstadoVazio({ icone, titulo, dica, compacto = false }) {
  if (compacto) {
    return (
      <p className="flex items-center gap-2 text-sm text-(--cis-muted)">
        {icone && (
          <span className="shrink-0" aria-hidden="true">
            {icone}
          </span>
        )}
        {titulo}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-(--cis-border) bg-(--cis-surface) px-6 py-8 text-center">
      {icone && (
        <span className="text-3xl text-(--cis-unp-steel)" aria-hidden="true">
          {icone}
        </span>
      )}
      <p className="font-semibold text-(--cis-ink)">{titulo}</p>
      {dica && <p className="text-sm text-(--cis-muted)">{dica}</p>}
    </div>
  );
}

export function ErrorMessage({ children, compacto = false, className = "" }) {
  const estilo = compacto ? estilosErro.compacto : estilosErro.padrao;
  return (
    <div className={`${estilo} ${className}`.trim()} role="alert">
      {children}
    </div>
  );
}

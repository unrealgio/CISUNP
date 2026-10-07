export function LoadingMessage({ children = "Carregando" }) {
  return <div className="p-6 text-center text-gray-500">{children}</div>;
}

// CAIXA DE ERRO: PADRÃO (DESTAQUE) OU COMPACTA (DENTRO DE FORMULÁRIOS)
// className: ESPAÇAMENTO OU POSIÇÃO EXTRA (EX.: "mb-2")
const estilosErro = {
  padrao:
    "rounded-lg bg-red-100 px-4 py-3 text-center font-semibold text-red-700",
  compacto:
    "rounded-lg bg-red-50 border border-red-200 text-(--cis-danger) text-sm px-3 py-2 text-center",
};

export function ErrorMessage({ children, compacto = false, className = "" }) {
  const estilo = compacto ? estilosErro.compacto : estilosErro.padrao;
  return (
    <div className={`${estilo} ${className}`.trim()} role="alert">
      {children}
    </div>
  );
}

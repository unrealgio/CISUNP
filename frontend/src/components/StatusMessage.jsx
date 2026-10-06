export function LoadingMessage({ children = "Carregando" }) {
  return <div className="p-6 text-center text-gray-500">{children}</div>;
}

export function ErrorMessage({ children }) {
  return (
    <div className="rounded-lg bg-red-100 px-4 py-3 text-center font-semibold text-red-700">
      {children}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { apiFetch, mensagemDeErro } from "../api";

// BUSCA DADOS DA API E LIDA COM ERROS E CARREGAMENTO
export function useBuscarDados(
  url,
  mensagemPadrao = "Erro ao carregar dados.",
  versao = 0,
) {
  const [recarga, setRecarga] = useState(0);
  const [resultado, setResultado] = useState({
    chave: null,
    url: null,
    dados: null,
    erro: "",
    status: null,
  });
  const chave = `${url}#${recarga}#${versao}`;

  useEffect(() => {
    let cancelado = false;
    apiFetch(url)
      .then(async (res) => {
        const data = await res.json();
        if (cancelado) return;
        setResultado({
          chave,
          url,
          dados: res.ok ? data : null,
          erro: res.ok ? "" : mensagemDeErro(data, mensagemPadrao),
          status: res.status,
        });
      })
      .catch(() => {
        if (cancelado) return;
        setResultado({
          chave,
          url,
          dados: null,
          erro: "Erro de conexão com o servidor.",
          status: null,
        });
      });
    return () => {
      cancelado = true;
    };
  }, [url, chave, mensagemPadrao]);

  // RECARREGA OS DADOS
  const recarregar = useCallback(() => setRecarga((n) => n + 1), []);

  // ATUALIZA OS DADOS SEM RECARREGAR
  const alterarDados = useCallback(
    (atualizar) =>
      setResultado((atual) => ({ ...atual, dados: atualizar(atual.dados) })),
    [],
  );

  // DADOS SÃO VÁLIDOS SOMENTE SE A URL NÃO MUDOU DESDE A ÚLTIMA BUSCA
  const mesmaUrl = resultado.url === url;
  return {
    dados: mesmaUrl ? resultado.dados : null,
    erro: mesmaUrl ? resultado.erro : "",
    status: mesmaUrl ? resultado.status : null,
    carregando: resultado.chave !== chave,
    recarregar,
    alterarDados,
  };
}

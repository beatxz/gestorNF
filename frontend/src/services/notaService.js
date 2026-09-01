import api from "./api"

/**
 * Serviço de notas fiscais.
 * Endpoints:
 *  GET    /notaFiscal/vendedor/{idVendedor}
 *  GET    /notaFiscal?id={idVendedor}&notaFiscal={numero}
 *  POST   /notaFiscal
 *  DELETE /notaFiscal?numeroNotaFiscal={numero}
 *  GET    /notaFiscal/valorMensal?id={idVendedor}&mes={yyyy-MM}
 *  GET    /notaFiscal/valorComissao?id={idVendedor}&mes={yyyy-MM}
 */

// Lista todas as notas de um vendedor.
export async function listarNotasDoVendedor(idVendedor) {
  const { data } = await api.get(`/notaFiscal/vendedor/${idVendedor}`)
  return data
}

// Busca uma nota específica pelo número, dentro de um vendedor.
export async function buscarNota(numeroNotaFiscal) {
  const { data } = await api.get(
    `/notaFiscal?notaFiscal=${numeroNotaFiscal}`
  )
  return data
}

// Cadastra uma nova nota fiscal. dataVenda no formato "dd-MM-yyyy".
export async function cadastrarNota({vendedorId, numeroNotaFiscal, nomeEmpresa,
                                      valorNotaFiscal, codigoCliente, dataVenda}) {
  const { data } = await api.post("/notaFiscal", {
    vendedorId: Number(vendedorId),
    numeroNotaFiscal: Number(numeroNotaFiscal),
    nomeEmpresa,
    valorNotaFiscal: Number(valorNotaFiscal),
    codigoCliente,
    dataVenda,
  })

  return data
}

// Deleta uma nota pelo número -> DELETE /notaFiscal?numeroNotaFiscal={numero}
export async function deletarNota(numeroNotaFiscal) {
  const { data } = await api.delete(`/notaFiscal`, {
    params: { numeroNotaFiscal },
  })
  return data
}

// Valor total vendido no mês (mes no formato YearMonth "yyyy-MM").
export async function buscarValorMensal(idVendedor, mes) {
  const { data } = await api.get(`/notaFiscal/valorMensal`, {
    params: { id: idVendedor, mes },
  })
  return data
}

// Valor de comissão do mês (mes no formato YearMonth "yyyy-MM").
export async function buscarValorComissao(idVendedor, mes) {
  const { data } = await api.get(`/notaFiscal/valorComissao`, {
    params: { id: idVendedor, mes },
  })
  return data
}
export async function exportarRelatorio(mes, idVendedor) {
  const params = { mes }

  if (idVendedor) {
    params.idVendedor = idVendedor
  }

  const response = await api.get("/notaFiscal/relatorio", {
    params,
    responseType: "blob",
  })

  return response.data
}
export async function buscarResultadoGeral(mes) {
  const { data } = await api.get("/notaFiscal/resultado-geral", {
    params: { mes },
  })

  return data
}
export async function exportarResultadoGeralPdf(mes) {
  const response = await api.get("/notaFiscal/resultado-geral/pdf", {
    params: { mes },
    responseType: "blob",
  })

  return response.data
}
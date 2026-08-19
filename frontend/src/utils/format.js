/**
 * Funções utilitárias de formatação (moeda, datas, mês).
 */

// Formata um número como Real brasileiro. Aceita null/undefined com segurança.
export function formatarMoeda(valor) {
  const numero = Number(valor)
  if (valor === null || valor === undefined || Number.isNaN(numero)) {
    return "R$ 0,00"
  }
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// Converte diferentes formatos de data vindos da API para dd/MM/yyyy.
export function formatarData(data) {
  if (!data) return "-"

  // Formato "dd-MM-yyyy"
  if (/^\d{2}-\d{2}-\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split("-")
    return `${dia}/${mes}/${ano}`
  }

  // Formato ISO "yyyy-MM-dd"
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    const [ano, mes, dia] = data.slice(0, 10).split("-")
    return `${dia}/${mes}/${ano}`
  }

  return data
}

// Converte uma data de input (yyyy-MM-dd) para o formato do backend (dd-MM-yyyy).
export function dataInputParaBackend(valorInput) {
  if (!valorInput) return ""
  const [ano, mes, dia] = valorInput.split("-")
  return `${dia}-${mes}-${ano}`
}

// Retorna o YearMonth atual no formato "yyyy-MM".
export function mesAtual() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, "0")
  return `${ano}-${mes}`
}

// Rótulo amigável para um YearMonth "yyyy-MM" -> "agosto de 2026".
export function rotuloMes(yearMonth) {
  if (!yearMonth) return ""
  const [ano, mes] = yearMonth.split("-")
  const data = new Date(Number(ano), Number(mes) - 1, 1)
  return data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

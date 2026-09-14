import api from "./api"

/**
 * =========================
 * CONVITES
 * =========================
 */

// GET /admin/convites
export async function listarConvites() {
    const { data } = await api.get("/admin/convites")
    return data
}

// POST /admin/convites
export async function enviarConvite(email) {
    const { data } = await api.post("/admin/convites", {
        email: email.trim(),
    })

    return data
}

// DELETE /admin/convites/{id}
export async function cancelarConvite(id) {
    await api.delete(`/admin/convites/${id}`)
}


/**
 * =========================
 * GESTÃO DE CLIENTES
 * =========================
 */

// GET /admin/clientes
export async function listarClientesAdmin() {
    const { data } = await api.get("/admin/clientes")
    return data
}

// GET /admin/resumo
export async function buscarResumoAdmin() {
    const { data } = await api.get("/admin/resumo")
    return data
}

// PATCH /admin/clientes/{usuarioId}/assinatura
export async function configurarAssinatura(
    usuarioId,
    {
        valorMensal,
        diaVencimento,
    },
) {
    const { data } = await api.patch(
        `/admin/clientes/${usuarioId}/assinatura`,
        {
            valorMensal: Number(valorMensal),
            diaVencimento: Number(diaVencimento),
        },
    )

    return data
}

// PATCH /admin/clientes/{usuarioId}/suspender
export async function suspenderAssinatura(usuarioId) {
    const { data } = await api.patch(
        `/admin/clientes/${usuarioId}/suspender`,
    )

    return data
}

// PATCH /admin/clientes/{usuarioId}/reativar
export async function reativarAssinatura(usuarioId) {
    const { data } = await api.patch(
        `/admin/clientes/${usuarioId}/reativar`,
    )

    return data
}
export async function registrarPagamento(usuarioId, valorPago,) {

    const { data } =
        await api.post(`/admin/clientes/${usuarioId}/pagamentos`,
            {
                valorPago: Number(valorPago),},)

    return data
}
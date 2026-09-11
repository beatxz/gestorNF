import api from "./api"

/**
 * Lista todos os convites.
 *
 * Somente ADMIN.
 * GET /admin/convites
 */
export async function listarConvites() {
    const { data } = await api.get("/admin/convites")
    return data
}


export async function enviarConvite(email) {
    const { data } = await api.post("/admin/convites", {
        email: email.trim(),
    })

    return data
}


export async function cancelarConvite(id) {
    await api.delete(`/admin/convites/${id}`)
}
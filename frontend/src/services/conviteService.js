import api from "./api"

/**
 * Valida um convite pelo token recebido no e-mail.
 *
 * GET /convites/validar?token=...
 */
export async function validarConvite(token) {
    const { data } = await api.get("/convites/validar", {
        params: {
            token,
        },
    })

    return data
}

/**
 * Aceita um convite e cria a conta do usuário.
 *
 * POST /convites/aceitar
 */
export async function aceitarConvite({
                                         token,
                                         nome,
                                         senha,
                                     }) {
    await api.post("/convites/aceitar", {
        token,
        nome,
        senha,
        aceitouTermos: true,
        cientePoliticaPrivacidade: true,
    })
}
import api from "./api"

export async function listarEventos(inicio, fim) {
    const { data } = await api.get("/agenda", { params: { inicio, fim } })
    return data
}

export async function criarEvento(evento) {
    const { data } = await api.post("/agenda", evento)
    return data
}

export async function atualizarEvento(id, evento) {
    const { data } = await api.put(`/agenda/${id}`, evento)
    return data
}

export async function excluirEvento(id) {
    await api.delete(`/agenda/${id}`)
}
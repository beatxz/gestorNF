import api from "./api"

export async function buscarMetaMensal(mes) {

    const { data } =
        await api.get(
            "/meta",
            {
                params: { mes },
            },
        )

    return data
}


export async function salvarMetaMensal(
    mes,
    valor,
) {

    const { data } =
        await api.put(
            "/meta",
            {
                valor: Number(valor),
            },
            {
                params: { mes },
            },
        )

    return data
}
export async function buscarMetaVendedor(
    idVendedor,
    mes,
) {

    const { data } =
        await api.get(
            `/meta-vendedor/${idVendedor}`,
            {
                params: { mes },
            },
        )

    return data
}


export async function salvarMetaVendedor(
    idVendedor,
    mes,
    valor,
) {

    const { data } =
        await api.put(
            `/meta-vendedor/${idVendedor}`,
            {
                valor: Number(valor),
            },
            {
                params: { mes },
            },
        )

    return data
}
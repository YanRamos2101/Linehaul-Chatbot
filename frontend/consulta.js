const API_URL =
    "https://linehaul-chatbot.onrender.com";
    
async function carregarViagens() {

    const resposta =
        await fetch(
            `${API_URL}/consultas`
        );

    const viagens =
        await resposta.json();

    mostrarResultados(viagens);

}

    async function consultar() {

    const filtro =
        document
            .getElementById("filtro")
            .value
            .trim();

    if (!filtro) {

        alert(
            "Informe um valor para pesquisa."
        );

        return;

    }

    let url =
        `${API_URL}/consultas?nf=${filtro}`;

    let resposta =
        await fetch(url);

    let viagens =
        await resposta.json();

    if (viagens.length === 0) {

        url =
            `${API_URL}/consultas?placa=${filtro}`;

        resposta =
            await fetch(url);

        viagens =
            await resposta.json();

    }

    if (viagens.length === 0) {

        url =
            `${API_URL}/consultas?motorista=${filtro}`;

        resposta =
            await fetch(url);

        viagens =
            await resposta.json();

    }

    mostrarResultados(viagens);

}

function obterStatusTexto(status) {

    const statusMap = {
        1: "Início Carregamento",
        2: "Aguardando NF",
        3: "Saída",
        4: "Em Trânsito",
        5: "Chegada",
        6: "Início Descarga",
        7: "Fim Descarga",
        8: "Fim Conferência",
        9: "Finalizada"
    };

    return statusMap[status] || "Desconhecido";

}

function mostrarResultados(viagens) {

    const resultado =
        document.getElementById(
            "resultado"
        );

    resultado.innerHTML = "";

    if (!viagens.length) {

        resultado.innerHTML =
            "<p>Nenhuma viagem encontrada.</p>";

        return;

    }

    viagens.forEach(viagem => {

        resultado.innerHTML += `
            <div class="resultado-card">

                <p>
                    <b>Motorista:</b>
                    ${viagem.motorista || "-"}
                </p>

                <p>
                    <b>Placa:</b>
                    ${viagem.placa || "-"}
                </p>

                <p>
                    <b>CDD:</b>
                    ${viagem.cdd || "-"}
                </p>

                <p>
                    <b>NF:</b>
                    ${viagem.nf || "-"}
                </p>

                <p>
                    <b>Status:</b>
                    ${obterStatusTexto(
                        viagem.statusEtapa
                    )}
                </p>

                <button onclick="verDetalhes('${viagem._id}')">
                    Ver Detalhes
                </button>

            </div>
        `;

    });

}

async function verDetalhes(id) {

    const resposta =
        await fetch(
            `${API_URL}/movimentos/${id}`
        );

    const viagem =
        await resposta.json();

    document.getElementById(
        "detalhes"
    ).innerHTML = `

        <p><b>Motorista:</b>
        ${viagem.motorista || "-"}</p>

        <p><b>Placa:</b>
        ${viagem.placa || "-"}</p>

        <p><b>CDD:</b>
        ${viagem.cdd || "-"}</p>

        <p><b>NF:</b>
        ${viagem.nf || "-"}</p>

        <p><b>Status:</b>
        ${obterStatusTexto(
            viagem.statusEtapa
        )}</p>

        <hr>

        <p>✅ Início Carregamento:
        ${viagem.InicioCarregamento?.dataHora || "-"}</p>

        <p>✅ Fim Carregamento:
        ${viagem.FimCarregamento?.dataHora || "-"}</p>

        <p>✅ Saída:
        ${viagem.Saida?.dataHora || "-"}</p>

        <p>✅ Chegada:
        ${viagem.Chegada?.dataHora || "-"}</p>

        <p>✅ Início Descarga:
        ${viagem.InicioDescarga?.dataHora || "-"}</p>

        <p>✅ Fim Descarga:
        ${viagem.FimDescarga?.dataHora || "-"}</p>

        <p>✅ Fim Conferência:
        ${viagem.FimConferencia?.dataHora || "-"}</p>

        <p>✅ Retorno:
        ${viagem.Retorno?.dataHora || "-"}</p>

    `;

}

function exportarExcel() {

    window.open(
        `${API_URL}/exportar`,
        "_blank"
    );

}

carregarViagens();
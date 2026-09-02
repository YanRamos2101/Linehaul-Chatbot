const API_URL = "https://linehaul-chatbot.onrender.com";

// ====================================
// EXPORTAÇÃO EXCEL (a rota /exportar exige token)
// ====================================
const API_TOKEN = "SUA_CHAVE"; // MESMA chave do servidor e do script.js

async function exportarExcel() {
    try {
        const resposta = await fetch(`${API_URL}/exportar`, {
            headers: { "x-token": API_TOKEN }
        });

        if (!resposta.ok) {
            alert("Erro ao exportar. Verifique o token e tente novamente.");
            return;
        }

        const blob = await resposta.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "viagens.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (erro) {
        console.error("Erro ao exportar:", erro);
        alert("Falha de conexão ao exportar.");
    }
}

async function carregarViagens() {
    const resposta = await fetch(`${API_URL}/consultas`);
    const viagens = await resposta.json();
    mostrarResultados(viagens);
}

async function consultar() {
    const filtro = document.getElementById("filtro").value.trim();

    if (!filtro) {
        alert("Informe um valor para pesquisa.");
        return;
    }

    let url = `${API_URL}/consultas?nf=${filtro}`;
    let resposta = await fetch(url);
    let viagens = await resposta.json();

    if (viagens.length === 0) {
        url = `${API_URL}/consultas?placa=${filtro}`;
        resposta = await fetch(url);
        viagens = await resposta.json();
    }

    if (viagens.length === 0) {
        url = `${API_URL}/consultas?motorista=${filtro}`;
        resposta = await fetch(url);
        viagens = await resposta.json();
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
        9: "Retornando",
        10: "Finalizada",
    };
    return statusMap[status] || "Desconhecido";
}

function mostrarResultados(viagens) {
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "";

    if (!viagens.length) {
        resultado.innerHTML = "<p>Nenhuma viagem encontrada.</p>";
        return;
    }

    viagens.forEach(viagem => {
        resultado.innerHTML += `
            <div class="resultado-card">
                <p><b>Motorista:</b> ${escaparHTML(viagem.motorista || "-")}</p>
                <p><b>Placa:</b> ${escaparHTML(viagem.placa || "-")}</p>
                <p><b>CDD:</b> ${escaparHTML(viagem.cdd || "-")}</p>
                <p><b>NF:</b> ${escaparHTML(viagem.nf || "-")}</p>
                <p><b>Status:</b> ${obterStatusTexto(viagem.statusEtapa)}</p>
                ${viagem.ehRecarga ? '<p class="recarga-badge">🔁 Recarga</p>' : ''}

                <button onclick="verDetalhes('${escaparHTML(viagem._id)}')">
                    Ver Detalhes
                </button>

                <div id="detalhes-${escaparHTML(viagem._id)}" class="detalhes-card"></div>
            </div>
        `;
    });
}

let detalheAberto = null;

async function verDetalhes(id) {
    const container = document.getElementById(`detalhes-${id}`);

    if (detalheAberto && detalheAberto !== container) {
        detalheAberto.classList.remove("aberto");
        setTimeout(() => {
            detalheAberto.innerHTML = "";
        }, 400);
    }

    if (container === detalheAberto) {
        container.classList.remove("aberto");
        setTimeout(() => {
            container.innerHTML = "";
        }, 400);
        detalheAberto = null;
        return;
    }

    const resposta = await fetch(`${API_URL}/movimentos/${id}`);
    const viagem = await resposta.json();

    container.innerHTML = `
        <p>✅ Início Carregamento:
        ${escaparHTML(viagem.InicioCarregamento?.dataHora || "-")}</p>

        <p>✅ Fim Carregamento:
        ${escaparHTML(viagem.FimCarregamento?.dataHora || "-")}</p>

        <p>✅ Saída:
        ${escaparHTML(viagem.Saida?.dataHora || "-")}</p>

        <p>✅ Chegada:
        ${escaparHTML(viagem.Chegada?.dataHora || "-")}</p>

        <p>✅ Início Descarga:
        ${escaparHTML(viagem.InicioDescarga?.dataHora || "-")}</p>

        <p>✅ Fim Descarga:
        ${escaparHTML(viagem.FimDescarga?.dataHora || "-")}</p>

        <p>✅ Fim Conferência:
        ${escaparHTML(viagem.FimConferencia?.dataHora || "-")}</p>

        <p>✅ Retorno:
        ${escaparHTML(viagem.Retorno?.dataHora || "-")}</p>

        <p>
        <b>Observação:</b>
        ${escaparHTML(viagem.observacao || "Sem observações")}
        </p>

        ${viagem.foto
            ? `<p><b>📷 Foto do produto:</b></p>
               <img src="${viagem.foto}" style="max-width:200px; border-radius:8px" alt="Foto do produto">`
            : ""}
    `;

    container.classList.add("aberto");
    detalheAberto = container;
}

// Carrega TODAS as viagens ao abrir a página
carregarViagens();
// ====================================
// DADOS
// ====================================

let aguardandoNF =
    JSON.parse(
        localStorage.getItem(
            "aguardandoNF"
        )
    ) || false;
let viagem =
    JSON.parse(localStorage.getItem("viagem")) || {};

let etapa =
    parseInt(localStorage.getItem("etapaCadastro")) || 0;

let statusEtapa =
    parseInt(localStorage.getItem("statusEtapa")) || 1;

const chat =
    document.getElementById("chat");

async function obterLocalizacao() {

    return new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(

            (posicao) => {

                resolve({
                    latitude: posicao.coords.latitude,
                    longitude: posicao.coords.longitude
                });

            },

            (erro) => {

                reject(erro);

            },

            {
                enableHighAccuracy: true
            }

        );

    });

}
// ====================================
// CHAT
// ====================================

function bot(msg) {

    chat.innerHTML += `
        <div class="bot">${msg}</div>
    `;

    chat.scrollTop = chat.scrollHeight;
}

function user(msg) {

    chat.innerHTML += `
        <div class="user">${msg}</div>
    `;

    chat.scrollTop = chat.scrollHeight;
}

// ====================================
// SALVAR
// ====================================

function salvarLocal() {

    localStorage.setItem(
        "viagem",
        JSON.stringify(viagem)
    );

    localStorage.setItem(
        "statusEtapa",
        statusEtapa
    );

    localStorage.setItem(
        "etapaCadastro",
        etapa
    );
}

const API_URL =
    "https://linehaul-chatbot.onrender.com";

// ====================================
// BOTÃO ETAPA
// ====================================

function atualizarBotao() {

    const botao =
        document.getElementById("btnEtapa");

    switch (statusEtapa) {

        case 1:
            botao.innerText =
                "INÍCIO CARREGAMENTO";
            break;

        case 2:
            botao.innerText =
                "FIM CARREGAMENTO";
            break;

        case 3:
            botao.innerText =
                "SAÍDA";
            break;

        case 4:
            botao.innerText =
                "CHEGADA";
            break;

        case 5:
            botao.innerText =
                "INÍCIO DESCARGA";
            break;

        case 6:
            botao.innerText =
                "FIM DESCARGA";
            break;

        case 7:
            botao.innerText =
                "FIM CONFERÊNCIA";
            break;

        case 8:
            botao.innerText =
                "RETORNO";
            break;

        default:
            botao.innerText =
                "VIAGEM FINALIZADA";
    }
}

// ====================================
// MOSTRAR ETAPA
// ====================================

function mostrarEtapaAtual() {

    switch (statusEtapa) {

        case 1:
            bot("📦 Próxima etapa: INÍCIO CARREGAMENTO");
            break;

        case 2:
            bot("📦 Próxima etapa: FIM CARREGAMENTO");
            break;

        case 3:
            bot("📦 Próxima etapa: SAÍDA");
            break;

        case 4:
            bot("📦 Próxima etapa: CHEGADA");
            break;

        case 5:
            bot("📦 Próxima etapa: INÍCIO DESCARGA");
            break;

        case 6:
            bot("📦 Próxima etapa: FIM DESCARGA");
            break;

        case 7:
            bot("📦 Próxima etapa: FIM CONFERÊNCIA");
            break;

        case 8:
            bot("📦 Próxima etapa: RETORNO");
            break;

        default:
            bot("✅ Viagem finalizada.");
    }
}

// ====================================
// ENVIO
// ====================================

function sendMessage() {

    let texto =
        document.getElementById("userInput").value;

    if (texto.trim() === "") {

        switch (etapa) {

            case 0:
                bot("⚠️ Informe o motorista.");
                break;

            case 1:
                bot("⚠️ Informe a placa.");
                break;

            case 2:
                bot("⚠️ Informe o CDD.");
                break;

            case 3:
                bot("⚠️ Informe a NF.");
                break;

            default:
                bot("⚠️ Digite uma informação.");
        }

        return;
    }

    user(texto);

    document.getElementById("userInput").value = "";

    if (aguardandoNF) {

        viagem.nf = texto.trim();

        aguardandoNF = false;

        localStorage.setItem(
            "aguardandoNF",
            false
        );

        statusEtapa = 3;

        salvarLocal();

        bot(
            "✅ NF registrada: " +
            viagem.nf
        );

        atualizarBotao();

        mostrarEtapaAtual();

        return;
    }
    processar(texto);
}

// ====================================
// CADASTRO
// ====================================

function processar(texto) {

    switch (etapa) {

        case 0:

            viagem.motorista = texto;

            etapa++;

            salvarLocal();

            bot("🚚 Informe a placa:");

            break;

        case 1:

            viagem.placa = texto;

            etapa++;

            salvarLocal();

            bot("📍 Informe o CDD:");

            break;

        case 2:

            viagem.cdd = texto;

            etapa = 4;

            salvarLocal();

            bot("✅ Viagem criada!");

            bot("Agora utilize o botão da etapa.");

            document.getElementById("btnEtapa")
                .style.display = "block";

            atualizarBotao();

            mostrarEtapaAtual();

            break;

    }
}

// ====================================
// ETAPAS
// ====================================

async function registrarEtapa() {
    const localizacao =
        await obterLocalizacao();

    switch (statusEtapa) {

        case 1:

            viagem.InicioCarregamento = {
                dataHora: new Date().toLocaleString()
            };
            bot("✅ Início Carregamento registrado");

            statusEtapa = 2;

            break;

        case 2:

            viagem.FimCarregamento = {
                dataHora: new Date().toLocaleString()
            };

            salvarLocal();

            aguardandoNF = true;

            localStorage.setItem(
                "aguardandoNF",
                true
            );

            bot("✅ Fim Carregamento registrado");

            bot("📦 Informe a NF para continuar:");

            return;
        case 3:

            viagem.Saida = {
                dataHora: new Date().toLocaleString(),
                latitude: localizacao.latitude,
                longitude: localizacao.longitude
            };
            bot("✅ Saída registrada");

            statusEtapa = 4;

            break;

        case 4:

            viagem.Chegada = {
                dataHora: new Date().toLocaleString(),
                latitude: localizacao.latitude,
                longitude: localizacao.longitude
            };
            bot("✅ Chegada registrada");

            statusEtapa = 5;

            break;

        case 5:

            viagem.InicioDescarga = {
                dataHora: new Date().toLocaleString()
            };
            bot("✅ Início Descarga registrado");

            statusEtapa = 6;

            break;

        case 6:

            viagem.FimDescarga = {
                dataHora: new Date().toLocaleString()
            };
            bot("✅ Fim Descarga registrada");

            statusEtapa = 7;

            break;

        case 7:

            viagem.FimConferencia = {
                dataHora: new Date().toLocaleString()
            };
            bot("✅ Fim Conferência registrada");

            statusEtapa = 8;

            break;

        case 8:

            viagem.Retorno = {
                dataHora: new Date().toLocaleString(),
                latitude: localizacao.latitude,
                longitude: localizacao.longitude
            };
            statusEtapa = 9;

            viagem.statusEtapa = 9;

            await salvarMongo();

            novaViagem();

            return;

        default:

            bot("✅ Viagem já finalizada.");
    }

    if (statusEtapa < 9) {

        salvarLocal();

        atualizarBotao();

    }
}

async function buscarViagem(nf) {

    try {

        const resposta = await fetch(
            `${API_URL}/movimentos/nf/${nf}`
        );

        if (!resposta.ok) {
            return null;
        }

        return await resposta.json();

    } catch (erro) {

        console.error(erro);

        return null;
    }
}

function recuperarCadastro() {

    switch (etapa) {

        case 0:

            bot("🚚 Bem-vindo ao Fulfillment Linehaul");
            bot("👤 Informe o nome do motorista:");
            break;

        case 1:

            bot("✅ Motorista já informado");
            bot("🚚 Informe a placa:");
            break;

        case 2:

            bot("✅ Motorista já informado");
            bot("✅ Placa já informada");
            bot("📍 Informe o CDD:");
            break;

        case 3:

            bot("✅ Motorista já informado");
            bot("✅ Placa já informada");
            bot("✅ CDD já informado");
            bot("📦 Informe a NF:");
            break;

        default:

            document.getElementById("btnEtapa")
                .style.display = "block";

            atualizarBotao();

            mostrarEtapaAtual();
    }
}

// ====================================
// INICIALIZAÇÃO
// ====================================

if (etapa < 3) {

    document.getElementById("btnEtapa")
        .style.display = "none";

    recuperarCadastro();

} else {

    document.getElementById("btnEtapa")
        .style.display = "block";

    bot("🚚 Viagem recuperada");

    bot(
        "👤 Motorista: " +
        viagem.motorista
    );

    atualizarBotao();

    mostrarEtapaAtual();
}

    if (aguardandoNF) {

        bot(
            "📦 Informe a NF para continuar:"
        );

    }

// ====================================
// SALVAR NO MONGODB
// ====================================

async function salvarMongo() {

    console.log("salvarMongo FOI CHAMADO");

    try {

        console.log("ENVIANDO:", viagem);

        const resposta = await fetch(
            `${API_URL}/movimentos`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(viagem)
            }
        );

        console.log("STATUS:", resposta.status);

        const resultado =
            await resposta.json();

        console.log(
            "✅ Viagem salva no MongoDB",
            resultado
        );

    } catch (erro) {

        console.error(
            "❌ Erro ao salvar no MongoDB",
            erro
        );

    }
}

function novaViagem() {

    alert("NOVA VIAGEM CHAMADA");

    localStorage.clear();

    alert("LOCAL STORAGE LIMPO");

    console.log("INICIOU NOVA VIAGEM");

    localStorage.clear();

    console.log("LOCALSTORAGE LIMPO");

    viagem = {};
    etapa = 0;
    statusEtapa = 1;

    chat.innerHTML = "";

    document.getElementById("userInput").value = "";

    document.getElementById("btnEtapa").style.display = "none";

    bot("🚚 Bem-vindo ao Fulfillment Linehaul");
    bot("👤 Informe o nome do motorista");
}



console.log("✅ script.js carregado");
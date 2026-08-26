// ====================================
// DADOS
// ====================================

let aguardandoObservacao =
    JSON.parse(
        localStorage.getItem("aguardandoObservacao")
    ) || false;

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

// MODAL

function abrirModal() {

    const etapaAtual =
        document.getElementById("btnEtapa")
            .innerText;

    document.getElementById(
        "textoConfirmacao"
    ).innerText =
        `Deseja registrar a etapa "${etapaAtual}"?`;

    document
        .getElementById("modalConfirmacao")
        .classList.add("ativo");
}

function fecharModal() {

    document
        .getElementById("modalConfirmacao")
        .classList.remove("ativo");
}

// ====================================
// CDD (OPÇÕES FIXAS)
// ====================================
const CDDS_VALIDOS = ["NIT", "PAV", "CTO", "CGR"];

function mostrarOpcoesCDD() {
    const botoes = CDDS_VALIDOS.map(
        (cdd) =>
            `<button class="opcao-cdd" onclick="selecionarCDD('${cdd}')">${cdd}</button>`
    ).join("");
    chat.innerHTML += `<div class="bot opcoes-cdd">${botoes}</div>`;
    chat.scrollTop = chat.scrollHeight;
}

function selecionarCDD(cdd) {
    user("📍 CDD: " + cdd);
    registrarCDD(cdd);
}

async function registrarCDD(cdd) {
    viagem.cdd = cdd;
    etapa = 4;
    salvarLocal();
    await criarViagemMongo();
    bot("✅ Viagem criada com CDD " + cdd + "!");
    bot("Agora utilize o botão da etapa.");
    document.getElementById("btnEtapa").style.display = "block";
    atualizarBotao();
    mostrarEtapaAtual();
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
                "INFORMAR OBSERVAÇÃO";
            break;

        case 9:
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
            bot("📝 Aguardando observação da viagem");
            break;

        case 9:
            bot("📦 Próxima etapa: RETORNO");
            break;


        default:
            bot("✅ Viagem finalizada.");
    }
}


// ====================================
// ENVIO
// ====================================

async function sendMessage() {

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

        viagem.statusEtapa = 3;

        salvarLocal();

        await atualizarMongo();

        bot(
            "✅ NF registrada: " +
            viagem.nf
        );

        atualizarBotao();

        mostrarEtapaAtual();

        return;
    }
    if (aguardandoObservacao) {

        viagem.observacao =
            texto.trim() || "Sem observações";
        console.log("OBS:", viagem.observacao);


        aguardandoObservacao = false;

        localStorage.setItem(
            "aguardandoObservacao",
            false
        );

        statusEtapa = 9;

        viagem.statusEtapa = 9;

        salvarLocal();

        await atualizarMongo();

        bot("✅ Observação registrada.");

        atualizarBotao();

        mostrarEtapaAtual();

        return;
    }
    processar(texto);
}

// ====================================
// CADASTRO
// ====================================

async function processar(texto) {

    switch (etapa) {

       case 0:
            viagem.motorista = texto.trim();
            etapa++;
            salvarLocal();
            bot("🚚 Informe a placa:");
            break;
        case 1:
            viagem.placa = texto.trim().toUpperCase();
            etapa++;
            salvarLocal();
            bot("📍 Selecione o CDD:");
            mostrarOpcoesCDD();
            break;
        case 2:
            const cdd = texto.trim().toUpperCase();
            if (!CDDS_VALIDOS.includes(cdd)) {
                bot("⚠️ CDD inválido. Selecione uma das opções:");
                mostrarOpcoesCDD();
                break;
            }
            await registrarCDD(cdd);
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

            viagem.statusEtapa = 2;

            statusEtapa = 2;

            salvarLocal();

            await atualizarMongo();

            bot("✅ Início Carregamento registrado");

            break;
        case 2:

            viagem.FimCarregamento = {
                dataHora: new Date().toLocaleString()
            };

            viagem.statusEtapa = 2;

            salvarLocal();

            await atualizarMongo();

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

            statusEtapa = 4;

            viagem.statusEtapa = 4;

            salvarLocal();

            await atualizarMongo();

            bot("✅ Saída registrada");

            break;

        case 4:

            viagem.Chegada = {
                dataHora: new Date().toLocaleString(),
                latitude: localizacao.latitude,
                longitude: localizacao.longitude
            };

            statusEtapa = 5;

            viagem.statusEtapa = 5;

            salvarLocal();

            await atualizarMongo();

            bot("✅ Chegada registrada");

            break;

        case 5:

            viagem.InicioDescarga = {
                dataHora: new Date().toLocaleString()
            };

            statusEtapa = 6;

            viagem.statusEtapa = 6;

            salvarLocal();

            await atualizarMongo();

            bot("✅ Início Descarga registrado");

            break;

        case 6:

            viagem.FimDescarga = {
                dataHora: new Date().toLocaleString()
            };

            statusEtapa = 7;

            viagem.statusEtapa = 7;

            salvarLocal();

            await atualizarMongo();

            bot("✅ Fim Descarga registrada");

            break;

        case 7:

            viagem.FimConferencia = {
                dataHora: new Date().toLocaleString()
            };

            viagem.statusEtapa = 8;

            statusEtapa = 8;

            salvarLocal();

            await atualizarMongo();

            aguardandoObservacao = true;

            localStorage.setItem(
                "aguardandoObservacao",
                true
            );

            bot("✅ Fim Conferência registrada");

            bot("📝 Alguma observação sobre a viagem?");

            return;

        case 9:

            viagem.Retorno = {
                dataHora: new Date().toLocaleString(),
                latitude: localizacao.latitude,
                longitude: localizacao.longitude
            };

            statusEtapa = 10;

            viagem.statusEtapa = 10;

            salvarLocal();

            await atualizarMongo();

            bot("✅ Retorno registrado");

            bot("✅ Viagem finalizada");

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

//WRAPPER

async function confirmarEtapa() {

    fecharModal();

    await registrarEtapa();

}

// ====================================
// INICIALIZAÇÃO
// ====================================



async function inicializarSistema() {

    if (viagem._id) {

        await recuperarViagemMongo();

    }

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

    if (aguardandoObservacao) {

    bot(
        "📝 Alguma observação sobre a viagem?"
    );

}

}

inicializarSistema();

// ====================================
// SALVAR NO MONGODB
// ====================================

async function criarViagemMongo() {

    try {

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

        const resultado =
            await resposta.json();

        if (
            resultado.sucesso &&
            resultado.dados &&
            resultado.dados._id
        ) {

            viagem._id =
                resultado.dados._id;

            salvarLocal();

            console.log(
                "✅ Viagem criada no MongoDB",
                viagem._id
            );

        }

    } catch (erro) {

        console.error(
            "❌ Erro ao criar viagem",
            erro
        );

    }

}

async function atualizarMongo() {

    try {

        if (!viagem._id) {

            console.error(
                "❌ Viagem sem _id"
            );

            return;

        }

        const resposta = await fetch(
            `${API_URL}/movimentos/${viagem._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(viagem)
            }
        );

        const resultado =
            await resposta.json();

        console.log(
            "✅ Viagem atualizada",
            resultado
        );

    } catch (erro) {

        console.error(
            "❌ Erro ao atualizar viagem",
            erro
        );

    }

}

async function recuperarViagemMongo() {

    try {

        if (!viagem._id) {

            return null;

        }

        const resposta = await fetch(
            `${API_URL}/movimentos/${viagem._id}`
        );

        if (!resposta.ok) {

            return null;

        }

        const dados =
            await resposta.json();

        viagem = dados;

        if (viagem.statusEtapa) {

            statusEtapa =
                viagem.statusEtapa;

        }
        
        if (
            viagem.motorista &&
            viagem.placa &&
            viagem.cdd
        ) {

            etapa = 4;

        }

        if (
            viagem.FimCarregamento &&
            !viagem.nf
        ) {

            aguardandoNF = true;

            localStorage.setItem(
                "aguardandoNF",
                true
            );

        } else {

            aguardandoNF = false;

            localStorage.setItem(
                "aguardandoNF",
                false
            );

        }

        if (
            viagem.statusEtapa === 8 &&
            !viagem.observacao
        ) {

            aguardandoObservacao = true;

            localStorage.setItem(
                "aguardandoObservacao",
                true
            );

        } else {

            aguardandoObservacao = false;

            localStorage.setItem(
                "aguardandoObservacao",
                false
            );
        }

        salvarLocal();

        console.log(
            "✅ Viagem recuperada do MongoDB",
            viagem
        );

        return viagem;

    } catch (erro) {

        console.error(
            "❌ Erro ao recuperar viagem",
            erro
        );

        return null;

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
const mongoose = require("mongoose");

// statusEtapa:
// 1  = Início Carregamento
// 2  = Fim Carregamento (aguardando NF)
// 3  = Saída
// 4  = Chegada
// 5  = Início Descarga
// 6  = Fim Descarga
// 7  = Fim Conferência
// 8  = Aguardando observação
// 9  = Retorno
// 10 = Finalizada

const etapaSchema = new mongoose.Schema(
    {
        dataHora: {
            type: String,
            default: null
        },
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        }
    },
    { _id: false }
);

const movimentoSchema = new mongoose.Schema(
    {
        motorista: {
            type: String,
            required: true
        },
        placa: {
            type: String,
            required: true
        },
        cdd: {
            type: String,
            required: true
        },
        nf: {
            type: String,
            default: null
        },
        InicioCarregamento: {
            type: etapaSchema,
            default: null
        },
        FimCarregamento: {
            type: etapaSchema,
            default: null
        },
        Saida: {
            type: etapaSchema,
            default: null
        },
        Chegada: {
            type: etapaSchema,
            default: null
        },
        InicioDescarga: {
            type: etapaSchema,
            default: null
        },
        FimDescarga: {
            type: etapaSchema,
            default: null
        },
        FimConferencia: {
            type: etapaSchema,
            default: null
        },
        Retorno: {
            type: etapaSchema,
            default: null
        },
        statusEtapa: {
            type: Number,
            default: 1
        },
        observacao: {
            type: String,
            default: null
        },
        // 🔁 Marca viagens que são recarga (2ª+ viagem para o mesmo CDD no mesmo dia)
        ehRecarga: {
            type: Boolean,
            default: false
        },
        criadoEm: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Movimento", movimentoSchema);
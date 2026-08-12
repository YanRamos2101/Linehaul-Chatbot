const mongoose = require("mongoose");

const EtapaSchema = {

    dataHora: String,

    latitude: Number,

    longitude: Number
};

const MovimentoSchema = new mongoose.Schema({

    motorista: String,

    placa: String,

    cdd: String,

    nf: String,

    InicioCarregamento: EtapaSchema,

    FimCarregamento: EtapaSchema,

    Saida: EtapaSchema,

    Chegada: EtapaSchema,

    InicioDescarga: EtapaSchema,

    FimDescarga: EtapaSchema,

    FimConferencia: EtapaSchema,

    Retorno: EtapaSchema,

    statusEtapa: Number,

    aguardandoObservacao: {
        type: String,
        default: ""
    },

    criadoEm: {
        type: Date,
        default: Date.now
    }

});

module.exports =
    mongoose.model(
        "Movimento",
        MovimentoSchema
    );
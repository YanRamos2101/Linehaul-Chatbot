const mongoose = require("mongoose");

const MovimentoSchema =
new mongoose.Schema({

    motorista: String,
    placa: String,
    cdd: String,
    nf: String,

    InicioCarregamento: String,
    FimCarregamento: String,

    Saida: String,
    Chegada: String,

    InicioDescarga: String,
    FimDescarga: String,

    FimConferencia: String,

    Retorno: String,

    criadoEm: {
        type: Date,
        default: Date.now
    }

});

module.exports =
    mongoose.models.Movimento ||
    mongoose.model(
        "Movimento",
        MovimentoSchema
    );
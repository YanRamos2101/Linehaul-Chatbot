const path = require("path");

require("dotenv").config({
    path: path.join(
        __dirname,
        "..",
        "atlas.env"
    )
});

console.log(process.env);
const mongoose = require("mongoose");

const Movimento =
    require("../models/movimento");

const dados =
    require("../data/historico.json");

async function importar() {

    try {

        console.log(
            "URI Mongo:",
            process.env.MONGODB_URI
                ? "✅ encontrada"
                : "❌ não encontrada"
        );

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "✅ Mongo conectado"
        );

        console.log(
            `📦 ${dados.length} viagens encontradas`
        );

        const resultado =
            await Movimento.insertMany(
                dados,
                {
                    ordered: false
                }
            );

        console.log(
            `✅ ${resultado.length} viagens importadas`
        );

        process.exit(0);

    } catch (erro) {

        console.error(
            "❌ Erro na importação:"
        );

        console.error(erro);

        process.exit(1);

    }

}

console.log(
    "Total de viagens:",
    dados.length
);

console.log(
    "Primeiro registro:"
);

console.log(
    JSON.stringify(
        dados[0],
        null,
        2
    )
);

importar();
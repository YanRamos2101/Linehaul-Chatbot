require('dotenv').config({
    path: './atlas.env'
});

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Movimento = require("./models/Movimento");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB conectado");
    })
    .catch((err) => {
        console.error("❌ Erro ao conectar:", err);
    });

app.get("/", (req, res) => {
    res.send("API funcionando!");
});

app.post("/movimentos", async (req, res) => {

    try {

        const movimento =
            await Movimento.create(req.body);

        res.status(201).json({
            sucesso: true,
            dados: movimento
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            sucesso: false,
            erro: erro.message
        });

    }

});

app.get("/movimentos", async (req, res) => {

    const movimentos =
        await Movimento.find()
            .sort({ criadoEm: -1 });

    res.json(movimentos);

});

app.get(
    "/movimentos/nf/:nf",
    async (req, res) => {

        try {

            const viagem =
                await Movimento.findOne({
                    nf: req.params.nf
                });

            res.json(viagem);

        } catch (erro) {

            res.status(500).json({
                erro: erro.message
            });
        }
    }
);


app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(
        `🚀 Servidor rodando na porta ${process.env.PORT}`
    );
});
console.log(process.env.PORT);
console.log(process.env.MONGODB_URI);
require('dotenv').config({
    path: './atlas.env'
});

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ExcelJS = require("exceljs");
const Movimento = require("./models/movimento");
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


app.get("/movimentos/:id", async (req, res) => {

    try {

        const movimento =
            await Movimento.findById(
                req.params.id
            );

        if (!movimento) {

            return res.status(404).json({
                sucesso: false,
                erro: "Viagem não encontrada"
            });

        }

        res.json(movimento);

    } catch (erro) {

        res.status(500).json({
            sucesso: false,
            erro: erro.message
        });

    }

});

app.put("/movimentos/:id", async (req, res) => {

    try {

        const movimento =
            await Movimento.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            );

        if (!movimento) {

            return res.status(404).json({
                sucesso: false,
                erro: "Viagem não encontrada"
            });

        }

        res.json({
            sucesso: true,
            dados: movimento
        });

    } catch (erro) {

        res.status(500).json({
            sucesso: false,
            erro: erro.message
        });

    }

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

app.get("/consultas", async (req, res) => {

    try {

        const filtro = {};

        if (req.query.nf) {
            filtro.nf = req.query.nf;
        }

        if (req.query.placa) {
            filtro.placa = req.query.placa;
        }

        if (req.query.motorista) {
            filtro.motorista = new RegExp(
                req.query.motorista,
                "i"
            );
        }

        const viagens =
            await Movimento.find(filtro)
                .sort({ criadoEm: -1 });

        res.json(viagens);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.get("/exportar", async (req, res) => {

    try {

        const viagens =
            await Movimento.find()
                .sort({ criadoEm: -1 });

        const workbook =
            new ExcelJS.Workbook();

        const sheet =
            workbook.addWorksheet(
                "Viagens"
            );

        sheet.columns = [

            {
                header: "Motorista",
                key: "motorista",
                width: 25
            },

            {
                header: "Placa",
                key: "placa",
                width: 15
            },

            {
                header: "CDD",
                key: "cdd",
                width: 15
            },

            {
                header: "NF",
                key: "nf",
                width: 15
            },

            {
                header: "Status",
                key: "statusEtapa",
                width: 20
            },

            {
                header: "Início Carregamento",
                key: "inicio",
                width: 25
            },

            {
                header: "Fim Carregamento",
                key: "fim",
                width: 25
            },

            {
                header: "Saída",
                key: "saida",
                width: 25
            },

            {
                header: "Chegada",
                key: "chegada",
                width: 25
            },

            {
                header: "Retorno",
                key: "retorno",
                width: 25
            }

        ];

        viagens.forEach(v => {

            sheet.addRow({

                motorista: v.motorista,

                placa: v.placa,

                cdd: v.cdd,

                nf: v.nf,

                statusEtapa: v.statusEtapa,

                inicio:
                    v.InicioCarregamento?.dataHora,

                fim:
                    v.FimCarregamento?.dataHora,

                saida:
                    v.Saida?.dataHora,

                chegada:
                    v.Chegada?.dataHora,

                retorno:
                    v.Retorno?.dataHora

            });

        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=viagens.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(
        `🚀 Servidor rodando na porta ${process.env.PORT}`
    );
});
console.log(process.env.PORT);
console.log(process.env.MONGODB_URI);
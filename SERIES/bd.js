const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Criar uma conexão com o banco de dados SQLite
const db = new sqlite3.Database('series.db');

// Criar a tabela se ela não existir
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS series (id INTEGER PRIMARY KEY, nome TEXT, genero TEXT, temporadas INTEGER, anoLancamento INTEGER, rating REAL)");

    // Inserir séries iniciais (se a tabela estiver vazia)
    db.get("SELECT count(*) as count FROM series", (err, row) => {
        if (row.count === 0) {
            const initialSeries = [
                ['Breaking Bad', 'Drama', 5, 2008, 9.5],
                ['Stranger Things', 'Ficção Científica', 4, 2016, 8.7],
                // Adicione mais séries conforme necessário
            ];

            const stmt = db.prepare("INSERT INTO series (nome, genero, temporadas, anoLancamento, rating) VALUES (?, ?, ?, ?, ?)");

            initialSeries.forEach(serie => {
                stmt.run(serie);
            });

            stmt.finalize();
        }
    });
});

// Operação de Listar Todas as Séries
app.get('/series', (req, res) => {
    db.all("SELECT * FROM series", (err, rows) => {
        if (err) {
            res.status(500).send('Erro ao listar séries');
        } else {
            res.json(rows);
        }
    });
});

// Operação de Obter uma Série por ID
app.get('/series/:id', (req, res) => {
    const serieId = req.params.id;
    db.get("SELECT * FROM series WHERE id = ?", [serieId], (err, row) => {
        if (err) {
            res.status(500).send('Erro ao obter a série');
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).send('Série não encontrada');
        }
    });
});

// Operação de Adicionar uma Nova Série
app.post('/series', (req, res) => {
    const newSerie = req.body;
    const stmt = db.prepare("INSERT INTO series (nome, genero, temporadas, anoLancamento, rating) VALUES (?, ?, ?, ?, ?)");

    stmt.run(newSerie.nome, newSerie.genero, newSerie.temporadas, newSerie.anoLancamento, newSerie.rating, function (err) {
        if (err) {
            res.status(500).send('Erro ao adicionar a série');
        } else {
            res.json({ id: this.lastID, ...newSerie });
        }
    });

    stmt.finalize();
});

// Operação de Atualizar uma Série por ID
app.put('/series/:id', (req, res) => {
    const serieId = req.params.id;
    const updatedSerie = req.body;

    db.run("UPDATE series SET nome=?, genero=?, temporadas=?, anoLancamento=?, rating=? WHERE id=?",
        [updatedSerie.nome, updatedSerie.genero, updatedSerie.temporadas, updatedSerie.anoLancamento, updatedSerie.rating, serieId],
        (err) => {
            if (err) {
                res.status(500).send('Erro ao atualizar a série');
            } else {
                res.json(updatedSerie);
            }
        });
});

// Operação de Remover uma Série por ID
app.delete('/series/:id', (req, res) => {
    const serieId = req.params.id;

    db.run("DELETE FROM series WHERE id=?", [serieId], (err) => {
        if (err) {
            res.status(500).send('Erro ao remover a série');
        } else {
            res.send(`Série com ID ${serieId} removida`);
        }
    });
});

// Consumir a API com Axios (Testes Manuais)
axios.get('http://localhost:3000/series')
    .then(response => {
        console.log('Lista de Séries:', response.data);
    })
    .catch(error => {
        console.error('Erro ao obter a lista de séries:', error.message);
    });

// Definir a porta para o servidor express
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Criar uma conexão com o banco de dados SQLite (comando: npm install sqlite3)
const db = new sqlite3.Database('series.db');

// Criar a tabela se ela não existir,mas parece n estar certo
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS series (id INTEGER PRIMARY KEY, nome TEXT, genero TEXT, temporadas INTEGER, anoLancamento INTEGER, rating REAL)");

    // Séries iniciais (se a tabela estiver vazia, mas tbm para ter mais volume)
    db.get("SELECT count(*) as count FROM series", (err, row) => {
        if (row.count === 0) {
            const initialSeries = [
                ['Breaking Bad', 'Drama', 5, 2008, 9.5],
                ['Stranger Things', 'Ficção Científica', 4, 2016, 8.7],
                ['Breaking Bad', 'Drama', 5, 2008, 9.5 ],
                ['Stranger Things', 'Ficção Científica', 4, 2016, 8.7 ],
                ['The Mandalorian','Ação, Aventura, Fantasia', 3, 2019,  8.7 ],
                ['Black Mirror','Drama, Ficção Científica, Thriller', 5,  2011, 8.8 ],
                ['Game of Thrones', 'Ação, Aventura, Drama',  8, 2011,  9.3 ],
                ['The Witcher', 'Ação, Aventura, Drama',  2, 2019, 8.2 ],
                ['Friends','Comédia, Romance', 10, 1994, 8.9 ],
                ['Narcos', 'Biografia, Crime, Drama', 3, 2015, 8.8 ],
                ['Westworld', 'Drama, Ficção Científica, Mistério', 3, 2016, 8.6 ],
                ['The Office','Comédia', 9, 2005, 8.9 ],
                ['Sherlock', 'Crime, Drama, Mistério', 4, 2010,  9.1 ],
                ['Mindhunter', 'Crime, Drama, Thriller', 2, 2017,  8.6 ],
                ['The Crown', 'Biografia, Drama, História', 6,  2016, 8.6 ],
                ['Dexter', 'Crime, Drama, Mistério', 8, 2006, 8.6 ],
                ['The Umbrella Academy', 'Ação, Aventura, Comédia', 3, 2019, 8.0 ],
                ['Chernobyl', 'Drama, História, Thriller', 1, 2019, 9.4 ],
                ['Peaky Blinders', 'Crime, Drama', 6, 2013, 8.8 ],
                ['The Simpsons', 'Animação, Comédia', 33, 1989, 8.6 ],
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

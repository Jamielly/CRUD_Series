const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

let seriesData = [
    { id: 1, nome: 'Breaking Bad', genero: 'Drama', temporadas: 5, anoLancamento: 2008, rating: 9.5 },
    { id: 2, nome: 'Stranger Things', genero: 'Ficção Científica', temporadas: 4, anoLancamento: 2016, rating: 8.7 },
    { id: 3, nome: 'The Mandalorian', genero: 'Ação, Aventura, Fantasia', temporadas: 3, anoLancamento: 2019, rating: 8.7 },
    { id: 4, nome: 'Black Mirror', genero: 'Drama, Ficção Científica, Thriller', temporadas: 5, anoLancamento: 2011, rating: 8.8 },
    { id: 5, nome: 'Game of Thrones', genero: 'Ação, Aventura, Drama', temporadas: 8, anoLancamento: 2011, rating: 9.3 },
    { id: 6, nome: 'The Witcher', genero: 'Ação, Aventura, Drama', temporadas: 2, anoLancamento: 2019, rating: 8.2 },
    { id: 7, nome: 'Friends', genero: 'Comédia, Romance', temporadas: 10, anoLancamento: 1994, rating: 8.9 },
    { id: 8, nome: 'Narcos', genero: 'Biografia, Crime, Drama', temporadas: 3, anoLancamento: 2015, rating: 8.8 },
    { id: 9, nome: 'Westworld', genero: 'Drama, Ficção Científica, Mistério', temporadas: 3, anoLancamento: 2016, rating: 8.6 },
    { id: 10, nome: 'The Office', genero: 'Comédia', temporadas: 9, anoLancamento: 2005, rating: 8.9 },
    { id: 11, nome: 'Sherlock', genero: 'Crime, Drama, Mistério', temporadas: 4, anoLancamento: 2010, rating: 9.1 },
    { id: 12, nome: 'Mindhunter', genero: 'Crime, Drama, Thriller', temporadas: 2, anoLancamento: 2017, rating: 8.6 },
    { id: 13, nome: 'The Crown', genero: 'Biografia, Drama, História', temporadas: 6, anoLancamento: 2016, rating: 8.6 },
    { id: 14, nome: 'Dexter', genero: 'Crime, Drama, Mistério', temporadas: 8, anoLancamento: 2006, rating: 8.6 },
    { id: 15, nome: 'The Umbrella Academy', genero: 'Ação, Aventura, Comédia', temporadas: 3, anoLancamento: 2019, rating: 8.0 },
    { id: 16, nome: 'Chernobyl', genero: 'Drama, História, Thriller', temporadas: 1, anoLancamento: 2019, rating: 9.4 },
    { id: 17, nome: 'Peaky Blinders', genero: 'Crime, Drama', temporadas: 6, anoLancamento: 2013, rating: 8.8 },
    { id: 18, nome: 'The Simpsons', genero: 'Animação, Comédia', temporadas: 33, anoLancamento: 1989, rating: 8.6 },
];

// Operação de Listar Todas as Séries
app.get('/series', (req, res) => {
    res.json(seriesData);
});

// Operação de Obter uma Série por ID
app.get('/series/:id', (req, res) => {
    const serieId = parseInt(req.params.id);
    const serie = seriesData.find(serie => serie.id === serieId);

    if (serie) {
        res.json(serie);
    } else {
        res.status(404).send('Série não encontrada');
    }
});

// Operação de Adicionar uma Nova Série
app.post('/series', (req, res) => {
    const newSerie = req.body;
    newSerie.id = seriesData.length + 1;

    seriesData.push(newSerie);

    res.json(newSerie);
});

// Operação de Atualizar uma Série por ID
app.put('/series/:id', (req, res) => {
    const serieId = parseInt(req.params.id);
    const updatedSerie = req.body;

    seriesData = seriesData.map(serie => (serie.id === serieId ? updatedSerie : serie));

    res.json(updatedSerie);
});

// Operação de Remover uma Série por ID
app.delete('/series/:id', (req, res) => {
    const serieId = parseInt(req.params.id);
    seriesData = seriesData.filter(serie => serie.id !== serieId);
    res.send(`Série com ID ${serieId} removida`);
});

// Consumir a API com Axios (Testes Manuais)
axios.get('http://localhost:3000/series')
    .then(response => {
        console.log('Sua lista de séries:', response.data);
    })
    .catch(error => {
        console.error('Erro ao obter a lista de séries:', error.message);
    });

// Definir a porta para o servidor express
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

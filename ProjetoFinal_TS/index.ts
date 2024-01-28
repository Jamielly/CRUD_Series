import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// SQLite - Criar a tabela caso ela não exista (mesma coisa da outra*)
const db = new sqlite3.Database('database.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS entities (id INTEGER PRIMARY KEY, name TEXT, image TEXT)");
});

// Multer - Configurações para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware de log
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware - proteger rotas
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token as string, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Aqui começa as 'Rotas'

// Rota registro de usuário
app.post('/register', async (req: Request, res: Response) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Salvar usuário no banco de dados
        res.status(201).send('Usuário registrado com sucesso!');
    } catch {
        res.status(500).send('Erro ao registrar usuário.');
    }
});

// Rota autenticação
app.post('/login', async (req: Request, res: Response) => {
    // Autenticação do usuário e gerando o token
    const user = { username: req.body.username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string);
    res.json({ accessToken: accessToken });
});

// Rota de listagem entidades (query "limit")
app.get('/entities', authenticateToken, (req: Request, res: Response) => {
    const limit = req.query.limit || 10; 
    db.all("SELECT * FROM entities LIMIT ?", [limit], (err, rows) => {
        if (err) {
            res.status(500).send('Erro ao obter entidades');
        } else {
            res.json(rows);
        }
    });
});

// Rota para upload das imganes
app.post('/upload', authenticateToken, upload.single('image'), (req: Request, res: Response) => {
    // Salvando a referência da imagem no banco de dados
    const imagePath = (req.file as Express.Multer.File).path;
    db.run("INSERT INTO entities (name, image) VALUES (?, ?)", [req.body.name, imagePath], (err) => {
        if (err) {
            res.status(500).send('Erro ao fazer upload da imagem');
        } else {
            res.status(201).send('Imagem enviada com sucesso!');
        }
    });
});

// Iniciando o servidor
app.use(express.static('public'));
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});



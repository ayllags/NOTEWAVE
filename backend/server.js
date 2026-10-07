// ================================
// CONFIGURAÇÃO DO SERVIDOR E BANCO
// ================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Só aceita requisições vindas do frontend configurado em CORS_ORIGIN
// (pode ser uma lista separada por vírgula). O padrão cobre o Live Server do VS Code.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500,http://127.0.0.1:5500')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Conexão com o MySQL (credenciais vêm do arquivo .env)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.getConnection((err, conn) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err.message);
  } else {
    console.log('Conectado ao MySQL Workbench com sucesso!');
    conn.release();
  }
});

// ================================
// ROTA 1: CADASTRO DE USUÁRIO (LGPD/BCRYPT)
// ================================
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Preencha todos os campos!' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    try {
        // Criptografa a senha antes de salvar no banco
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Mapeia "username" recebido do frontend para a coluna "nome" do MySQL
        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('ERRO NO MYSQL AO CADASTRAR:', err); // Exibe o erro real no terminal

                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Este e-mail já está cadastrado!' });
                }
                return res.status(500).json({ message: 'Erro interno' });
            }

            console.log('Usuário salvo com sucesso:', username);
            return res.status(201).json({ 
                message: 'Conta criada com sucesso!',
                username: username 
            });
        });
    } catch (error) {
        console.error('ERRO NO BCRYPT:', error);
        return res.status(500).json({ message: 'Erro interno' });
    }
});

// ================================
// ROTA 2: LOGIN DE USUÁRIO
// ================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Preencha e-mail e senha!' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('ERRO NO MYSQL AO FAZER LOGIN:', err);
            return res.status(500).json({ message: 'Erro interno' });
        }

        // Mesma resposta para e-mail inexistente e senha errada,
        // para não revelar quais e-mails estão cadastrados
        const credenciaisInvalidas = { message: 'E-mail ou senha incorretos' };

        if (results.length === 0) {
            return res.status(401).json(credenciaisInvalidas);
        }

        const usuario = results[0];

        try {
            // Compara a senha digitada com o hash criptografado salvo no MySQL
            const senhaValida = await bcrypt.compare(password, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json(credenciaisInvalidas);
            }
        } catch (error) {
            console.error('ERRO NO BCRYPT AO FAZER LOGIN:', error);
            return res.status(500).json({ message: 'Erro interno' });
        }

        console.log(' Login realizado por:', usuario.nome);
        return res.status(200).json({ 
            message: 'Login realizado com sucesso!',
            username: usuario.nome 
        });
    });
});

// ================================
// INICIAR O SERVIDOR
// ================================
app.listen(PORT, () => {
    console.log(`Servidor NoteWave rodando em http://localhost:${PORT}`);
});
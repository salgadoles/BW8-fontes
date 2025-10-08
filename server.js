const express = require('express');
const multer = require('multer');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Inicializando o Octokit para interagir com a API do GitHub
const octokit = new Octokit({
  auth: 'YOUR_GITHUB_TOKEN', // Substitua pelo seu token de acesso pessoal
});

// Rota para upload de fontes
app.post('/upload', upload.array('fonts'), async (req, res) => {
  try {
    // Aqui você pode processar as fontes, gerar o CSS e fazer o commit no GitHub
    // Exemplo: gerar o CSS, usar octokit para fazer o commit

    res.status(200).send('Fontes enviadas com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao enviar fontes.');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

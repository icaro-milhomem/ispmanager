import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// Carrega variáveis de ambiente
dotenv.config();

// Configurações do servidor
const app = express();
const PORT = 3000; // Porta padrão 3000

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/', routes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 
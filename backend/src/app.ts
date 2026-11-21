import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { database } from './config/database.js';
import autenticacaoRoutes from './routes/autenticacaoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import personagemRoutes from './routes/personagemRoutes.js';
import campanhaRoutes from './routes/campanhaRoutes.js';
import mestreRoutes from './routes/mestreRoutes.js';

export const app = express();
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => res.json({ mensagem: 'API FableDM' }));
app.get('/saude', async (_req, res) => {
  try {
    await database.query('SELECT 1');
    res.json({ status: 'ok', banco: 'conectado' });
  } catch {
    res.status(503).json({ status: 'degradado', banco: 'desconectado' });
  }
});
app.use('/login', autenticacaoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/personagens', personagemRoutes);
app.use('/campanhas', campanhaRoutes);
app.use('/mestre', mestreRoutes);

app.use((_req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));
app.use((erro: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

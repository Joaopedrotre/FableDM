import type { RequestHandler, Response } from 'express';
import { TokenService } from '../services/TokenService.js';

export function criarAutenticacao(tokens: TokenService = new TokenService()): RequestHandler {
  return (req, res, next) => {
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    const usuarioId = tipo === 'Bearer' && token ? tokens.verificar(token) : null;

    if (usuarioId === null) {
      res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Entre novamente.' });
      return;
    }

    res.locals.usuarioId = usuarioId;
    next();
  };
}

export const autenticar = criarAutenticacao();

export function usuarioAutenticado(res: Response): number {
  const id: unknown = res.locals.usuarioId;
  if (typeof id !== 'number') {
    throw new Error('Rota protegida executada sem usuário autenticado.');
  }
  return id;
}

import type { RequestHandler, Response } from 'express';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { TokenService } from '../services/TokenService.js';

export interface BuscadorDeUsuario {
  buscarPorId(id: number): Promise<unknown>;
}

export function criarAutenticacao(
  tokens: TokenService = new TokenService(),
  usuarios: BuscadorDeUsuario = new UsuarioRepository()
): RequestHandler {
  return async (req, res, next) => {
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    const usuarioId = tipo === 'Bearer' && token ? tokens.verificar(token) : null;

    if (usuarioId === null || !(await usuarios.buscarPorId(usuarioId))) {
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

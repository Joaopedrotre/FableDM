import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export class TokenService {
  constructor(
    private readonly segredo: string = env.JWT_SECRET,
    private readonly expiracao: string = env.JWT_EXPIRES_IN
  ) {}

  emitir(usuarioId: number): string {
    return jwt.sign({}, this.segredo, {
      algorithm: 'HS256',
      subject: String(usuarioId),
      expiresIn: this.expiracao as SignOptions['expiresIn']
    });
  }

  verificar(token: string): number | null {
    try {
      const payload = jwt.verify(token, this.segredo, { algorithms: ['HS256'] });
      if (typeof payload === 'string' || !payload.sub) return null;
      const id = Number(payload.sub);
      return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }
}

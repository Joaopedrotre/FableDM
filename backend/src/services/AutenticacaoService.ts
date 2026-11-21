import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { EMAIL_CONTA_TESTE } from '../config/contasDemonstracao.js';
import { env } from '../config/env.js';
import type { Usuario } from '../models/Usuario.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { TokenService } from './TokenService.js';

const HASH_PARA_EQUALIZAR_TEMPO = bcrypt.hashSync(randomBytes(16).toString('hex'), 12);

export interface SessaoIniciada {
  token: string;
  usuario: Usuario;
}

export class AutenticacaoService {
  constructor(
    private readonly repository = new UsuarioRepository(),
    private readonly tokens = new TokenService()
  ) {}

  async entrar(email: string, senha: string): Promise<SessaoIniciada> {
    const encontrado = await this.repository.buscarPorEmail(email.toLowerCase());
    const senhaCorreta = await bcrypt.compare(senha, encontrado?.senhaHash ?? HASH_PARA_EQUALIZAR_TEMPO);

    if (!encontrado || !senhaCorreta) {
      throw new CredenciaisInvalidasError();
    }
    return { token: this.tokens.emitir(encontrado.usuario.id), usuario: encontrado.usuario };
  }

  async entrarComoTeste(): Promise<SessaoIniciada> {
    if (!env.TEST_ACCOUNT_ENABLED) {
      throw new ContaTesteDesativadaError();
    }

    const encontrado = await this.repository.buscarPorEmail(EMAIL_CONTA_TESTE);
    if (!encontrado) {
      throw new ContaTesteAusenteError();
    }
    return { token: this.tokens.emitir(encontrado.usuario.id), usuario: encontrado.usuario };
  }
}

export class CredenciaisInvalidasError extends Error {
  constructor() {
    super('E-mail ou senha incorretos.');
    this.name = 'CredenciaisInvalidasError';
  }
}

export class ContaTesteDesativadaError extends Error {
  constructor() {
    super('A conta de teste está desativada.');
    this.name = 'ContaTesteDesativadaError';
  }
}

export class ContaTesteAusenteError extends Error {
  constructor() {
    super('A conta de teste não existe no banco de dados.');
    this.name = 'ContaTesteAusenteError';
  }
}

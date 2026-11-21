import bcrypt from 'bcryptjs';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import type { CadastroUsuarioInput, EdicaoUsuarioInput } from '../validators/usuarioValidator.js';

export class UsuarioService {
  constructor(private readonly repository = new UsuarioRepository()) {}

  async cadastrar(dados: CadastroUsuarioInput) {
    const email = dados.email.toLowerCase();
    const existente = await this.repository.buscarDuplicidade(email, dados.cpf);

    if (existente?.email === email) {
      throw new CadastroError('Este e-mail já está cadastrado.', 'email');
    }
    if (existente?.cpf === dados.cpf) {
      throw new CadastroError('Este CPF já está cadastrado.', 'cpf');
    }

    const senha_hash = await bcrypt.hash(dados.senha, 12);
    return this.repository.criar({
      nome: dados.nome.replace(/\s+/g, ' '),
      email,
      cpf: dados.cpf,
      senha_hash
    });
  }

  async editar(id: number, dados: EdicaoUsuarioInput) {
    if (await this.repository.cpfPertenceAOutro(dados.cpf, id)) {
      throw new CadastroError('Este CPF já está cadastrado.', 'cpf');
    }

    const senha_hash = dados.senha ? await bcrypt.hash(dados.senha, 12) : undefined;
    const atualizado = await this.repository.atualizar(id, {
      nome: dados.nome.replace(/\s+/g, ' '),
      cpf: dados.cpf,
      senha_hash
    });

    if (!atualizado) {
      throw new UsuarioNaoEncontradoError();
    }
    return atualizado;
  }
}

export class UsuarioNaoEncontradoError extends Error {
  constructor() {
    super('Usuário não encontrado.');
    this.name = 'UsuarioNaoEncontradoError';
  }
}

export class CadastroError extends Error {
  constructor(message: string, public readonly campo: 'email' | 'cpf') {
    super(message);
    this.name = 'CadastroError';
  }
}

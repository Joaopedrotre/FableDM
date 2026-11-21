import { database } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Usuario, type NovoUsuario } from '../models/Usuario.js';

interface UsuarioExistente extends RowDataPacket {
  email: string | null;
  cpf: string | null;
}

interface LinhaUsuario extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha_hash: string;
  criado_em: Date;
}

export interface UsuarioComSenha {
  usuario: Usuario;
  senhaHash: string;
}

export interface AtualizacaoUsuario {
  nome: string;
  cpf: string;
  senha_hash?: string;
}

const COLUNAS = 'id, nome, email, cpf, senha_hash, criado_em';

function paraEntidade(linha: LinhaUsuario): Usuario {
  return new Usuario({
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    cpf: linha.cpf,
    criadoEm: linha.criado_em
  });
}

export class UsuarioRepository {
  async buscarDuplicidade(email: string, cpf: string): Promise<UsuarioExistente | null> {
    const [linhas] = await database.execute<UsuarioExistente[]>(
      'SELECT email, cpf FROM usuarios WHERE email = ? OR cpf = ? LIMIT 1',
      [email, cpf]
    );
    return linhas[0] ?? null;
  }

  async criar(usuario: NovoUsuario): Promise<Usuario> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'INSERT INTO usuarios (nome, email, cpf, senha_hash) VALUES (?, ?, ?, ?)',
      [usuario.nome, usuario.email, usuario.cpf, usuario.senha_hash]
    );

    const [linhas] = await database.execute<(RowDataPacket & { id: number; nome: string; email: string; cpf: string; criado_em: Date })[]>(
      'SELECT id, nome, email, cpf, criado_em FROM usuarios WHERE id = ?',
      [resultado.insertId]
    );

    const linha = linhas[0];
    return new Usuario({
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      cpf: linha.cpf,
      criadoEm: linha.criado_em
    });
  }

  async buscarPorEmail(email: string): Promise<UsuarioComSenha | null> {
    const [linhas] = await database.execute<LinhaUsuario[]>(
      `SELECT ${COLUNAS} FROM usuarios WHERE email = ? LIMIT 1`,
      [email]
    );
    const linha = linhas[0];
    return linha ? { usuario: paraEntidade(linha), senhaHash: linha.senha_hash } : null;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const [linhas] = await database.execute<LinhaUsuario[]>(
      `SELECT ${COLUNAS} FROM usuarios WHERE id = ? LIMIT 1`,
      [id]
    );
    const linha = linhas[0];
    return linha ? paraEntidade(linha) : null;
  }

  async cpfPertenceAOutro(cpf: string, id: number): Promise<boolean> {
    const [linhas] = await database.execute<RowDataPacket[]>(
      'SELECT id FROM usuarios WHERE cpf = ? AND id <> ? LIMIT 1',
      [cpf, id]
    );
    return linhas.length > 0;
  }

  async atualizar(id: number, dados: AtualizacaoUsuario): Promise<Usuario | null> {
    if (dados.senha_hash) {
      await database.execute<ResultSetHeader>(
        'UPDATE usuarios SET nome = ?, cpf = ?, senha_hash = ? WHERE id = ?',
        [dados.nome, dados.cpf, dados.senha_hash, id]
      );
    } else {
      await database.execute<ResultSetHeader>(
        'UPDATE usuarios SET nome = ?, cpf = ? WHERE id = ?',
        [dados.nome, dados.cpf, id]
      );
    }
    return this.buscarPorId(id);
  }
}

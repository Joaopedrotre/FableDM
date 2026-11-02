import { database } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Usuario, type NovoUsuario } from '../models/Usuario.js';

interface UsuarioExistente extends RowDataPacket {
  email: string | null;
  cpf: string | null;
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
}

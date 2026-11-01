import { database } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { NovoUsuario, Usuario } from '../models/Usuario.js';

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

    const [linhas] = await database.execute<(Usuario & RowDataPacket)[]>(
      'SELECT id, nome, email, cpf, criado_em FROM usuarios WHERE id = ?',
      [resultado.insertId]
    );

    return linhas[0];
  }
}

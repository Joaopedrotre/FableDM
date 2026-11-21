import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { Personagem, type AtualizacaoPersonagem, type NovoPersonagem } from '../models/Personagem.js';

interface LinhaPersonagem extends RowDataPacket {
  id: number;
  usuario_id: number;
  nome: string;
  descricao: string;
  imagem: string | null;
  criado_em: Date;
}

const COLUNAS = 'id, usuario_id, nome, descricao, imagem, criado_em';

function paraEntidade(linha: LinhaPersonagem): Personagem {
  return new Personagem({
    id: linha.id,
    usuarioId: linha.usuario_id,
    nome: linha.nome,
    descricao: linha.descricao,
    imagem: linha.imagem,
    criadoEm: linha.criado_em
  });
}

export class PersonagemRepository {
  async listar(usuarioId: number, limite: number, deslocamento: number): Promise<Personagem[]> {
    const [linhas] = await database.execute<LinhaPersonagem[]>(
      `SELECT ${COLUNAS} FROM personagens WHERE usuario_id = ? ORDER BY id DESC LIMIT ${Math.trunc(limite)} OFFSET ${Math.trunc(deslocamento)}`,
      [usuarioId]
    );
    return linhas.map(paraEntidade);
  }

  async contar(usuarioId: number): Promise<number> {
    const [linhas] = await database.execute<(RowDataPacket & { total: number })[]>(
      'SELECT COUNT(*) AS total FROM personagens WHERE usuario_id = ?',
      [usuarioId]
    );
    return Number(linhas[0].total);
  }

  async buscar(id: number, usuarioId: number): Promise<Personagem | null> {
    const [linhas] = await database.execute<LinhaPersonagem[]>(
      `SELECT ${COLUNAS} FROM personagens WHERE id = ? AND usuario_id = ? LIMIT 1`,
      [id, usuarioId]
    );
    return linhas[0] ? paraEntidade(linhas[0]) : null;
  }

  async criar(usuarioId: number, dados: NovoPersonagem): Promise<Personagem> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'INSERT INTO personagens (usuario_id, nome, descricao, imagem) VALUES (?, ?, ?, ?)',
      [usuarioId, dados.nome, dados.descricao, dados.imagem]
    );
    const criado = await this.buscar(resultado.insertId, usuarioId);
    if (!criado) throw new Error('Personagem criado não foi encontrado.');
    return criado;
  }

  async atualizar(id: number, usuarioId: number, dados: AtualizacaoPersonagem): Promise<Personagem | null> {
    if (!(await this.buscar(id, usuarioId))) return null;

    if (dados.imagem === undefined) {
      await database.execute<ResultSetHeader>(
        'UPDATE personagens SET nome = ?, descricao = ? WHERE id = ? AND usuario_id = ?',
        [dados.nome, dados.descricao, id, usuarioId]
      );
    } else {
      await database.execute<ResultSetHeader>(
        'UPDATE personagens SET nome = ?, descricao = ?, imagem = ? WHERE id = ? AND usuario_id = ?',
        [dados.nome, dados.descricao, dados.imagem, id, usuarioId]
      );
    }
    return this.buscar(id, usuarioId);
  }

  async excluir(id: number, usuarioId: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'DELETE FROM personagens WHERE id = ? AND usuario_id = ?',
      [id, usuarioId]
    );
    return resultado.affectedRows > 0;
  }
}

import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { Campanha, type NovaCampanha } from '../models/Campanha.js';

interface LinhaCampanha extends RowDataPacket {
  id: number;
  usuario_id: number;
  personagem_id: number | null;
  personagem_nome: string | null;
  nome: string;
  descricao: string;
  criado_em: Date;
  atualizada_em: Date;
}

const SELECAO = `
  SELECT c.id, c.usuario_id, c.personagem_id, p.nome AS personagem_nome,
         c.nome, c.descricao, c.criado_em, c.atualizada_em
  FROM campanhas c
  LEFT JOIN personagens p ON p.id = c.personagem_id
`;

function paraEntidade(linha: LinhaCampanha): Campanha {
  return new Campanha({
    id: linha.id,
    usuarioId: linha.usuario_id,
    personagemId: linha.personagem_id,
    personagemNome: linha.personagem_nome,
    nome: linha.nome,
    descricao: linha.descricao,
    criadoEm: linha.criado_em,
    atualizadaEm: linha.atualizada_em
  });
}

export class CampanhaRepository {
  async listar(usuarioId: number, limite: number, deslocamento: number): Promise<Campanha[]> {
    const [linhas] = await database.execute<LinhaCampanha[]>(
      `${SELECAO} WHERE c.usuario_id = ? ORDER BY c.atualizada_em DESC, c.id DESC LIMIT ${Math.trunc(limite)} OFFSET ${Math.trunc(deslocamento)}`,
      [usuarioId]
    );
    return linhas.map(paraEntidade);
  }

  async contar(usuarioId: number): Promise<number> {
    const [linhas] = await database.execute<(RowDataPacket & { total: number })[]>(
      'SELECT COUNT(*) AS total FROM campanhas WHERE usuario_id = ?',
      [usuarioId]
    );
    return Number(linhas[0].total);
  }

  async buscar(id: number, usuarioId: number): Promise<Campanha | null> {
    const [linhas] = await database.execute<LinhaCampanha[]>(
      `${SELECAO} WHERE c.id = ? AND c.usuario_id = ? LIMIT 1`,
      [id, usuarioId]
    );
    return linhas[0] ? paraEntidade(linhas[0]) : null;
  }

  async criar(usuarioId: number, dados: NovaCampanha): Promise<Campanha> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'INSERT INTO campanhas (usuario_id, personagem_id, nome, descricao) VALUES (?, ?, ?, ?)',
      [usuarioId, dados.personagemId, dados.nome, dados.descricao]
    );
    const criada = await this.buscar(resultado.insertId, usuarioId);
    if (!criada) throw new Error('Campanha criada não foi encontrada.');
    return criada;
  }

  async atualizar(id: number, usuarioId: number, dados: NovaCampanha): Promise<Campanha | null> {
    if (!(await this.buscar(id, usuarioId))) return null;
    await database.execute<ResultSetHeader>(
      'UPDATE campanhas SET personagem_id = ?, nome = ?, descricao = ? WHERE id = ? AND usuario_id = ?',
      [dados.personagemId, dados.nome, dados.descricao, id, usuarioId]
    );
    return this.buscar(id, usuarioId);
  }

  async registrarAtividade(id: number): Promise<void> {
    await database.execute<ResultSetHeader>('UPDATE campanhas SET atualizada_em = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }

  async excluir(id: number, usuarioId: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'DELETE FROM campanhas WHERE id = ? AND usuario_id = ?',
      [id, usuarioId]
    );
    return resultado.affectedRows > 0;
  }
}

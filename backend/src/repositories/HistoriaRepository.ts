import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { Historia, type AtualizacaoHistoria, type NovaHistoria } from '../models/Historia.js';

interface LinhaHistoria extends RowDataPacket {
  id: number;
  usuario_id: number;
  campanha_id: number;
  campanha_nome: string;
  titulo: string;
  resumo: string;
  total_mensagens: number;
  criado_em: Date;
  atualizada_em: Date;
}

const SELECAO = `
  SELECT h.id, h.usuario_id, h.campanha_id, c.nome AS campanha_nome, h.titulo, h.resumo,
         (SELECT COUNT(*) FROM mensagens m WHERE m.historia_id = h.id) AS total_mensagens,
         h.criado_em, h.atualizada_em
  FROM historias h
  INNER JOIN campanhas c ON c.id = h.campanha_id
`;

function paraEntidade(linha: LinhaHistoria): Historia {
  return new Historia({
    id: linha.id,
    usuarioId: linha.usuario_id,
    campanhaId: linha.campanha_id,
    campanhaNome: linha.campanha_nome,
    titulo: linha.titulo,
    resumo: linha.resumo,
    totalMensagens: Number(linha.total_mensagens),
    criadoEm: linha.criado_em,
    atualizadaEm: linha.atualizada_em
  });
}

export class HistoriaRepository {
  async listar(usuarioId: number, limite: number, deslocamento: number, campanhaId?: number): Promise<Historia[]> {
    const filtro = campanhaId === undefined ? '' : ' AND h.campanha_id = ?';
    const parametros = campanhaId === undefined ? [usuarioId] : [usuarioId, campanhaId];
    const [linhas] = await database.execute<LinhaHistoria[]>(
      `${SELECAO} WHERE h.usuario_id = ?${filtro} ORDER BY h.atualizada_em DESC, h.id DESC LIMIT ${Math.trunc(limite)} OFFSET ${Math.trunc(deslocamento)}`,
      parametros
    );
    return linhas.map(paraEntidade);
  }

  async contar(usuarioId: number, campanhaId?: number): Promise<number> {
    const filtro = campanhaId === undefined ? '' : ' AND campanha_id = ?';
    const parametros = campanhaId === undefined ? [usuarioId] : [usuarioId, campanhaId];
    const [linhas] = await database.execute<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM historias WHERE usuario_id = ?${filtro}`,
      parametros
    );
    return Number(linhas[0].total);
  }

  async buscar(id: number, usuarioId: number): Promise<Historia | null> {
    const [linhas] = await database.execute<LinhaHistoria[]>(
      `${SELECAO} WHERE h.id = ? AND h.usuario_id = ? LIMIT 1`,
      [id, usuarioId]
    );
    return linhas[0] ? paraEntidade(linhas[0]) : null;
  }

  async criar(usuarioId: number, dados: NovaHistoria): Promise<Historia> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'INSERT INTO historias (usuario_id, campanha_id, titulo, resumo) VALUES (?, ?, ?, ?)',
      [usuarioId, dados.campanhaId, dados.titulo, dados.resumo]
    );
    const criada = await this.buscar(resultado.insertId, usuarioId);
    if (!criada) throw new Error('História criada não foi encontrada.');
    return criada;
  }

  async atualizar(id: number, usuarioId: number, dados: AtualizacaoHistoria): Promise<Historia | null> {
    if (!(await this.buscar(id, usuarioId))) return null;
    await database.execute<ResultSetHeader>(
      'UPDATE historias SET titulo = ?, resumo = ? WHERE id = ? AND usuario_id = ?',
      [dados.titulo, dados.resumo, id, usuarioId]
    );
    return this.buscar(id, usuarioId);
  }

  async registrarAtividade(id: number): Promise<void> {
    await database.execute<ResultSetHeader>('UPDATE historias SET atualizada_em = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }

  async excluir(id: number, usuarioId: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'DELETE FROM historias WHERE id = ? AND usuario_id = ?',
      [id, usuarioId]
    );
    return resultado.affectedRows > 0;
  }
}

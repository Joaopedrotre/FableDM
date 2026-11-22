import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { MensagemJogo, type AutorMensagem, type NovaMensagemJogo } from '../models/MensagemJogo.js';

interface LinhaMensagem extends RowDataPacket {
  id: number;
  historia_id: number;
  autor: AutorMensagem;
  texto: string;
  criado_em: Date;
}

const COLUNAS = 'id, historia_id, autor, texto, criado_em';

function paraEntidade(linha: LinhaMensagem): MensagemJogo {
  return new MensagemJogo({
    id: linha.id,
    historiaId: linha.historia_id,
    autor: linha.autor,
    texto: linha.texto,
    criadoEm: linha.criado_em
  });
}

export class MensagemRepository {
  async listarRecentes(historiaId: number, limite: number): Promise<MensagemJogo[]> {
    const [linhas] = await database.execute<LinhaMensagem[]>(
      `SELECT ${COLUNAS} FROM mensagens WHERE historia_id = ? ORDER BY id DESC LIMIT ${Math.trunc(limite)}`,
      [historiaId]
    );
    return linhas.map(paraEntidade).reverse();
  }

  async listarAnteriores(historiaId: number, antesDeId: number, limite: number): Promise<MensagemJogo[]> {
    const [linhas] = await database.execute<LinhaMensagem[]>(
      `SELECT ${COLUNAS} FROM mensagens WHERE historia_id = ? AND id < ? ORDER BY id DESC LIMIT ${Math.trunc(limite)}`,
      [historiaId, antesDeId]
    );
    return linhas.map(paraEntidade).reverse();
  }

  async criarVarias(historiaId: number, mensagens: NovaMensagemJogo[]): Promise<MensagemJogo[]> {
    if (mensagens.length === 0) return [];

    const marcadores = mensagens.map(() => '(?, ?, ?)').join(', ');
    const valores = mensagens.flatMap((m) => [historiaId, m.autor, m.texto]);
    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO mensagens (historia_id, autor, texto) VALUES ${marcadores}`,
      valores
    );

    const [linhas] = await database.execute<LinhaMensagem[]>(
      `SELECT ${COLUNAS} FROM mensagens WHERE historia_id = ? AND id >= ? ORDER BY id ASC LIMIT ${mensagens.length}`,
      [historiaId, resultado.insertId]
    );
    return linhas.map(paraEntidade);
  }
}

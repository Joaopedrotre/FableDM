import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { MensagemJogo, type AutorMensagem, type NovaMensagemJogo } from '../models/MensagemJogo.js';

interface LinhaMensagem extends RowDataPacket {
  id: number;
  campanha_id: number;
  autor: AutorMensagem;
  texto: string;
  criado_em: Date;
}

function paraEntidade(linha: LinhaMensagem): MensagemJogo {
  return new MensagemJogo({
    id: linha.id,
    campanhaId: linha.campanha_id,
    autor: linha.autor,
    texto: linha.texto,
    criadoEm: linha.criado_em
  });
}

export class MensagemRepository {
  async listarRecentes(campanhaId: number, limite: number): Promise<MensagemJogo[]> {
    const [linhas] = await database.execute<LinhaMensagem[]>(
      `SELECT id, campanha_id, autor, texto, criado_em FROM mensagens WHERE campanha_id = ? ORDER BY id DESC LIMIT ${Math.trunc(limite)}`,
      [campanhaId]
    );
    return linhas.map(paraEntidade).reverse();
  }

  async criarVarias(campanhaId: number, mensagens: NovaMensagemJogo[]): Promise<MensagemJogo[]> {
    if (mensagens.length === 0) return [];

    const marcadores = mensagens.map(() => '(?, ?, ?)').join(', ');
    const valores = mensagens.flatMap((m) => [campanhaId, m.autor, m.texto]);
    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO mensagens (campanha_id, autor, texto) VALUES ${marcadores}`,
      valores
    );

    const primeiroId = resultado.insertId;
    const [linhas] = await database.execute<LinhaMensagem[]>(
      `SELECT id, campanha_id, autor, texto, criado_em FROM mensagens WHERE campanha_id = ? AND id >= ? ORDER BY id ASC LIMIT ${mensagens.length}`,
      [campanhaId, primeiroId]
    );
    return linhas.map(paraEntidade);
  }
}

import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { database } from '../config/database.js';
import { Item, type NovoItem } from '../models/Item.js';

interface LinhaItem extends RowDataPacket {
  id: number;
  personagem_id: number;
  nome: string;
  descricao: string;
  quantidade: number;
  criado_em: Date;
}

const COLUNAS = 'id, personagem_id, nome, descricao, quantidade, criado_em';

function paraEntidade(linha: LinhaItem): Item {
  return new Item({
    id: linha.id,
    personagemId: linha.personagem_id,
    nome: linha.nome,
    descricao: linha.descricao,
    quantidade: linha.quantidade,
    criadoEm: linha.criado_em
  });
}

export class ItemRepository {
  async listar(personagemId: number, limite: number, deslocamento: number): Promise<Item[]> {
    const [linhas] = await database.execute<LinhaItem[]>(
      `SELECT ${COLUNAS} FROM itens WHERE personagem_id = ? ORDER BY id DESC LIMIT ${Math.trunc(limite)} OFFSET ${Math.trunc(deslocamento)}`,
      [personagemId]
    );
    return linhas.map(paraEntidade);
  }

  async contar(personagemId: number): Promise<number> {
    const [linhas] = await database.execute<(RowDataPacket & { total: number })[]>(
      'SELECT COUNT(*) AS total FROM itens WHERE personagem_id = ?',
      [personagemId]
    );
    return Number(linhas[0].total);
  }

  async buscar(id: number, personagemId: number): Promise<Item | null> {
    const [linhas] = await database.execute<LinhaItem[]>(
      `SELECT ${COLUNAS} FROM itens WHERE id = ? AND personagem_id = ? LIMIT 1`,
      [id, personagemId]
    );
    return linhas[0] ? paraEntidade(linhas[0]) : null;
  }

  async criar(personagemId: number, dados: NovoItem): Promise<Item> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'INSERT INTO itens (personagem_id, nome, descricao, quantidade) VALUES (?, ?, ?, ?)',
      [personagemId, dados.nome, dados.descricao, dados.quantidade]
    );
    const criado = await this.buscar(resultado.insertId, personagemId);
    if (!criado) throw new Error('Item criado não foi encontrado.');
    return criado;
  }

  async atualizar(id: number, personagemId: number, dados: NovoItem): Promise<Item | null> {
    if (!(await this.buscar(id, personagemId))) return null;
    await database.execute<ResultSetHeader>(
      'UPDATE itens SET nome = ?, descricao = ?, quantidade = ? WHERE id = ? AND personagem_id = ?',
      [dados.nome, dados.descricao, dados.quantidade, id, personagemId]
    );
    return this.buscar(id, personagemId);
  }

  async excluir(id: number, personagemId: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      'DELETE FROM itens WHERE id = ? AND personagem_id = ?',
      [id, personagemId]
    );
    return resultado.affectedRows > 0;
  }
}

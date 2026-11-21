import type { Item } from '../models/Item.js';
import { ItemRepository } from '../repositories/ItemRepository.js';
import { PersonagemRepository } from '../repositories/PersonagemRepository.js';
import { calcularDeslocamento, montarPagina, type Pagina, type ParametrosPaginacao } from '../utils/paginacao.js';
import type { ItemInput } from '../validators/jogoValidator.js';
import { RecursoNaoEncontradoError } from './erros.js';

export class ItemService {
  constructor(
    private readonly itens = new ItemRepository(),
    private readonly personagens = new PersonagemRepository()
  ) {}

  async listar(usuarioId: number, personagemId: number, paginacao: ParametrosPaginacao): Promise<Pagina<Item>> {
    await this.garantirPersonagem(usuarioId, personagemId);
    const [dados, total] = await Promise.all([
      this.itens.listar(personagemId, paginacao.limite, calcularDeslocamento(paginacao)),
      this.itens.contar(personagemId)
    ]);
    return montarPagina(dados, total, paginacao);
  }

  async buscar(usuarioId: number, personagemId: number, id: number): Promise<Item> {
    await this.garantirPersonagem(usuarioId, personagemId);
    const item = await this.itens.buscar(id, personagemId);
    if (!item) throw new RecursoNaoEncontradoError('Item');
    return item;
  }

  async criar(usuarioId: number, personagemId: number, dados: ItemInput): Promise<Item> {
    await this.garantirPersonagem(usuarioId, personagemId);
    return this.itens.criar(personagemId, dados);
  }

  async editar(usuarioId: number, personagemId: number, id: number, dados: ItemInput): Promise<Item> {
    await this.garantirPersonagem(usuarioId, personagemId);
    const atualizado = await this.itens.atualizar(id, personagemId, dados);
    if (!atualizado) throw new RecursoNaoEncontradoError('Item');
    return atualizado;
  }

  async excluir(usuarioId: number, personagemId: number, id: number): Promise<void> {
    await this.garantirPersonagem(usuarioId, personagemId);
    if (!(await this.itens.excluir(id, personagemId))) {
      throw new RecursoNaoEncontradoError('Item');
    }
  }

  private async garantirPersonagem(usuarioId: number, personagemId: number): Promise<void> {
    if (!(await this.personagens.buscar(personagemId, usuarioId))) {
      throw new RecursoNaoEncontradoError('Personagem');
    }
  }
}

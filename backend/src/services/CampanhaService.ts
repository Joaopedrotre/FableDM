import type { Campanha } from '../models/Campanha.js';
import { CampanhaRepository } from '../repositories/CampanhaRepository.js';
import { MensagemRepository } from '../repositories/MensagemRepository.js';
import { PersonagemRepository } from '../repositories/PersonagemRepository.js';
import { calcularDeslocamento, montarPagina, type Pagina, type ParametrosPaginacao } from '../utils/paginacao.js';
import type { CampanhaInput } from '../validators/jogoValidator.js';
import { RecursoNaoEncontradoError, ReferenciaInvalidaError } from './erros.js';

export function criarMensagemDeAbertura(nomeDaCampanha: string): string {
  return `A aventura "${nomeDaCampanha}" começa agora. O que você faz?`;
}

export class CampanhaService {
  constructor(
    private readonly campanhas = new CampanhaRepository(),
    private readonly personagens = new PersonagemRepository(),
    private readonly mensagens = new MensagemRepository()
  ) {}

  async listar(usuarioId: number, paginacao: ParametrosPaginacao): Promise<Pagina<Campanha>> {
    const [dados, total] = await Promise.all([
      this.campanhas.listar(usuarioId, paginacao.limite, calcularDeslocamento(paginacao)),
      this.campanhas.contar(usuarioId)
    ]);
    return montarPagina(dados, total, paginacao);
  }

  async buscar(usuarioId: number, id: number): Promise<Campanha> {
    const campanha = await this.campanhas.buscar(id, usuarioId);
    if (!campanha) throw new RecursoNaoEncontradoError('Campanha');
    return campanha;
  }

  async criar(usuarioId: number, dados: CampanhaInput): Promise<Campanha> {
    const personagemId = await this.validarPersonagem(usuarioId, dados.personagemId);
    const campanha = await this.campanhas.criar(usuarioId, {
      nome: dados.nome,
      descricao: dados.descricao,
      personagemId
    });
    await this.mensagens.criarVarias(campanha.id, [
      { autor: 'mestre', texto: criarMensagemDeAbertura(campanha.nome) }
    ]);
    return campanha;
  }

  async editar(usuarioId: number, id: number, dados: CampanhaInput): Promise<Campanha> {
    await this.buscar(usuarioId, id);
    const personagemId = await this.validarPersonagem(usuarioId, dados.personagemId);
    const atualizada = await this.campanhas.atualizar(id, usuarioId, {
      nome: dados.nome,
      descricao: dados.descricao,
      personagemId
    });
    if (!atualizada) throw new RecursoNaoEncontradoError('Campanha');
    return atualizada;
  }

  async excluir(usuarioId: number, id: number): Promise<void> {
    if (!(await this.campanhas.excluir(id, usuarioId))) {
      throw new RecursoNaoEncontradoError('Campanha');
    }
  }

  private async validarPersonagem(usuarioId: number, personagemId: number | null | undefined): Promise<number | null> {
    if (personagemId === null || personagemId === undefined) return null;
    if (!(await this.personagens.buscar(personagemId, usuarioId))) {
      throw new ReferenciaInvalidaError('Personagem não encontrado.', 'personagemId');
    }
    return personagemId;
  }
}

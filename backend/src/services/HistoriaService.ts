import type { Historia } from '../models/Historia.js';
import type { MensagemJogo } from '../models/MensagemJogo.js';
import { CampanhaRepository } from '../repositories/CampanhaRepository.js';
import { HistoriaRepository } from '../repositories/HistoriaRepository.js';
import { MensagemRepository } from '../repositories/MensagemRepository.js';
import { calcularDeslocamento, montarPagina, type Pagina, type ParametrosPaginacao } from '../utils/paginacao.js';
import type { EdicaoHistoriaInput, HistoriaInput } from '../validators/jogoValidator.js';
import { criarMensagemDeAbertura } from './abertura.js';
import { RecursoNaoEncontradoError, ReferenciaInvalidaError } from './erros.js';

export class HistoriaService {
  constructor(
    private readonly historias = new HistoriaRepository(),
    private readonly campanhas = new CampanhaRepository(),
    private readonly mensagens = new MensagemRepository()
  ) {}

  async listar(usuarioId: number, paginacao: ParametrosPaginacao, campanhaId?: number): Promise<Pagina<Historia>> {
    const [dados, total] = await Promise.all([
      this.historias.listar(usuarioId, paginacao.limite, calcularDeslocamento(paginacao), campanhaId),
      this.historias.contar(usuarioId, campanhaId)
    ]);
    return montarPagina(dados, total, paginacao);
  }

  async buscar(usuarioId: number, id: number): Promise<Historia> {
    const historia = await this.historias.buscar(id, usuarioId);
    if (!historia) throw new RecursoNaoEncontradoError('História');
    return historia;
  }

  async criar(usuarioId: number, dados: HistoriaInput): Promise<Historia> {
    const campanha = await this.campanhas.buscar(dados.campanhaId, usuarioId);
    if (!campanha) throw new ReferenciaInvalidaError('Campanha não encontrada.', 'campanhaId');

    const historia = await this.historias.criar(usuarioId, {
      campanhaId: campanha.id,
      titulo: dados.titulo,
      resumo: dados.resumo
    });
    await this.mensagens.criarVarias(historia.id, [{ autor: 'mestre', texto: criarMensagemDeAbertura(campanha.nome) }]);
    return this.buscar(usuarioId, historia.id);
  }

  async editar(usuarioId: number, id: number, dados: EdicaoHistoriaInput): Promise<Historia> {
    const atualizada = await this.historias.atualizar(id, usuarioId, { titulo: dados.titulo, resumo: dados.resumo });
    if (!atualizada) throw new RecursoNaoEncontradoError('História');
    return atualizada;
  }

  async excluir(usuarioId: number, id: number): Promise<void> {
    if (!(await this.historias.excluir(id, usuarioId))) {
      throw new RecursoNaoEncontradoError('História');
    }
  }

  async listarMensagensAnteriores(usuarioId: number, id: number, antesDe: number, limite: number): Promise<MensagemJogo[]> {
    await this.buscar(usuarioId, id);
    return this.mensagens.listarAnteriores(id, antesDe, limite);
  }
}

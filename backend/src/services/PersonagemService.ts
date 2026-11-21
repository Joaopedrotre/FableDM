import type { Personagem } from '../models/Personagem.js';
import { PersonagemRepository } from '../repositories/PersonagemRepository.js';
import { calcularDeslocamento, montarPagina, type Pagina, type ParametrosPaginacao } from '../utils/paginacao.js';
import type { PersonagemInput } from '../validators/jogoValidator.js';
import { RecursoNaoEncontradoError } from './erros.js';

export class PersonagemService {
  constructor(private readonly repository = new PersonagemRepository()) {}

  async listar(usuarioId: number, paginacao: ParametrosPaginacao): Promise<Pagina<Personagem>> {
    const [dados, total] = await Promise.all([
      this.repository.listar(usuarioId, paginacao.limite, calcularDeslocamento(paginacao)),
      this.repository.contar(usuarioId)
    ]);
    return montarPagina(dados, total, paginacao);
  }

  async buscar(usuarioId: number, id: number): Promise<Personagem> {
    const personagem = await this.repository.buscar(id, usuarioId);
    if (!personagem) throw new RecursoNaoEncontradoError('Personagem');
    return personagem;
  }

  criar(usuarioId: number, dados: PersonagemInput): Promise<Personagem> {
    return this.repository.criar(usuarioId, {
      nome: dados.nome,
      descricao: dados.descricao,
      imagem: dados.imagem ?? null
    });
  }

  async editar(usuarioId: number, id: number, dados: PersonagemInput): Promise<Personagem> {
    const atualizado = await this.repository.atualizar(id, usuarioId, {
      nome: dados.nome,
      descricao: dados.descricao,
      imagem: dados.imagem
    });
    if (!atualizado) throw new RecursoNaoEncontradoError('Personagem');
    return atualizado;
  }

  async excluir(usuarioId: number, id: number): Promise<void> {
    if (!(await this.repository.excluir(id, usuarioId))) {
      throw new RecursoNaoEncontradoError('Personagem');
    }
  }
}

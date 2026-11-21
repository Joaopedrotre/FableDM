import type { Campanha } from '../models/Campanha.js';
import type { Item } from '../models/Item.js';
import type { MensagemJogo } from '../models/MensagemJogo.js';
import type { Personagem } from '../models/Personagem.js';
import { CampanhaRepository } from '../repositories/CampanhaRepository.js';
import { ItemRepository } from '../repositories/ItemRepository.js';
import { MensagemRepository } from '../repositories/MensagemRepository.js';
import { PersonagemRepository } from '../repositories/PersonagemRepository.js';
import type { MensagemMestreInput } from '../validators/mestreValidator.js';
import type { ContextoJogo } from './contextoDoMestre.js';
import { RecursoNaoEncontradoError } from './erros.js';
import { MestreService } from './MestreService.js';

const LIMITE_MENSAGENS_EXIBIDAS = 100;
const LIMITE_MENSAGENS_NO_HISTORICO = 39;
const LIMITE_ITENS_EXIBIDOS = 50;
const LIMITE_ITENS_NO_CONTEXTO = 30;

export interface SessaoJogo {
  campanha: Campanha;
  personagem: Personagem | null;
  itens: Item[];
  totalItens: number;
  mensagens: MensagemJogo[];
}

export interface TrocaDeMensagens {
  mensagem: MensagemJogo;
  resposta: MensagemJogo;
}

export class JogoService {
  constructor(
    private readonly campanhas = new CampanhaRepository(),
    private readonly personagens = new PersonagemRepository(),
    private readonly itens = new ItemRepository(),
    private readonly mensagens = new MensagemRepository(),
    private readonly mestre = new MestreService()
  ) {}

  async obterSessao(usuarioId: number, campanhaId: number): Promise<SessaoJogo> {
    const campanha = await this.campanhas.buscar(campanhaId, usuarioId);
    if (!campanha) throw new RecursoNaoEncontradoError('Campanha');

    const personagem = campanha.personagemId
      ? await this.personagens.buscar(campanha.personagemId, usuarioId)
      : null;

    const [itens, totalItens, mensagens] = await Promise.all([
      personagem ? this.itens.listar(personagem.id, LIMITE_ITENS_EXIBIDOS, 0) : Promise.resolve([]),
      personagem ? this.itens.contar(personagem.id) : Promise.resolve(0),
      this.mensagens.listarRecentes(campanhaId, LIMITE_MENSAGENS_EXIBIDAS)
    ]);

    return { campanha, personagem, itens, totalItens, mensagens };
  }

  async enviarAcao(usuarioId: number, campanhaId: number, texto: string): Promise<TrocaDeMensagens> {
    const sessao = await this.obterSessao(usuarioId, campanhaId);

    const historico: MensagemMestreInput[] = [
      ...sessao.mensagens.slice(-LIMITE_MENSAGENS_NO_HISTORICO).map((m) => ({ autor: m.autor, texto: m.texto })),
      { autor: 'jogador', texto }
    ];

    const resposta = await this.mestre.responder(historico, this.montarContexto(sessao));

    const [mensagem, respostaSalva] = await this.mensagens.criarVarias(campanhaId, [
      { autor: 'jogador', texto },
      { autor: 'mestre', texto: resposta }
    ]);
    await this.campanhas.registrarAtividade(campanhaId);

    return { mensagem, resposta: respostaSalva };
  }

  private montarContexto(sessao: SessaoJogo): ContextoJogo {
    return {
      campanha: { nome: sessao.campanha.nome, descricao: sessao.campanha.descricao },
      personagem: sessao.personagem
        ? { nome: sessao.personagem.nome, descricao: sessao.personagem.descricao }
        : null,
      itens: sessao.itens.slice(0, LIMITE_ITENS_NO_CONTEXTO).map((item) => ({
        nome: item.nome,
        descricao: item.descricao,
        quantidade: item.quantidade
      })),
      totalItens: sessao.totalItens
    };
  }
}

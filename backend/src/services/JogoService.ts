import type { Campanha } from '../models/Campanha.js';
import type { Historia } from '../models/Historia.js';
import type { Item } from '../models/Item.js';
import type { MensagemJogo } from '../models/MensagemJogo.js';
import type { Personagem } from '../models/Personagem.js';
import { CampanhaRepository } from '../repositories/CampanhaRepository.js';
import { HistoriaRepository } from '../repositories/HistoriaRepository.js';
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
  historia: Historia;
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
    private readonly historias = new HistoriaRepository(),
    private readonly campanhas = new CampanhaRepository(),
    private readonly personagens = new PersonagemRepository(),
    private readonly itens = new ItemRepository(),
    private readonly mensagens = new MensagemRepository(),
    private readonly mestre = new MestreService()
  ) {}

  async obterSessao(usuarioId: number, historiaId: number): Promise<SessaoJogo> {
    const historia = await this.historias.buscar(historiaId, usuarioId);
    if (!historia) throw new RecursoNaoEncontradoError('História');

    const campanha = await this.campanhas.buscar(historia.campanhaId, usuarioId);
    if (!campanha) throw new RecursoNaoEncontradoError('Campanha');

    const personagem = campanha.personagemId
      ? await this.personagens.buscar(campanha.personagemId, usuarioId)
      : null;

    const [itens, totalItens, mensagens] = await Promise.all([
      personagem ? this.itens.listar(personagem.id, LIMITE_ITENS_EXIBIDOS, 0) : Promise.resolve([]),
      personagem ? this.itens.contar(personagem.id) : Promise.resolve(0),
      this.mensagens.listarRecentes(historiaId, LIMITE_MENSAGENS_EXIBIDAS)
    ]);

    return { historia, campanha, personagem, itens, totalItens, mensagens };
  }

  async enviarAcao(usuarioId: number, historiaId: number, texto: string): Promise<TrocaDeMensagens> {
    const sessao = await this.obterSessao(usuarioId, historiaId);

    const [mensagem] = await this.mensagens.criarVarias(historiaId, [{ autor: 'jogador', texto }]);
    await Promise.all([
      this.historias.registrarAtividade(historiaId),
      this.campanhas.registrarAtividade(sessao.campanha.id)
    ]);

    const historico: MensagemMestreInput[] = [
      ...sessao.mensagens.slice(-LIMITE_MENSAGENS_NO_HISTORICO).map((m) => ({ autor: m.autor, texto: m.texto })),
      { autor: 'jogador', texto }
    ];
    const resposta = await this.mestre.responder(historico, this.montarContexto(sessao));

    const [respostaSalva] = await this.mensagens.criarVarias(historiaId, [{ autor: 'mestre', texto: resposta }]);
    return { mensagem, resposta: respostaSalva };
  }

  private montarContexto(sessao: SessaoJogo): ContextoJogo {
    return {
      campanha: { nome: sessao.campanha.nome, descricao: sessao.campanha.descricao },
      resumoDaHistoria: sessao.historia.resumo,
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

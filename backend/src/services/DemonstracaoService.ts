import bcrypt from 'bcryptjs';
import { CONTAS_DEMONSTRACAO, EMAIL_CONTA_TESTE, JOGO_DEMONSTRACAO } from '../config/contasDemonstracao.js';
import { CampanhaRepository } from '../repositories/CampanhaRepository.js';
import { HistoriaRepository } from '../repositories/HistoriaRepository.js';
import { ItemRepository } from '../repositories/ItemRepository.js';
import { MensagemRepository } from '../repositories/MensagemRepository.js';
import { PersonagemRepository } from '../repositories/PersonagemRepository.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { TITULO_PRIMEIRA_HISTORIA } from './abertura.js';

export class DemonstracaoService {
  constructor(
    private readonly repository = new UsuarioRepository(),
    private readonly personagens = new PersonagemRepository(),
    private readonly itens = new ItemRepository(),
    private readonly campanhas = new CampanhaRepository(),
    private readonly historias = new HistoriaRepository(),
    private readonly mensagens = new MensagemRepository()
  ) {}

  async semear(): Promise<number> {
    let criadas = 0;

    for (const conta of CONTAS_DEMONSTRACAO) {
      const existente = await this.repository.buscarPorEmail(conta.email);
      if (existente) continue;

      try {
        const senha_hash = await bcrypt.hash(conta.senha, 12);
        await this.repository.criar({ nome: conta.nome, email: conta.email, cpf: conta.cpf, senha_hash });
        criadas++;
      } catch (erro) {
        console.error(
          `Não foi possível criar a conta de demonstração ${conta.email}:`,
          erro instanceof Error ? erro.message : 'erro desconhecido'
        );
      }
    }

    await this.semearJogoDaContaDeTeste();
    return criadas;
  }

  private async semearJogoDaContaDeTeste(): Promise<void> {
    try {
      const conta = await this.repository.buscarPorEmail(EMAIL_CONTA_TESTE);
      if (!conta) return;

      const usuarioId = conta.usuario.id;
      if ((await this.personagens.contar(usuarioId)) > 0 || (await this.campanhas.contar(usuarioId)) > 0) return;

      const personagem = await this.personagens.criar(usuarioId, { ...JOGO_DEMONSTRACAO.personagem, imagem: null });
      for (const item of JOGO_DEMONSTRACAO.itens) {
        await this.itens.criar(personagem.id, item);
      }

      const { abertura, ...dadosCampanha } = JOGO_DEMONSTRACAO.campanha;
      const campanha = await this.campanhas.criar(usuarioId, { ...dadosCampanha, personagemId: personagem.id });
      const historia = await this.historias.criar(usuarioId, {
        campanhaId: campanha.id,
        titulo: TITULO_PRIMEIRA_HISTORIA,
        resumo: ''
      });
      await this.mensagens.criarVarias(historia.id, [{ autor: 'mestre', texto: abertura }]);
    } catch (erro) {
      console.error(
        'Não foi possível criar o jogo de demonstração:',
        erro instanceof Error ? erro.message : 'erro desconhecido'
      );
    }
  }
}

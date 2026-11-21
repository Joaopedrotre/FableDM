import { Entidade } from './Entidade.js';

export interface DadosCampanha {
  id: number;
  usuarioId: number;
  personagemId: number | null;
  personagemNome: string | null;
  nome: string;
  descricao: string;
  criadoEm: Date;
  atualizadaEm: Date;
}

export interface NovaCampanha {
  nome: string;
  descricao: string;
  personagemId: number | null;
}

export class Campanha extends Entidade {
  readonly #usuarioId: number;
  readonly #personagemId: number | null;
  readonly #personagemNome: string | null;
  readonly #nome: string;
  readonly #descricao: string;
  readonly #atualizadaEm: Date;

  constructor(dados: DadosCampanha) {
    super(dados.id, dados.criadoEm);
    this.#usuarioId = dados.usuarioId;
    this.#personagemId = dados.personagemId;
    this.#personagemNome = dados.personagemNome;
    this.#nome = dados.nome;
    this.#descricao = dados.descricao;
    this.#atualizadaEm = dados.atualizadaEm;
  }

  get usuarioId(): number { return this.#usuarioId; }
  get personagemId(): number | null { return this.#personagemId; }
  get personagemNome(): string | null { return this.#personagemNome; }
  get nome(): string { return this.#nome; }
  get descricao(): string { return this.#descricao; }
  get atualizadaEm(): Date { return new Date(this.#atualizadaEm); }
}

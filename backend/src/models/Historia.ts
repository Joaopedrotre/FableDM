import { Entidade } from './Entidade.js';

export interface DadosHistoria {
  id: number;
  usuarioId: number;
  campanhaId: number;
  campanhaNome: string;
  titulo: string;
  resumo: string;
  totalMensagens: number;
  criadoEm: Date;
  atualizadaEm: Date;
}

export interface NovaHistoria {
  campanhaId: number;
  titulo: string;
  resumo: string;
}

export interface AtualizacaoHistoria {
  titulo: string;
  resumo: string;
}

export class Historia extends Entidade {
  readonly #usuarioId: number;
  readonly #campanhaId: number;
  readonly #campanhaNome: string;
  readonly #titulo: string;
  readonly #resumo: string;
  readonly #totalMensagens: number;
  readonly #atualizadaEm: Date;

  constructor(dados: DadosHistoria) {
    super(dados.id, dados.criadoEm);
    this.#usuarioId = dados.usuarioId;
    this.#campanhaId = dados.campanhaId;
    this.#campanhaNome = dados.campanhaNome;
    this.#titulo = dados.titulo;
    this.#resumo = dados.resumo;
    this.#totalMensagens = dados.totalMensagens;
    this.#atualizadaEm = dados.atualizadaEm;
  }

  get usuarioId(): number { return this.#usuarioId; }
  get campanhaId(): number { return this.#campanhaId; }
  get campanhaNome(): string { return this.#campanhaNome; }
  get titulo(): string { return this.#titulo; }
  get resumo(): string { return this.#resumo; }
  get totalMensagens(): number { return this.#totalMensagens; }
  get atualizadaEm(): Date { return new Date(this.#atualizadaEm); }
}

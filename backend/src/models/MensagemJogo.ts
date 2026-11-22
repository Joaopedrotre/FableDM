import { Entidade } from './Entidade.js';

export type AutorMensagem = 'mestre' | 'jogador';

export interface DadosMensagemJogo {
  id: number;
  historiaId: number;
  autor: AutorMensagem;
  texto: string;
  criadoEm: Date;
}

export interface NovaMensagemJogo {
  autor: AutorMensagem;
  texto: string;
}

export class MensagemJogo extends Entidade {
  readonly #historiaId: number;
  readonly #autor: AutorMensagem;
  readonly #texto: string;

  constructor(dados: DadosMensagemJogo) {
    super(dados.id, dados.criadoEm);
    this.#historiaId = dados.historiaId;
    this.#autor = dados.autor;
    this.#texto = dados.texto;
  }

  get historiaId(): number { return this.#historiaId; }
  get autor(): AutorMensagem { return this.#autor; }
  get texto(): string { return this.#texto; }
}

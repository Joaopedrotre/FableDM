import { Entidade } from './Entidade.js';

export type AutorMensagem = 'mestre' | 'jogador';

export interface DadosMensagemJogo {
  id: number;
  campanhaId: number;
  autor: AutorMensagem;
  texto: string;
  criadoEm: Date;
}

export interface NovaMensagemJogo {
  autor: AutorMensagem;
  texto: string;
}

export class MensagemJogo extends Entidade {
  readonly #campanhaId: number;
  readonly #autor: AutorMensagem;
  readonly #texto: string;

  constructor(dados: DadosMensagemJogo) {
    super(dados.id, dados.criadoEm);
    this.#campanhaId = dados.campanhaId;
    this.#autor = dados.autor;
    this.#texto = dados.texto;
  }

  get campanhaId(): number { return this.#campanhaId; }
  get autor(): AutorMensagem { return this.#autor; }
  get texto(): string { return this.#texto; }
}

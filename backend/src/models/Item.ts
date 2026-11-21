import { Entidade } from './Entidade.js';

export interface DadosItem {
  id: number;
  personagemId: number;
  nome: string;
  descricao: string;
  quantidade: number;
  criadoEm: Date;
}

export interface NovoItem {
  nome: string;
  descricao: string;
  quantidade: number;
}

export class Item extends Entidade {
  readonly #personagemId: number;
  readonly #nome: string;
  readonly #descricao: string;
  readonly #quantidade: number;

  constructor(dados: DadosItem) {
    super(dados.id, dados.criadoEm);
    this.#personagemId = dados.personagemId;
    this.#nome = dados.nome;
    this.#descricao = dados.descricao;
    this.#quantidade = dados.quantidade;
  }

  get personagemId(): number { return this.#personagemId; }
  get nome(): string { return this.#nome; }
  get descricao(): string { return this.#descricao; }
  get quantidade(): number { return this.#quantidade; }
}

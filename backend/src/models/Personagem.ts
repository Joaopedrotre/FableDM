import { Entidade } from './Entidade.js';

export interface DadosPersonagem {
  id: number;
  usuarioId: number;
  nome: string;
  descricao: string;
  imagem: string | null;
  criadoEm: Date;
}

export interface NovoPersonagem {
  nome: string;
  descricao: string;
  imagem: string | null;
}

export interface AtualizacaoPersonagem {
  nome: string;
  descricao: string;
  imagem?: string | null;
}

export class Personagem extends Entidade {
  readonly #usuarioId: number;
  readonly #nome: string;
  readonly #descricao: string;
  readonly #imagem: string | null;

  constructor(dados: DadosPersonagem) {
    super(dados.id, dados.criadoEm);
    this.#usuarioId = dados.usuarioId;
    this.#nome = dados.nome;
    this.#descricao = dados.descricao;
    this.#imagem = dados.imagem;
  }

  get usuarioId(): number { return this.#usuarioId; }
  get nome(): string { return this.#nome; }
  get descricao(): string { return this.#descricao; }
  get imagem(): string | null { return this.#imagem; }
}

/**
 * Entidade de domínio Usuario.
 * O estado é privado e só pode ser inicializado pelo construtor.
 * Getters expõem apenas os dados necessários; senha/hash nunca é exposto.
 */
export class Usuario {
  #id: number;
  #nome: string;
  #email: string;
  #cpf: string;
  #criadoEm: Date;

  constructor(dados: { id: number; nome: string; email: string; cpf: string; criadoEm: Date }) {
    this.#id = dados.id;
    this.#nome = dados.nome;
    this.#email = dados.email;
    this.#cpf = dados.cpf;
    this.#criadoEm = dados.criadoEm;
  }

  get id(): number { return this.#id; }
  get nome(): string { return this.#nome; }
  get email(): string { return this.#email; }
  get cpf(): string { return this.#cpf; }
  get criadoEm(): Date { return new Date(this.#criadoEm); }
}

/** DTO interno usado exclusivamente para persistência do cadastro. */
export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senha_hash: string;
}

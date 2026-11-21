export abstract class Entidade {
  readonly #id: number;
  readonly #criadoEm: Date;

  protected constructor(id: number, criadoEm: Date) {
    this.#id = id;
    this.#criadoEm = criadoEm;
  }

  get id(): number { return this.#id; }
  get criadoEm(): Date { return new Date(this.#criadoEm); }
}

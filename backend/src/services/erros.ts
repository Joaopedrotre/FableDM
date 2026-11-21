export class RecursoNaoEncontradoError extends Error {
  constructor(recurso: string) {
    super(`${recurso} não encontrado.`);
    this.name = 'RecursoNaoEncontradoError';
  }
}

export class ReferenciaInvalidaError extends Error {
  constructor(message: string, public readonly campo: string) {
    super(message);
    this.name = 'ReferenciaInvalidaError';
  }
}

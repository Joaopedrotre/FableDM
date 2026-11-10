export interface MensagemLLM {
  papel: 'user' | 'assistant';
  conteudo: string;
}

export interface LLMProvider {
  gerar(sistema: string, mensagens: MensagemLLM[]): Promise<string>;
}

export class ProvedorError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ProvedorError';
  }
}

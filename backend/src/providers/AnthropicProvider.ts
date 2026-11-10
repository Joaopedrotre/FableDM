import { ProvedorError, type LLMProvider, type MensagemLLM } from './LLMProvider.js';
import { postarJson } from './http.js';

interface RespostaAnthropic {
  content?: { type: string; text?: string }[];
}

export class AnthropicProvider implements LLMProvider {
  constructor(
    private readonly chave: string,
    private readonly modelo: string,
    private readonly maxTokens: number,
    private readonly urlBase: string = 'https://api.anthropic.com'
  ) {}

  async gerar(sistema: string, mensagens: MensagemLLM[]): Promise<string> {
    const dados = (await postarJson(
      `${this.urlBase.replace(/\/+$/, '')}/v1/messages`,
      { 'x-api-key': this.chave, 'anthropic-version': '2023-06-01' },
      {
        model: this.modelo,
        max_tokens: this.maxTokens,
        system: sistema,
        messages: mensagens.map((m) => ({ role: m.papel, content: m.conteudo }))
      }
    )) as RespostaAnthropic;

    const texto = (dados.content ?? [])
      .filter((bloco) => bloco.type === 'text')
      .map((bloco) => bloco.text ?? '')
      .join('')
      .trim();

    if (!texto) throw new ProvedorError('O provedor de IA retornou uma resposta vazia.', 502);
    return texto;
  }
}

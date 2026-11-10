import { ProvedorError, type LLMProvider, type MensagemLLM } from './LLMProvider.js';
import { postarJson } from './http.js';

interface RespostaOpenAI {
  choices?: { message?: { content?: string | null } }[];
}

export class OpenAIProvider implements LLMProvider {
  constructor(
    private readonly chave: string,
    private readonly modelo: string,
    private readonly maxTokens: number,
    private readonly urlBase: string = 'https://api.openai.com/v1'
  ) {}

  async gerar(sistema: string, mensagens: MensagemLLM[]): Promise<string> {
    const cabecalhos: Record<string, string> = this.chave ? { Authorization: `Bearer ${this.chave}` } : {};

    const dados = (await postarJson(
      `${this.urlBase.replace(/\/+$/, '')}/chat/completions`,
      cabecalhos,
      {
        model: this.modelo,
        max_completion_tokens: this.maxTokens,
        messages: [
          { role: 'system', content: sistema },
          ...mensagens.map((m) => ({ role: m.papel, content: m.conteudo }))
        ]
      }
    )) as RespostaOpenAI;

    const texto = dados.choices?.[0]?.message?.content?.trim() ?? '';
    if (!texto) throw new ProvedorError('O provedor de IA retornou uma resposta vazia.', 502);
    return texto;
  }
}

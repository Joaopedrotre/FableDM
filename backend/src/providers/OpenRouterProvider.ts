import { ProvedorError, type LLMProvider, type MensagemLLM } from './LLMProvider.js';
import { postarJson } from './http.js';

export type ModoRaciocinio = 'default' | 'off' | 'medium' | 'high';

interface RespostaOpenRouter {
  choices?: { finish_reason?: string | null; message?: { content?: string | null } }[];
  error?: { code?: number | string; message?: string };
}

export const URL_BASE_OPENROUTER = 'https://openrouter.ai/api/v1';

export function parametrosDeRaciocinio(modo: ModoRaciocinio): { reasoning?: { effort: string } } {
  if (modo === 'default') return {};
  return { reasoning: { effort: modo === 'off' ? 'none' : modo } };
}

export class OpenRouterProvider implements LLMProvider {
  constructor(
    private readonly chave: string,
    private readonly modelo: string,
    private readonly maxTokens: number,
    private readonly raciocinio: ModoRaciocinio = 'off',
    private readonly urlBase: string = URL_BASE_OPENROUTER
  ) {}

  async gerar(sistema: string, mensagens: MensagemLLM[]): Promise<string> {
    const dados = (await postarJson(
      `${this.urlBase.replace(/\/+$/, '')}/chat/completions`,
      { Authorization: `Bearer ${this.chave}` },
      {
        model: this.modelo,
        max_tokens: this.maxTokens,
        messages: [
          { role: 'system', content: sistema },
          ...mensagens.map((m) => ({ role: m.papel, content: m.conteudo }))
        ],
        ...parametrosDeRaciocinio(this.raciocinio)
      }
    )) as RespostaOpenRouter;

    if (dados.error) {
      const status = Number(dados.error.code);
      console.error('Erro do OpenRouter:', dados.error.code, dados.error.message);
      throw new ProvedorError('O provedor de IA retornou um erro.', Number.isInteger(status) ? status : 502);
    }

    const escolha = dados.choices?.[0];
    const texto = escolha?.message?.content?.trim() ?? '';
    if (!texto) {
      if (escolha?.finish_reason === 'length') {
        console.error('Resposta vazia: o limite de tokens foi consumido antes do texto final. Aumente LLM_MAX_TOKENS ou use LLM_REASONING=off.');
      }
      throw new ProvedorError('O provedor de IA retornou uma resposta vazia.', 502);
    }
    return texto;
  }
}

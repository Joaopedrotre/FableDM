import { env } from '../config/env.js';
import { AnthropicProvider } from './AnthropicProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import type { LLMProvider } from './LLMProvider.js';

export function criarProvider(): LLMProvider {
  if (env.LLM_PROVIDER === 'openai') {
    return new OpenAIProvider(env.LLM_API_KEY, env.LLM_MODEL, env.LLM_MAX_TOKENS, env.LLM_BASE_URL);
  }
  return new AnthropicProvider(env.LLM_API_KEY, env.LLM_MODEL, env.LLM_MAX_TOKENS, env.LLM_BASE_URL);
}

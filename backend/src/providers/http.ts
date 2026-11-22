import { env } from '../config/env.js';
import { ProvedorError } from './LLMProvider.js';

export async function postarJson(
  url: string,
  cabecalhos: Record<string, string>,
  corpo: unknown
): Promise<unknown> {
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...cabecalhos },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(env.LLM_TIMEOUT_MS)
    });
  } catch (erro) {
    console.error('Falha de conexão com o provedor de IA:', erro);
    throw new ProvedorError('Não foi possível conectar ao provedor de IA.', 0);
  }

  const texto = await resposta.text();
  if (!resposta.ok) {
    console.error('Erro do provedor de IA:', resposta.status, texto);
    throw new ProvedorError(`O provedor de IA retornou o erro ${resposta.status}.`, resposta.status);
  }

  try {
    return JSON.parse(texto) as unknown;
  } catch {
    throw new ProvedorError('Resposta inválida do provedor de IA.', 502);
  }
}

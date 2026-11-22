import { env } from '../config/env.js';
import { criarProvider } from '../providers/index.js';
import { removerRaciocinio } from '../services/removerRaciocinio.js';

const inicio = Date.now();

try {
  const resposta = await criarProvider().gerar('Responda em uma frase curta, em português do Brasil.', [
    { papel: 'user', conteudo: 'Cumprimente os aventureiros que acabaram de entrar na taverna.' }
  ]);
  console.log(`Provedor: ${env.LLM_PROVIDER} | Modelo: ${env.LLM_MODEL} | Tempo: ${Date.now() - inicio} ms`);
  console.log(removerRaciocinio(resposta));
} catch (erro) {
  console.error('Falha ao consultar o provedor de IA:', erro instanceof Error ? erro.message : 'erro desconhecido');
  process.exit(1);
}
process.exit(0);

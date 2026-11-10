const BLOCO_FECHADO = /<(think|thinking)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const FECHAMENTO_SOLTO = /<\/(think|thinking)\s*>/gi;
const ABERTURA_SEM_FIM = /<(think|thinking)\b[^>]*>[\s\S]*$/i;

export function removerRaciocinio(texto: string): string {
  let limpo = texto.replace(BLOCO_FECHADO, '');

  const fechamentos = [...limpo.matchAll(FECHAMENTO_SOLTO)];
  if (fechamentos.length > 0) {
    const ultimo = fechamentos[fechamentos.length - 1];
    limpo = limpo.slice((ultimo.index ?? 0) + ultimo[0].length);
  }

  return limpo.replace(ABERTURA_SEM_FIM, '').trim();
}

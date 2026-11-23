export type NoInline =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'quebra' }
  | { tipo: 'negrito'; filhos: NoInline[] }
  | { tipo: 'italico'; filhos: NoInline[] }
  | { tipo: 'codigo'; valor: string };

export type Bloco =
  | { tipo: 'paragrafo'; filhos: NoInline[] }
  | { tipo: 'titulo'; filhos: NoInline[] }
  | { tipo: 'citacao'; filhos: NoInline[] }
  | { tipo: 'lista'; ordenada: boolean; itens: NoInline[][] }
  | { tipo: 'separador' };

const PROFUNDIDADE_MAXIMA = 6;
const SEPARADOR = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const TITULO = /^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/;
const CITACAO = /^ {0,3}>\s?(.*)$/;
const ITEM_NAO_ORDENADO = /^\s{0,6}[-*+]\s+(.+)$/;
const ITEM_ORDENADO = /^\s{0,6}\d{1,3}[.)]\s+(.+)$/;

function ehEspaco(caractere: string | undefined): boolean {
  return caractere === undefined || /\s/.test(caractere);
}

function ehAlfanumerico(caractere: string | undefined): boolean {
  return caractere !== undefined && /[\p{L}\p{N}]/u.test(caractere);
}

function tamanhoDaSequencia(texto: string, inicio: number): number {
  const marcador = texto[inicio];
  let fim = inicio;
  while (texto[fim] === marcador) fim++;
  return fim - inicio;
}

function acharFechamento(
  texto: string,
  inicio: number,
  marcador: string,
  tamanho: number,
  falhas: Set<string>
): number {
  const chave = `${marcador}${tamanho}`;
  if (falhas.has(chave)) return -1;

  let posicao = inicio;
  while (posicao < texto.length) {
    const atual = texto[posicao];

    if (atual === '\\') {
      posicao += 2;
      continue;
    }

    if (atual === '`') {
      const fimDoCodigo = texto.indexOf('`', posicao + 1);
      posicao = fimDoCodigo === -1 ? posicao + 1 : fimDoCodigo + 1;
      continue;
    }

    if (atual === marcador) {
      const sequencia = tamanhoDaSequencia(texto, posicao);
      const fecha =
        sequencia === tamanho &&
        !ehEspaco(texto[posicao - 1]) &&
        (marcador === '*' || !ehAlfanumerico(texto[posicao + sequencia]));
      if (fecha) return posicao;
      posicao += sequencia;
      continue;
    }

    posicao++;
  }

  falhas.add(chave);
  return -1;
}

function analisarInline(texto: string, profundidade = 0): NoInline[] {
  const nos: NoInline[] = [];
  const falhas = new Set<string>();
  let buffer = '';

  const descarregar = () => {
    if (buffer) nos.push({ tipo: 'texto', valor: buffer });
    buffer = '';
  };

  let i = 0;
  while (i < texto.length) {
    const atual = texto[i];

    if (atual === '\n') {
      descarregar();
      nos.push({ tipo: 'quebra' });
      i++;
      continue;
    }

    if (atual === '\\' && i + 1 < texto.length && '*_`\\'.includes(texto[i + 1])) {
      buffer += texto[i + 1];
      i += 2;
      continue;
    }

    if (atual === '`') {
      const fim = texto.indexOf('`', i + 1);
      if (fim > i + 1) {
        descarregar();
        nos.push({ tipo: 'codigo', valor: texto.slice(i + 1, fim) });
        i = fim + 1;
        continue;
      }
      buffer += atual;
      i++;
      continue;
    }

    if ((atual === '*' || atual === '_') && profundidade < PROFUNDIDADE_MAXIMA) {
      const tamanho = tamanhoDaSequencia(texto, i);
      const abre =
        tamanho <= 3 &&
        !ehEspaco(texto[i + tamanho]) &&
        (atual === '*' || !ehAlfanumerico(texto[i - 1]));
      const fechamento = abre ? acharFechamento(texto, i + tamanho, atual, tamanho, falhas) : -1;
      const conteudo = fechamento === -1 ? '' : texto.slice(i + tamanho, fechamento);

      if (fechamento !== -1 && conteudo.trim() !== '') {
        descarregar();
        const filhos = analisarInline(conteudo, profundidade + 1);
        if (tamanho === 1) nos.push({ tipo: 'italico', filhos });
        else if (tamanho === 2) nos.push({ tipo: 'negrito', filhos });
        else nos.push({ tipo: 'negrito', filhos: [{ tipo: 'italico', filhos }] });
        i = fechamento + tamanho;
        continue;
      }

      buffer += texto.slice(i, i + tamanho);
      i += tamanho;
      continue;
    }

    buffer += atual;
    i++;
  }

  descarregar();
  return nos;
}

export function analisarMarkdown(texto: string): Bloco[] {
  const linhas = texto.replace(/\r\n?/g, '\n').split('\n');
  const blocos: Bloco[] = [];
  let paragrafo: string[] = [];

  const fecharParagrafo = () => {
    if (paragrafo.length > 0) {
      blocos.push({ tipo: 'paragrafo', filhos: analisarInline(paragrafo.join('\n')) });
      paragrafo = [];
    }
  };

  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];

    if (linha.trim() === '') {
      fecharParagrafo();
      i++;
      continue;
    }

    if (SEPARADOR.test(linha)) {
      fecharParagrafo();
      blocos.push({ tipo: 'separador' });
      i++;
      continue;
    }

    const titulo = TITULO.exec(linha);
    if (titulo) {
      fecharParagrafo();
      blocos.push({ tipo: 'titulo', filhos: analisarInline(titulo[1]) });
      i++;
      continue;
    }

    if (CITACAO.test(linha)) {
      fecharParagrafo();
      const citadas: string[] = [];
      while (i < linhas.length) {
        const correspondencia = CITACAO.exec(linhas[i]);
        if (!correspondencia) break;
        citadas.push(correspondencia[1]);
        i++;
      }
      blocos.push({ tipo: 'citacao', filhos: analisarInline(citadas.join('\n')) });
      continue;
    }

    const ordenada = ITEM_ORDENADO.test(linha);
    const padraoDeItem = ordenada ? ITEM_ORDENADO : ITEM_NAO_ORDENADO;
    if (padraoDeItem.test(linha)) {
      const itens: string[] = [];
      let fim = i;
      while (fim < linhas.length) {
        const correspondencia = padraoDeItem.exec(linhas[fim]);
        if (!correspondencia) break;
        itens.push(correspondencia[1]);
        fim++;
      }

      if (itens.length >= 2) {
        fecharParagrafo();
        blocos.push({ tipo: 'lista', ordenada, itens: itens.map((item) => analisarInline(item)) });
        i = fim;
        continue;
      }
    }

    paragrafo.push(linha.trim());
    i++;
  }

  fecharParagrafo();
  return blocos;
}

function contarInline(nos: NoInline[]): number {
  let total = 0;
  for (const no of nos) {
    if (no.tipo === 'texto' || no.tipo === 'codigo') total += no.valor.length;
    else if (no.tipo === 'quebra') total += 1;
    else total += contarInline(no.filhos);
  }
  return total;
}

export function contarCaracteres(blocos: Bloco[]): number {
  let total = 0;
  for (const bloco of blocos) {
    if (bloco.tipo === 'lista') total += bloco.itens.reduce((soma, item) => soma + contarInline(item), 0);
    else if (bloco.tipo === 'separador') total += 1;
    else total += contarInline(bloco.filhos);
  }
  return total;
}

function truncarInline(nos: NoInline[], restante: number): { nos: NoInline[]; restante: number } {
  const saida: NoInline[] = [];
  let sobra = restante;

  for (const no of nos) {
    if (sobra <= 0) break;

    if (no.tipo === 'texto' || no.tipo === 'codigo') {
      const valor = no.valor.slice(0, sobra);
      saida.push(no.tipo === 'texto' ? { tipo: 'texto', valor } : { tipo: 'codigo', valor });
      sobra -= valor.length;
    } else if (no.tipo === 'quebra') {
      saida.push(no);
      sobra -= 1;
    } else {
      const parcial = truncarInline(no.filhos, sobra);
      if (parcial.nos.length > 0) saida.push({ tipo: no.tipo, filhos: parcial.nos });
      sobra = parcial.restante;
    }
  }

  return { nos: saida, restante: sobra };
}

export function truncarBlocos(blocos: Bloco[], limite: number): Bloco[] {
  const saida: Bloco[] = [];
  let sobra = limite;

  for (const bloco of blocos) {
    if (sobra <= 0) break;

    if (bloco.tipo === 'separador') {
      saida.push(bloco);
      sobra -= 1;
    } else if (bloco.tipo === 'lista') {
      const itens: NoInline[][] = [];
      for (const item of bloco.itens) {
        if (sobra <= 0) break;
        const parcial = truncarInline(item, sobra);
        itens.push(parcial.nos);
        sobra = parcial.restante;
      }
      saida.push({ tipo: 'lista', ordenada: bloco.ordenada, itens });
    } else {
      const parcial = truncarInline(bloco.filhos, sobra);
      saida.push({ tipo: bloco.tipo, filhos: parcial.nos });
      sobra = parcial.restante;
    }
  }

  return saida;
}

const LADO_MAXIMO = 320;
const TAMANHO_MAXIMO_ARQUIVO = 8 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp'];

export class ErroImagem extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroImagem';
  }
}

export async function reduzirImagem(arquivo: File): Promise<string> {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    throw new ErroImagem('Use uma imagem PNG, JPEG ou WebP.');
  }
  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
    throw new ErroImagem('A imagem deve ter no máximo 8 MB.');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    throw new ErroImagem('Não foi possível ler a imagem.');
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.max(1, Math.round(bitmap.width * escala));
  const altura = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const contexto = canvas.getContext('2d');
  if (!contexto) {
    bitmap.close();
    throw new ErroImagem('Não foi possível processar a imagem.');
  }

  contexto.fillStyle = '#0c0907';
  contexto.fillRect(0, 0, largura, altura);
  contexto.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', 0.85);
}

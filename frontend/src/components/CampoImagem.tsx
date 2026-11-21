import { useState, type ChangeEvent } from 'react';
import Avatar from './Avatar';
import { ErroImagem, reduzirImagem } from '../utils/imagem';

interface Props {
  nome: string;
  valor: string | null;
  aoMudar: (imagem: string | null) => void;
  erro?: string;
}

export default function CampoImagem({ nome, valor, aoMudar, erro }: Props) {
  const [erroLocal, setErroLocal] = useState('');
  const [processando, setProcessando] = useState(false);

  async function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;

    setErroLocal('');
    setProcessando(true);
    try {
      aoMudar(await reduzirImagem(arquivo));
    } catch (falha) {
      setErroLocal(falha instanceof ErroImagem ? falha.message : 'Não foi possível usar esta imagem.');
    } finally {
      setProcessando(false);
    }
  }

  const mensagem = erroLocal || erro;

  return (
    <div className="campo">
      <label htmlFor="imagem">Imagem (opcional)</label>
      <div className="campo-imagem">
        <Avatar nome={nome || '?'} imagem={valor} tamanho="grande" />
        <div className="campo-imagem-acoes">
          <input
            id="imagem"
            name="imagem"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={escolher}
            disabled={processando}
            aria-describedby="imagem-dica"
          />
          {valor && (
            <button type="button" className="botao botao-secundario" onClick={() => aoMudar(null)}>
              Remover imagem
            </button>
          )}
          <p className="dica" id="imagem-dica">
            PNG, JPEG ou WebP. A imagem é reduzida automaticamente.
          </p>
        </div>
      </div>
      {mensagem && (
        <p className="erro" role="alert">
          {mensagem}
        </p>
      )}
    </div>
  );
}

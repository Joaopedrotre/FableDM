import { useEffect, type ReactNode } from 'react';
import Aviso from './Aviso';

interface Props {
  titulo: string;
  children: ReactNode;
  confirmando: boolean;
  erro?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

export default function ConfirmarExclusao({ titulo, children, confirmando, erro, aoConfirmar, aoCancelar }: Props) {
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape' && !confirmando) aoCancelar();
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoCancelar, confirmando]);

  return (
    <div className="modal-fundo" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-exclusao">
        <h2 id="titulo-exclusao">{titulo}</h2>
        <div className="modal-texto">{children}</div>
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
        <div className="modal-acoes">
          <button type="button" className="botao botao-secundario" onClick={aoCancelar} disabled={confirmando} autoFocus>
            Cancelar
          </button>
          <button type="button" className="botao botao-perigo" onClick={aoConfirmar} disabled={confirmando}>
            {confirmando ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

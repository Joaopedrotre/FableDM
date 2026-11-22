import { Link } from 'react-router-dom';
import type { Historia } from '../../../types';
import { formatarDataHora } from '../../../utils/formatar';

interface Props {
  historia: Historia;
  aoExcluir: (historia: Historia) => void;
}

export default function CartaoHistoria({ historia, aoExcluir }: Props) {
  return (
    <article className="cartao-lista">
      <div className="cartao-lista-topo">
        <h3>{historia.titulo}</h3>
      </div>
      <p className="dica">Campanha: {historia.campanhaNome}</p>
      <p className="cartao-lista-texto">{historia.resumo || 'Sem resumo.'}</p>
      <p className="dica">
        {historia.totalMensagens} mensagem(ns)
        <br />
        Última atividade: {formatarDataHora(historia.atualizadaEm)}
      </p>
      <div className="cartao-lista-acoes">
        <Link to={`/jogo/${historia.id}`} className="botao">
          Continuar
        </Link>
        <Link to={`/historias/${historia.id}/editar`} className="botao botao-secundario">
          Editar
        </Link>
        <button type="button" className="botao botao-perigo-suave" onClick={() => aoExcluir(historia)}>
          Excluir
        </button>
      </div>
    </article>
  );
}

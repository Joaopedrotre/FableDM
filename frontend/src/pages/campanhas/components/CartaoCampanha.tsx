import { Link } from 'react-router-dom';
import type { Campanha } from '../../../types';
import { formatarDataHora } from '../../../utils/formatar';

interface Props {
  campanha: Campanha;
  aoExcluir: (campanha: Campanha) => void;
}

export default function CartaoCampanha({ campanha, aoExcluir }: Props) {
  return (
    <article className="cartao-lista">
      <div className="cartao-lista-topo">
        <h3>{campanha.nome}</h3>
      </div>
      <p className="cartao-lista-texto">{campanha.descricao}</p>
      <p className="dica">
        Personagem: {campanha.personagemNome ?? 'nenhum'}
        <br />
        Última atividade: {formatarDataHora(campanha.atualizadaEm)}
      </p>
      <div className="cartao-lista-acoes">
        <Link to={`/jogo/${campanha.id}`} className="botao">
          Continuar aventura
        </Link>
        <Link to={`/campanhas/${campanha.id}/editar`} className="botao botao-secundario">
          Editar
        </Link>
        <button type="button" className="botao botao-perigo-suave" onClick={() => aoExcluir(campanha)}>
          Excluir
        </button>
      </div>
    </article>
  );
}

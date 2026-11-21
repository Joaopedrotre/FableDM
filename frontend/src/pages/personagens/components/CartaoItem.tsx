import { Link } from 'react-router-dom';
import type { Item } from '../../../types';

interface Props {
  item: Item;
  aoExcluir: (item: Item) => void;
}

export default function CartaoItem({ item, aoExcluir }: Props) {
  return (
    <article className="cartao-lista">
      <div className="cartao-lista-topo">
        <h3>{item.nome}</h3>
        <span className="quantidade">×{item.quantidade}</span>
      </div>
      <p className="cartao-lista-texto">{item.descricao || 'Sem descrição.'}</p>
      <div className="cartao-lista-acoes">
        <Link to={`/personagens/${item.personagemId}/itens/${item.id}/editar`} className="botao botao-secundario">
          Editar
        </Link>
        <button type="button" className="botao botao-perigo-suave" onClick={() => aoExcluir(item)}>
          Excluir
        </button>
      </div>
    </article>
  );
}

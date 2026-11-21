import { Link } from 'react-router-dom';
import Avatar from '../../../components/Avatar';
import type { Personagem } from '../../../types';

interface Props {
  personagem: Personagem;
  aoExcluir: (personagem: Personagem) => void;
}

export default function CartaoPersonagem({ personagem, aoExcluir }: Props) {
  return (
    <article className="cartao-lista">
      <div className="cartao-lista-topo">
        <Avatar nome={personagem.nome} imagem={personagem.imagem} />
        <h3>{personagem.nome}</h3>
      </div>
      <p className="cartao-lista-texto">{personagem.descricao}</p>
      <div className="cartao-lista-acoes">
        <Link to={`/personagens/${personagem.id}/itens`} className="botao">
          Itens
        </Link>
        <Link to={`/personagens/${personagem.id}/editar`} className="botao botao-secundario">
          Editar
        </Link>
        <button type="button" className="botao botao-perigo-suave" onClick={() => aoExcluir(personagem)}>
          Excluir
        </button>
      </div>
    </article>
  );
}

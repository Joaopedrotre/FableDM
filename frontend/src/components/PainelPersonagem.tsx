import { Link } from 'react-router-dom';
import type { Item, Personagem } from '../types';
import Avatar from './Avatar';

interface Props {
  campanhaId: number;
  personagem: Personagem | null;
  itens: Item[];
  totalItens: number;
}

export default function PainelPersonagem({ campanhaId, personagem, itens, totalItens }: Props) {
  if (!personagem) {
    return (
      <aside className="painel">
        <h2>Personagem</h2>
        <p>Nenhum personagem vinculado a esta campanha.</p>
        <Link to={`/campanhas/${campanhaId}/editar`} className="painel-link">
          Escolher um personagem
        </Link>
      </aside>
    );
  }

  const restantes = totalItens - itens.length;

  return (
    <aside className="painel">
      <Avatar nome={personagem.nome} imagem={personagem.imagem} />
      <h2>{personagem.nome}</h2>
      <p className="painel-texto">{personagem.descricao}</p>

      <h3>Itens</h3>
      {itens.length === 0 ? (
        <p>Nenhum item no inventário.</p>
      ) : (
        <ul className="lista-itens">
          {itens.map((item) => (
            <li key={item.id} title={item.descricao || undefined}>
              <span>{item.nome}</span>
              <span>×{item.quantidade}</span>
            </li>
          ))}
        </ul>
      )}
      {restantes > 0 && <p className="dica">e mais {restantes} item(ns)</p>}

      <Link to={`/personagens/${personagem.id}/itens`} className="painel-link">
        Gerenciar itens
      </Link>
    </aside>
  );
}

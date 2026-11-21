import { Link } from 'react-router-dom';
import type { Campanha } from '../types';

export default function PainelCampanha({ campanha }: { campanha: Pick<Campanha, 'id' | 'nome' | 'descricao'> }) {
  return (
    <aside className="painel">
      <h2>Campanha</h2>
      <h3>{campanha.nome}</h3>
      <p className="painel-texto">{campanha.descricao}</p>
      <Link to={`/campanhas/${campanha.id}/editar`} className="painel-link">
        Editar campanha
      </Link>
    </aside>
  );
}

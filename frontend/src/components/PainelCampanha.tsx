import { Link } from 'react-router-dom';
import type { Campanha, Historia } from '../types';

interface Props {
  campanha: Pick<Campanha, 'id' | 'nome' | 'descricao'>;
  historia: Pick<Historia, 'titulo'>;
}

export default function PainelCampanha({ campanha, historia }: Props) {
  return (
    <aside className="painel">
      <h2>Campanha</h2>
      <h3>{campanha.nome}</h3>
      <p className="painel-texto">{campanha.descricao}</p>
      <p className="dica">História: {historia.titulo}</p>
      <Link to={`/historias?campanha=${campanha.id}`} className="painel-link">
        Histórias desta campanha
      </Link>
      <br />
      <Link to={`/campanhas/${campanha.id}/editar`} className="painel-link">
        Editar campanha
      </Link>
    </aside>
  );
}
